import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/lib/ai-providers'

export async function POST(request: NextRequest) {
  try {
    const { prompt, negativePrompt, size = '1024x1024', style = 'vivid', provider } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Use the provider system with automatic fallback
    const result = await generateImage(prompt, { size, negativePrompt, style }, provider as string | undefined)

    // Build the image URL or data URL
    let imageUrl: string | null = null
    if (result.isBase64) {
      imageUrl = result.url // Already a data URL
    } else {
      imageUrl = result.url // Remote URL
    }

    // Return in format that works for both direct use and workflow engine
    return NextResponse.json({
      url: imageUrl,            // Workflow engine checks this first
      imageUrl: imageUrl,       // Also available
      image: imageUrl,          // Also available
      base64: result.isBase64 ? result.url.replace(/^data:image\/\w+;base64,/, '') : null,
      prompt,
      size,
      style,
      provider: result.provider,
      model: result.model,
    })
  } catch (error) {
    console.error('Image generation API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image. Please try again.' },
      { status: 500 }
    )
  }
}
