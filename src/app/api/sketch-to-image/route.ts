import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/lib/ai-providers'

export async function POST(request: NextRequest) {
  try {
    const { prompt, sketchBase64, style = 'natural' } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 },
      )
    }

    const styleMap: Record<string, string> = {
      vivid: 'vivid colors, vibrant, dramatic lighting',
      natural: 'natural, photorealistic, realistic lighting',
      cinematic: 'cinematic, moody, film-like, anamorphic',
      anime: 'anime style, cel-shaded, Japanese animation',
      illustration: 'digital illustration, artistic, hand-drawn feel',
    }

    const styleDesc = styleMap[style] || styleMap.natural
    const enhancedPrompt = `Based on a sketch: ${prompt}. ${styleDesc}. High quality, detailed, professional`

    const result = await generateImage(enhancedPrompt, { size: '1024x1024', style })

    return NextResponse.json({
      imageUrl: result.url,
      base64: result.isBase64 ? result.url.replace(/^data:image\/\w+;base64,/, '') : null,
      prompt,
      style,
      provider: result.provider,
    })
  } catch (error) {
    console.error('Sketch-to-image API error:', error)
    return NextResponse.json(
      { error: 'Failed to convert sketch to image. Please try again.' },
      { status: 500 },
    )
  }
}
