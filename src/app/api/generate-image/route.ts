import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, negativePrompt, size = '1024x1024', style = 'vivid' } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const validSizes = ['1024x1024', '1344x768', '768x1344', '864x1152', '1152x864', '1440x720', '720x1440']
    const imageSize = validSizes.includes(size) ? size : '1024x1024'

    // Enhance prompt with style and negative prompt if provided
    let enhancedPrompt = prompt
    if (style && style !== 'vivid') {
      enhancedPrompt = `${prompt}, ${style} style`
    }
    if (negativePrompt && negativePrompt.trim()) {
      // Note: the SDK may not support negative prompts directly,
      // but we include it in the prompt context for better results
      enhancedPrompt = `${prompt}${style && style !== 'vivid' ? `, ${style} style` : ''}. Avoid: ${negativePrompt}`
    }

    const zai = await getZAI()

    const response = await zai.images.generations.create({
      prompt: enhancedPrompt,
      size: imageSize,
    })

    if (!response.data || response.data.length === 0) {
      return NextResponse.json({ error: 'No image was generated. Please try a different prompt.' }, { status: 500 })
    }

    const imageData = response.data[0] as { base64?: string; url?: string; b64_json?: string }

    // Build the image URL or data URL
    let imageUrl: string | null = null
    if (imageData.url) {
      imageUrl = imageData.url
    } else if (imageData.b64_json || imageData.base64) {
      imageUrl = `data:image/png;base64,${imageData.b64_json || imageData.base64}`
    }

    // Return in format that works for both direct use and workflow engine
    // Workflow engine looks for: data.url, data.imageUrl, data.image
    return NextResponse.json({
      url: imageUrl,            // Workflow engine checks this first
      imageUrl: imageUrl,       // Also available
      image: imageUrl,          // Also available
      base64: imageData.b64_json || imageData.base64 || null,
      prompt,
      size: imageSize,
      style,
    })
  } catch (error) {
    console.error('Image generation API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image. Please try again.' },
      { status: 500 }
    )
  }
}
