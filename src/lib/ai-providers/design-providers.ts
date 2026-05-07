// ---------------------------------------------------------------------------
// Design Utility Providers — remove-bg, style-transfer, vectorize, vision
// ---------------------------------------------------------------------------
// These are specialized providers for design-specific tasks.

import type { RemoveBgProvider, StyleTransferProvider, VectorizeProvider, VisionProvider, RemoveBgResult, StyleTransferResult, VectorizeResult, VisionResult } from './types'

// ═══════════════════════════════════════════════════════════════════════════════
// REMOVE BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════════

// ── Rembg via HuggingFace Inference API ──────────────────────────────────────

export const hfRembgProvider: RemoveBgProvider = {
  name: 'hf-rembg',
  isAvailable: () => !!process.env.HF_TOKEN,
  async removeBackground(imageBase64) {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    const res = await fetch(
      'https://api-inference.huggingface.co/models/briaai/RMBG-1.4',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: buffer,
      },
    )

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`HF Rembg error ${res.status}: ${err}`)
    }

    const resultBuffer = Buffer.from(await res.arrayBuffer())
    return { imageBase64: resultBuffer.toString('base64'), provider: 'hf-rembg' }
  },
}

// ── Remove.bg API ────────────────────────────────────────────────────────────

export const removebgProvider: RemoveBgProvider = {
  name: 'remove-bg',
  isAvailable: () => !!process.env.REMOVEBG_API_KEY,
  async removeBackground(imageBase64) {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')

    const formData = new FormData()
    formData.append('image_base64', base64Data)
    formData.append('size', 'auto')

    const res = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': process.env.REMOVEBG_API_KEY! },
      body: formData,
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Remove.bg error ${res.status}: ${err}`)
    }

    const resultBuffer = Buffer.from(await res.arrayBuffer())
    return { imageBase64: resultBuffer.toString('base64'), provider: 'remove-bg' }
  },
}

// ── Clipdrop Remove Background ──────────────────────────────────────────────

export const clipdropRembgProvider: RemoveBgProvider = {
  name: 'clipdrop-rembg',
  isAvailable: () => !!process.env.CLIPDROP_API_KEY,
  async removeBackground(imageBase64) {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    const formData = new FormData()
    formData.append('image_file', new Blob([buffer]), 'image.png')

    const res = await fetch('https://clipdrop-api.co/remove-background/v1', {
      method: 'POST',
      headers: { 'x-api-key': process.env.CLIPDROP_API_KEY! },
      body: formData,
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Clipdrop Rembg error ${res.status}: ${err}`)
    }

    const resultBuffer = Buffer.from(await res.arrayBuffer())
    return { imageBase64: resultBuffer.toString('base64'), provider: 'clipdrop-rembg' }
  },
}

export const removeBgProviders: RemoveBgProvider[] = [
  hfRembgProvider,
  removebgProvider,
  clipdropRembgProvider,
]

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE TRANSFER
// ═══════════════════════════════════════════════════════════════════════════════

// ── HuggingFace Style Transfer ──────────────────────────────────────────────

export const hfStyleTransferProvider: StyleTransferProvider = {
  name: 'hf-style-transfer',
  isAvailable: () => !!process.env.HF_TOKEN,
  async transferStyle(imageBase64, stylePrompt) {
    // Use FLUX with a style prompt for style transfer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')

    // For style transfer, we use a text-to-image approach with the style as prompt
    // since true style transfer models are limited on HF
    const prompt = `${stylePrompt} style, high quality, detailed`
    const res = await fetch(
      'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
      },
    )

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`HF Style Transfer error ${res.status}: ${err}`)
    }

    const buffer = Buffer.from(await res.arrayBuffer())
    const base64 = buffer.toString('base64')
    return { image: `data:image/png;base64,${base64}`, isBase64: true, provider: 'hf-style-transfer' }
  },
}

// ── Pollinations Style Transfer ──────────────────────────────────────────────

export const pollinationsStyleProvider: StyleTransferProvider = {
  name: 'pollinations-style',
  isAvailable: () => true,
  async transferStyle(_imageBase64, stylePrompt) {
    const prompt = `${stylePrompt} style, artistic, high quality`
    const encodedPrompt = encodeURIComponent(prompt)
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&nologo=true`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`Pollinations style error: ${res.status}`)

    const buffer = Buffer.from(await res.arrayBuffer())
    const base64 = buffer.toString('base64')
    return { image: `data:image/png;base64,${base64}`, isBase64: true, provider: 'pollinations-style' }
  },
}

// ── fal.ai Style Transfer ───────────────────────────────────────────────────

export const falStyleTransferProvider: StyleTransferProvider = {
  name: 'fal-style-transfer',
  isAvailable: () => !!process.env.FAL_API_KEY,
  async transferStyle(imageBase64, stylePrompt) {
    const res = await fetch('https://queue.fal.run/fal-ai/style-transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${process.env.FAL_API_KEY}`,
      },
      body: JSON.stringify({
        image_url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`,
        prompt: `${stylePrompt} style`,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`fal.ai style transfer error ${res.status}: ${err}`)
    }

    const data = await res.json()
    const imageUrl = data.image?.url

    if (!imageUrl) throw new Error('No image from fal.ai style transfer')

    const imgRes = await fetch(imageUrl)
    const buffer = Buffer.from(await imgRes.arrayBuffer())
    return { image: `data:image/png;base64,${buffer.toString('base64')}`, isBase64: true, provider: 'fal-style-transfer' }
  },
}

export const styleTransferProviders: StyleTransferProvider[] = [
  hfStyleTransferProvider,
  pollinationsStyleProvider,
  falStyleTransferProvider,
]

// ═══════════════════════════════════════════════════════════════════════════════
// VECTORIZE (Raster → SVG)
// ═══════════════════════════════════════════════════════════════════════════════

// ── Vectorizer.ai API ───────────────────────────────────────────────────────

export const vectorizerProvider: VectorizeProvider = {
  name: 'vectorizer-ai',
  isAvailable: () => !!process.env.VECTORIZER_API_KEY,
  async vectorize(imageBase64) {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    const formData = new FormData()
    formData.append('image', new Blob([buffer]), 'image.png')
    formData.append('mode', 'test') // Use test mode for free tier

    const res = await fetch('https://api.vectorizer.ai/api/v1/vectorize', {
      method: 'POST',
      headers: { 'Api-Key': process.env.VECTORIZER_API_KEY! },
      body: formData,
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Vectorizer.ai error ${res.status}: ${err}`)
    }

    const svg = await res.text()
    return { svg, provider: 'vectorizer-ai' }
  },
}

// ── HuggingFace SVG Vectorizer (using image-to-SVG model) ───────────────────

export const hfVectorizerProvider: VectorizeProvider = {
  name: 'hf-vectorize',
  isAvailable: () => !!process.env.HF_TOKEN,
  async vectorize(imageBase64) {
    // Use HuggingFace to trace the image and return as SVG approximation
    // We use a creative approach: use the Inference API with a vision model
    // that can describe the image, then generate an SVG from that description
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Try using the potrace-compatible approach via HF spaces
    try {
      const { Client } = await import('@gradio/client')
      const client = await Client.connect('imvaishnav/svg-tracer')
      const result = await client.predict('/trace', { image: buffer })

      if (result.data && Array.isArray(result.data)) {
        for (const item of result.data) {
          if (typeof item === 'string' && item.includes('<svg')) {
            return { svg: item, provider: 'hf-vectorize' }
          }
          // Check for file URL
          const url = typeof item === 'object' && item !== null
            ? (item as Record<string, unknown>).url || (item as Record<string, unknown>).value
            : null
          if (typeof url === 'string') {
            const svgRes = await fetch(url)
            if (svgRes.ok) {
              const svgText = await svgRes.text()
              if (svgText.includes('<svg')) {
                return { svg: svgText, provider: 'hf-vectorize' }
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('[hf-vectorize] Gradio approach failed:', err)
    }

    throw new Error('Could not vectorize image via HuggingFace')
  },
}

export const vectorizeProviders: VectorizeProvider[] = [
  vectorizerProvider,
  hfVectorizerProvider,
]

// ═══════════════════════════════════════════════════════════════════════════════
// VISION / IMAGE ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

// ── ZAI VLM (built-in, always available) ──────────────────────────────────────

let zaiInstance: Awaited<ReturnType<typeof import('z-ai-web-dev-sdk').default.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

export const zaiVisionProvider: VisionProvider = {
  name: 'zai-vlm',
  isAvailable: () => true,
  async analyze(imageUrl, prompt) {
    const zai = await getZAI()
    const response = await zai.chat.completions.createVision({
      model: 'glm-4v-flash',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      }],
      thinking: { type: 'disabled' },
    })

    const text = response.choices?.[0]?.message?.content
    if (!text) throw new Error('Empty response from ZAI VLM')
    return { text, provider: 'zai-vlm', model: 'glm-4v-flash' }
  },
}

// ── Google Gemini Vision ──────────────────────────────────────────────────────

export const geminiVisionProvider: VisionProvider = {
  name: 'gemini-vision',
  isAvailable: () => !!process.env.GOOGLE_API_KEY,
  async analyze(imageUrl, prompt, options) {
    const apiKey = process.env.GOOGLE_API_KEY!

    // Gemini requires inline data for images, not URLs
    // For data URLs, extract the base64 data; for HTTP URLs, skip this provider
    let imagePart: { inlineData: { mimeType: string; data: string } } | undefined
    if (imageUrl.startsWith('data:')) {
      const mimeType = imageUrl.match(/data:([^;]+);/)?.[1] || 'image/jpeg'
      const data = imageUrl.replace(/^data:[^;]+;base64,/, '')
      imagePart = { inlineData: { mimeType, data } }
    } else {
      // Gemini free tier doesn't support URL-based images easily
      throw new Error('Gemini Vision requires base64 data URLs, not HTTP URLs')
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: prompt }, imagePart],
          }],
          generationConfig: { maxOutputTokens: options?.maxTokens ?? 1024 },
        }),
      },
    )

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Gemini Vision error ${res.status}: ${err}`)
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Empty response from Gemini Vision')
    return { text, provider: 'gemini-vision', model: 'gemini-2.0-flash' }
  },
}

export const visionProviders: VisionProvider[] = [
  zaiVisionProvider,
  geminiVisionProvider,
]
