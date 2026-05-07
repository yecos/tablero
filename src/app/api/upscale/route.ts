import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/lib/ai-providers'

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, imageUrl, scale = 2, enhancement = 'moderate' } = await request.json()

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json(
        { error: 'Image data is required (imageBase64 or imageUrl)' },
        { status: 400 },
      )
    }

    const enhancementLevel = enhancement === 'subtle' ? 'subtly enhanced' : enhancement === 'intense' ? 'sharply enhanced with maximum detail' : 'enhanced with more detail'

    const sizeMap: Record<number, string> = {
      2: '1344x768',
      4: '1440x720',
      8: '1440x720',
      10: '1440x720',
    }
    const targetSize = sizeMap[scale] || '1344x768'

    const prompt = `Ultra high resolution version of the original image, ${enhancementLevel}, professional quality, crisp details, 4K`

    const result = await generateImage(prompt, { size: targetSize })

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
