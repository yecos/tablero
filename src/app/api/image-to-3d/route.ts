import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@gradio/client'

export const maxDuration = 120
export const dynamic = 'force-dynamic'

interface GradioFileData {
  url?: string
  path?: string
  meta?: { _type: string }
  orig_name?: string
  mime_type?: string
  is_stream?: boolean
}

// Gradio v2.2 wraps file data in a { value: ... } structure
interface GradioValueWrapper {
  value?: GradioFileData | string
  _type?: string
}

/**
 * Extract a file URL from Gradio v2.2 response data.
 * Gradio v2.2 returns files as: { value: { url: "...", ... }, _type: "..." }
 * Older formats may return: { url: "...", ... } directly
 */
function extractFileUrl(item: unknown): string | null {
  if (typeof item === 'string') return item
  if (typeof item !== 'object' || item === null) return null

  const obj = item as Record<string, unknown>

  // Gradio v2.2 nested format: { value: { url: "..." } }
  if (obj.value && typeof obj.value === 'object' && obj.value !== null) {
    const inner = obj.value as Record<string, unknown>
    if (typeof inner.url === 'string') return inner.url
  }

  // Direct format: { url: "..." }
  if (typeof obj.url === 'string') return obj.url

  // Value might be a plain URL string
  if (typeof obj.value === 'string' && obj.value.startsWith('http')) return obj.value

  return null
}

async function callHunyuan3D(imageBase64: string): Promise<string | null> {
  try {
    console.log('[image-to-3d] Connecting to Hunyuan3D-2 space...')

    const client = await Client.connect('tencent/Hunyuan3D-2')

    console.log('[image-to-3d] Connected. Submitting image for 3D generation...')

    // Convert base64 to blob for Gradio
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Try /generation_all first (geometry + texture), fallback to /shape_generation (geometry only)
    const endpoints = ['/generation_all', '/shape_generation']
    let result: Awaited<ReturnType<typeof client.predict>> | null = null

    for (const endpoint of endpoints) {
      try {
        console.log(`[image-to-3d] Trying endpoint: ${endpoint}`)
        result = await client.predict(endpoint, {
          image: buffer,
        })
        console.log(`[image-to-3d] Endpoint ${endpoint} succeeded`)
        break
      } catch (endpointErr) {
        console.warn(`[image-to-3d] Endpoint ${endpoint} failed:`, endpointErr)
        continue
      }
    }

    if (!result) {
      console.error('[image-to-3d] All endpoints failed')
      return null
    }

    console.log('[image-to-3d] Got result from Hunyuan3D:', JSON.stringify(result.data).slice(0, 500))

    // Extract the GLB file URL from the result using robust parsing
    if (result.data && Array.isArray(result.data)) {
      for (const item of result.data) {
        const fileUrl = extractFileUrl(item)
        if (fileUrl) {
          console.log('[image-to-3d] Found GLB URL:', fileUrl)
          // Use client.fetch() to download with proper session cookies
          // HuggingFace Spaces require auth cookies for file downloads
          try {
            const glbResponse = await client.fetch(fileUrl)
            if (glbResponse.ok) {
              const glbBuffer = Buffer.from(await glbResponse.arrayBuffer())
              const magic = glbBuffer.slice(0, 4).toString('ascii')
              if (magic === 'glTF') {
                console.log('[image-to-3d] Valid GLB file downloaded, size:', (glbBuffer.length / 1024).toFixed(1), 'KB')
                return glbBuffer.toString('base64')
              } else {
                console.warn('[image-to-3d] Downloaded file is not a valid GLB (magic:', magic, ')')
              }
            } else {
              console.warn('[image-to-3d] Failed to fetch GLB:', glbResponse.status, glbResponse.statusText)
            }
          } catch (fetchErr) {
            console.warn('[image-to-3d] Error fetching GLB with client.fetch, trying raw fetch:', fetchErr)
            // Fallback to raw fetch
            const glbResponse = await fetch(fileUrl)
            if (glbResponse.ok) {
              const glbBuffer = Buffer.from(await glbResponse.arrayBuffer())
              const magic = glbBuffer.slice(0, 4).toString('ascii')
              if (magic === 'glTF') {
                return glbBuffer.toString('base64')
              }
            }
          }
        }
      }
    }

    return null
  } catch (error) {
    console.error('[image-to-3d] Hunyuan3D API error:', error)
    return null
  }
}

function createFallbackGLB(): string {
  // Create a minimal valid GLB file with a simple cube
  // This serves as a placeholder when the actual API is unavailable

  // JSON for a simple glTF scene with a cube
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
        roughnessFactor: 0.7
      },
      name: 'PurpleMaterial'
    }],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 24,
        type: 'VEC3',
        min: [-0.5, -0.5, -0.5],
        max: [0.5, 0.5, 0.5]
      },
      {
        bufferView: 1,
        componentType: 5125,
        count: 36,
        type: 'SCALAR'
      }
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 288 },
      { buffer: 0, byteOffset: 288, byteLength: 144 }
    ],
    buffers: [{ byteLength: 432 }]
  }

  const jsonStr = JSON.stringify(gltfJson)

  // Cube vertices (24 vertices, 6 faces with separate normals)
  const vertices = new Float32Array([
    // Front face
    -0.5, -0.5, 0.5,  0.5, -0.5, 0.5,  0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,
    // Back face
    -0.5, -0.5, -0.5,  -0.5, 0.5, -0.5,  0.5, 0.5, -0.5,  0.5, -0.5, -0.5,
    // Top face
    -0.5, 0.5, -0.5,  -0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5, -0.5,
    // Bottom face
    -0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5, -0.5, 0.5,  -0.5, -0.5, 0.5,
    // Right face
    0.5, -0.5, -0.5,  0.5, 0.5, -0.5,  0.5, 0.5, 0.5,  0.5, -0.5, 0.5,
    // Left face
    -0.5, -0.5, -0.5,  -0.5, -0.5, 0.5,  -0.5, 0.5, 0.5,  -0.5, 0.5, -0.5,
  ])

  // Indices for 12 triangles
  const indices = new Uint32Array([
    0, 1, 2,  0, 2, 3,    // front
    4, 5, 6,  4, 6, 7,    // back
    8, 9, 10, 8, 10, 11,  // top
    12, 13, 14, 12, 14, 15, // bottom
    16, 17, 18, 16, 18, 19, // right
    20, 21, 22, 20, 22, 23, // left
  ])

  const vertexBuffer = Buffer.from(vertices.buffer)
  const indexBuffer = Buffer.from(indices.buffer)
  const binBuffer = Buffer.concat([vertexBuffer, indexBuffer])

  // Encode JSON to UTF-8
  const jsonBuffer = Buffer.from(jsonStr, 'utf-8')

  // Pad JSON and BIN to 4-byte alignment
  const jsonPadLength = (4 - (jsonBuffer.length % 4)) % 4
  const jsonPadded = Buffer.concat([jsonBuffer, Buffer.alloc(jsonPadLength, 0x20)]) // 0x20 = space

  const binPadLength = (4 - (binBuffer.length % 4)) % 4
  const binPadded = Buffer.concat([binBuffer, Buffer.alloc(binPadLength, 0)])

  // GLB header (12 bytes) + JSON chunk (8 + data) + BIN chunk (8 + data)
  const headerLength = 12
  const jsonChunkLength = 8 + jsonPadded.length
  const binChunkLength = 8 + binPadded.length
  const totalLength = headerLength + jsonChunkLength + binChunkLength

  const glbBuffer = Buffer.alloc(totalLength)

  // Write header
  glbBuffer.writeUInt32LE(0x46546C67, 0)  // magic: "glTF"
  glbBuffer.writeUInt32LE(2, 4)            // version: 2
  glbBuffer.writeUInt32LE(totalLength, 8)   // total length

  // Write JSON chunk
  let offset = 12
  glbBuffer.writeUInt32LE(jsonPadded.length, offset)      // chunk length
  glbBuffer.writeUInt32LE(0x4E4F534A, offset + 4)         // chunk type: "JSON"
  jsonPadded.copy(glbBuffer, offset + 8)

  // Write BIN chunk
  offset = 12 + jsonChunkLength
  glbBuffer.writeUInt32LE(binPadded.length, offset)        // chunk length
  glbBuffer.writeUInt32LE(0x004E4942, offset + 4)          // chunk type: "BIN"
  binPadded.copy(glbBuffer, offset + 8)

  return glbBuffer.toString('base64')
}

export async function POST(request: NextRequest) {
  console.log('[image-to-3d] Request received')

  try {
    const body = await request.json()
    const { imageBase64, imageUrl } = body

    let imgSource: string | null = null

    if (imageBase64) {
      // Ensure proper data URL format
      if (imageBase64.startsWith('data:')) {
        imgSource = imageBase64
      } else {
        imgSource = `data:image/jpeg;base64,${imageBase64}`
      }
    } else if (imageUrl) {
      // Fetch the image and convert to base64
      try {
        const imgResponse = await fetch(imageUrl)
        if (imgResponse.ok) {
          const imgBuffer = Buffer.from(await imgResponse.arrayBuffer())
          const contentType = imgResponse.headers.get('content-type') || 'image/jpeg'
          imgSource = `data:${contentType};base64,${imgBuffer.toString('base64')}`
        }
      } catch (fetchErr) {
        console.error('[image-to-3d] Failed to fetch image URL:', fetchErr)
      }
    }

    if (!imgSource) {
      return NextResponse.json(
        { error: 'Image data is required (imageBase64 or imageUrl)' },
        { status: 400 }
      )
    }

    // Try the Hunyuan3D API
    const glbBase64 = await callHunyuan3D(imgSource)

    if (glbBase64) {
      console.log('[image-to-3d] Successfully generated 3D model, size:', (glbBase64.length * 0.75 / 1024).toFixed(1), 'KB')
      return NextResponse.json({
        success: true,
        modelData: glbBase64,
        fallback: false,
      })
    }

    // Fallback: return a simple cube GLB
    console.log('[image-to-3d] Using fallback 3D model (cube)')
    const fallbackData = createFallbackGLB()

    return NextResponse.json({
      success: true,
      modelData: fallbackData,
      fallback: true,
      message: '3D generation service unavailable. Using placeholder model.',
    })
  } catch (error) {
    console.error('[image-to-3d] Unhandled error:', error)

    // Return fallback even on error
    const fallbackData = createFallbackGLB()
    return NextResponse.json({
      success: true,
      modelData: fallbackData,
      fallback: true,
      message: '3D generation failed. Using placeholder model.',
    })
  }
}
