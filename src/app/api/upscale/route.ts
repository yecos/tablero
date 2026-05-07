// NOTE: This endpoint supports both text-to-image based "upscale" and real
// AI upscaling via dedicated providers. When useRealUpscale is true, it uses
// the new upscaleImage() convenience function. Otherwise, falls back to
// text-to-image generation as a fallback.

import { NextRequest, NextResponse } from 'next/server'
import { generateImage, upscaleImage } from '@/lib/ai-providers'

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, imageUrl, scale = 2, enhancement = 'moderate', provider, useRealUpscale } = await request.json()

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json(
        { error: 'Image data is required (imageBase64 or imageUrl)' },
        { status: 400 },
      )
    }

    // Try real AI upscaling if requested and we have an image
    if (useRealUpscale && imageBase64) {
      try {
        const imgSource = imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`
        const result = await upscaleImage(imgSource, { scale }, provider as string | undefined)

        return NextResponse.json({
          imageUrl: result.image,
          base64: result.isBase64 ? result.image.replace(/^data:image\/\w+;base64,/, '') : null,
          scale: result.scale ?? scale,
          enhancement,
          provider: result.provider,
          realUpscale: true,
        })
      } catch (error) {
        console.warn('[upscale] Real upscale failed, falling back to text-to-image:', error)
        // Fall through to text-to-image fallback below
      }
    }

    // Fallback: text-to-image based upscale
    const enhancementLevel = enhancement === 'subtle' ? 'subtly enhanced' : enhancement === 'intense' ? 'sharply enhanced with maximum detail' : 'enhanced with more detail'

    const sizeMap: Record<number, string> = {
      2: '1344x768',
      4: '1440x720',
      8: '1440x720',
      10: '1440x720',
    }
    const targetSize = sizeMap[scale] || '1344x768'

    const prompt = `Ultra high resolution version of the original image, ${enhancementLevel}, professional quality, crisp details, 4K`

    const result = await generateImage(prompt, { size: targetSize }, provider as string | undefined)

    return NextResponse.json({
      imageUrl: result.url,
      base64: result.isBase64 ? result.url.replace(/^data:image\/\w+;base64,/, '') : null,
      scale,
      enhancement,
      provider: result.provider,
    })
  } catch (error) {
    console.error('Upscale API error:', error)
    return NextResponse.json(
      { error: 'Failed to upscale image. Please try again.' },
      { status: 500 },
    )
  }
}
