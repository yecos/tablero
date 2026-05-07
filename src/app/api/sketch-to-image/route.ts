// NOTE: This endpoint now uses the real transformImage() function for
// sketch-to-image when a sketch is provided. Falls back to text-to-image
// if transform fails.

import { NextRequest, NextResponse } from 'next/server'
import { generateImage, transformImage } from '@/lib/ai-providers'

export async function POST(request: NextRequest) {
  try {
    const { prompt, sketchBase64, style = 'natural', provider } = await request.json()

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

    // Try real image-to-image transformation if we have a sketch
    if (sketchBase64) {
      try {
        const imgSource = sketchBase64.startsWith('data:') ? sketchBase64 : `data:image/png;base64,${sketchBase64}`
        const result = await transformImage(imgSource, enhancedPrompt, { strength: 0.7 }, provider as string | undefined)

        return NextResponse.json({
          imageUrl: result.image,
          base64: result.isBase64 ? result.image.replace(/^data:image\/\w+;base64,/, '') : null,
          prompt,
          style,
          provider: result.provider,
          realTransform: true,
        })
      } catch (error) {
        console.warn('[sketch-to-image] Transform failed, falling back to text-to-image:', error)
        // Fall through to text-to-image fallback below
      }
    }

    // Fallback: text-to-image based sketch-to-image
    const result = await generateImage(enhancedPrompt, { size: '1024x1024', style }, provider as string | undefined)

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
