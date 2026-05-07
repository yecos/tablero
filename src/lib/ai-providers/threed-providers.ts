// ---------------------------------------------------------------------------
// 3D Generation Providers — with automatic fallback
// ---------------------------------------------------------------------------
// Priority: Hunyuan3D via Gradio (existing) → Tripo3D → SF3D → fal.ai

import type { ThreeDProvider, ThreeDGenResult } from './types'

// ── Hunyuan3D-2 via HuggingFace Gradio (existing, free) ─────────────────────

function extractFileUrl(item: unknown): string | null {
  if (typeof item === 'string') return item
  if (typeof item !== 'object' || item === null) return null
  const obj = item as Record<string, unknown>
  if (obj.value && typeof obj.value === 'object' && obj.value !== null) {
    const inner = obj.value as Record<string, unknown>
    if (typeof inner.url === 'string') return inner.url
  }
  if (typeof obj.url === 'string') return obj.url
  if (typeof obj.value === 'string' && obj.value.startsWith('http')) return obj.value
  return null
}

export const hunyuan3dProvider: ThreeDProvider = {
  name: 'hunyuan3d-gradio',
  isAvailable: () => true, // Always available via public HF Space
  async generate(imageBase64) {
    const { Client } = await import('@gradio/client')
    const client = await Client.connect('tencent/Hunyuan3D-2')

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    const endpoints = ['/generation_all', '/shape_generation']
    let result: Awaited<ReturnType<typeof client.predict>> | null = null

    for (const endpoint of endpoints) {
      try {
        result = await client.predict(endpoint, { image: buffer })
        break
      } catch {
        continue
      }
    }

    if (!result) throw new Error('All Hunyuan3D endpoints failed')

    if (result.data && Array.isArray(result.data)) {
      for (const item of result.data) {
        const fileUrl = extractFileUrl(item)
        if (fileUrl) {
          try {
            const glbResponse = await client.fetch(fileUrl)
            if (glbResponse.ok) {
              const glbBuffer = Buffer.from(await glbResponse.arrayBuffer())
              const magic = glbBuffer.slice(0, 4).toString('ascii')
              if (magic === 'glTF') {
                return { modelBase64: glbBuffer.toString('base64'), provider: 'hunyuan3d-gradio' }
              }
            }
          } catch {
            const glbResponse = await fetch(fileUrl)
            if (glbResponse.ok) {
              const glbBuffer = Buffer.from(await glbResponse.arrayBuffer())
              const magic = glbBuffer.slice(0, 4).toString('ascii')
              if (magic === 'glTF') {
                return { modelBase64: glbBuffer.toString('base64'), provider: 'hunyuan3d-gradio' }
              }
            }
          }
        }
      }
    }

    throw new Error('No GLB file found in Hunyuan3D response')
  },
}

// ── Tripo3D API (2,000 free credits) ────────────────────────────────────────

export const tripo3dProvider: ThreeDProvider = {
  name: 'tripo3d',
  isAvailable: () => !!process.env.TRIPO_API_KEY,
  async generate(imageBase64) {
    // Step 1: Upload image and create conversion task
    const createRes = await fetch('https://api.tripo3d.ai/v2/openapi/task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TRIPO_API_KEY}`,
      },
      body: JSON.stringify({
        type: 'image_to_model',
        file: imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`,
        model_version: 'V3.1',
      }),
    })

    if (!createRes.ok) {
      const err = await createRes.text()
      throw new Error(`Tripo3D create error ${createRes.status}: ${err}`)
    }

    const createData = await createRes.json()
    const taskId = createData.data?.task_id
    if (!taskId) throw new Error('No task_id from Tripo3D')

    // Step 2: Poll for completion (max 120 seconds)
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 2000))

      const pollRes = await fetch(`https://api.tripo3d.ai/v2/openapi/task/${taskId}`, {
        headers: { Authorization: `Bearer ${process.env.TRIPO_API_KEY}` },
      })

      if (!pollRes.ok) continue

      const pollData = await pollRes.json()
      const status = pollData.data?.status

      if (status === 'success') {
        const modelUrl = pollData.data?.model?.[0]?.url || pollData.data?.output?.model
        if (!modelUrl) throw new Error('No model URL in Tripo3D response')

        // Download GLB
        const glbRes = await fetch(modelUrl)
        if (!glbRes.ok) throw new Error('Failed to download Tripo3D model')
        const glbBuffer = Buffer.from(await glbRes.arrayBuffer())
        return { modelBase64: glbBuffer.toString('base64'), provider: 'tripo3d' }
      }

      if (status === 'failed') {
        throw new Error(`Tripo3D task failed: ${JSON.stringify(pollData.data)}`)
      }
    }

    throw new Error('Tripo3D task timed out after 120s')
  },
}

// ── Stable Fast 3D via HuggingFace (free, fast 0.5s) ────────────────────────

export const sf3dProvider: ThreeDProvider = {
  name: 'sf3d-huggingface',
  isAvailable: () => !!process.env.HF_TOKEN,
  async generate(imageBase64) {
    const { Client } = await import('@gradio/client')
    const client = await Client.connect('stabilityai/stable-fast-3d')

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    const result = await client.predict('/generate', { image: buffer })

    if (result.data && Array.isArray(result.data)) {
      for (const item of result.data) {
        const fileUrl = extractFileUrl(item)
        if (fileUrl) {
          const glbResponse = await fetch(fileUrl)
          if (glbResponse.ok) {
            const glbBuffer = Buffer.from(await glbResponse.arrayBuffer())
            const magic = glbBuffer.slice(0, 4).toString('ascii')
            if (magic === 'glTF') {
              return { modelBase64: glbBuffer.toString('base64'), provider: 'sf3d-huggingface' }
            }
          }
        }
      }
    }

    throw new Error('No GLB file found in SF3D response')
  },
}

// ── fal.ai 3D (multi-model, $10 free credits) ──────────────────────────────

export const fal3dProvider: ThreeDProvider = {
  name: 'fal-ai-3d',
  isAvailable: () => !!process.env.FAL_API_KEY,
  async generate(imageBase64) {
    // Upload image to fal.ai storage first
    const uploadRes = await fetch('https://fal.run/fal-ai/any-to-3d', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${process.env.FAL_API_KEY}`,
      },
      body: JSON.stringify({
        image_url: imageBase64.startsWith('data:')
          ? imageBase64
          : `data:image/png;base64,${imageBase64}`,
      }),
    })

    if (!uploadRes.ok) {
      const err = await uploadRes.text()
      throw new Error(`fal.ai 3D error ${uploadRes.status}: ${err}`)
    }

    const data = await uploadRes.json()
    const modelUrl = data.model?.url || data.obj?.url || data.glb?.url

    if (!modelUrl) throw new Error('No model URL from fal.ai 3D')

    const glbRes = await fetch(modelUrl)
    if (!glbRes.ok) throw new Error('Failed to download fal.ai 3D model')
    const glbBuffer = Buffer.from(await glbRes.arrayBuffer())

    return { modelBase64: glbBuffer.toString('base64'), provider: 'fal-ai-3d' }
  },
}

// ── Fallback cube generator ─────────────────────────────────────────────────

export function createFallbackGLB(): string {
  const gltfJson = {
    asset: { version: '2.0', generator: 'tablero-fallback' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 0 }] }],
    materials: [{
      pbrMetallicRoughness: {
        baseColorFactor: [0.545, 0.361, 0.965, 1.0],
        metallicFactor: 0.3,
        roughnessFactor: 0.7,
      },
      name: 'PurpleMaterial',
    }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 24, type: 'VEC3', min: [-0.5, -0.5, -0.5], max: [0.5, 0.5, 0.5] },
      { bufferView: 1, componentType: 5125, count: 36, type: 'SCALAR' },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 288 },
      { buffer: 0, byteOffset: 288, byteLength: 144 },
    ],
    buffers: [{ byteLength: 432 }],
  }

  const vertices = new Float32Array([
    -0.5,-0.5,0.5, 0.5,-0.5,0.5, 0.5,0.5,0.5, -0.5,0.5,0.5,
    -0.5,-0.5,-0.5, -0.5,0.5,-0.5, 0.5,0.5,-0.5, 0.5,-0.5,-0.5,
    -0.5,0.5,-0.5, -0.5,0.5,0.5, 0.5,0.5,0.5, 0.5,0.5,-0.5,
    -0.5,-0.5,-0.5, 0.5,-0.5,-0.5, 0.5,-0.5,0.5, -0.5,-0.5,0.5,
    0.5,-0.5,-0.5, 0.5,0.5,-0.5, 0.5,0.5,0.5, 0.5,-0.5,0.5,
    -0.5,-0.5,-0.5, -0.5,-0.5,0.5, -0.5,0.5,0.5, -0.5,0.5,-0.5,
  ])
  const indices = new Uint32Array([
    0,1,2, 0,2,3, 4,5,6, 4,6,7, 8,9,10, 8,10,11,
    12,13,14, 12,14,15, 16,17,18, 16,18,19, 20,21,22, 20,22,23,
  ])

  const jsonBuffer = Buffer.from(JSON.stringify(gltfJson), 'utf-8')
  const binBuffer = Buffer.concat([Buffer.from(vertices.buffer), Buffer.from(indices.buffer)])
  const jsonPad = (4 - (jsonBuffer.length % 4)) % 4
  const binPad = (4 - (binBuffer.length % 4)) % 4
  const jsonPadded = Buffer.concat([jsonBuffer, Buffer.alloc(jsonPad, 0x20)])
  const binPadded = Buffer.concat([binBuffer, Buffer.alloc(binPad, 0)])
  const total = 12 + 8 + jsonPadded.length + 8 + binPadded.length
  const glb = Buffer.alloc(total)

  glb.writeUInt32LE(0x46546C67, 0)
  glb.writeUInt32LE(2, 4)
  glb.writeUInt32LE(total, 8)
  let off = 12
  glb.writeUInt32LE(jsonPadded.length, off); glb.writeUInt32LE(0x4E4F534A, off + 4); jsonPadded.copy(glb, off + 8)
  off = 12 + 8 + jsonPadded.length
  glb.writeUInt32LE(binPadded.length, off); glb.writeUInt32LE(0x004E4942, off + 4); binPadded.copy(glb, off + 8)

  return glb.toString('base64')
}

export const fallback3dProvider: ThreeDProvider = {
  name: 'fallback-cube',
  isAvailable: () => true,
  async generate() {
    return { modelBase64: createFallbackGLB(), provider: 'fallback-cube', isFallback: true }
  },
}

// ── Ordered provider list for fallback ───────────────────────────────────────

export const threeDProviders: ThreeDProvider[] = [
  hunyuan3dProvider,
  tripo3dProvider,
  sf3dProvider,
  fal3dProvider,
  fallback3dProvider,
]
