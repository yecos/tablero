import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/lib/ai-providers'

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, imageUrl, direction = 'all', aspectRatio = '16:9' } = await request.json()

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json(
        { error: 'Image data is required (imageBase64 or imageUrl)' },
        { status: 400 },
      )
    }

    const directionMap: Record<string, string> = {
      up: 'extended upward with more sky and ceiling space',
      down: 'extended downward with more ground and floor space',
      left: 'extended to the left with more background',
      right: 'extended to the right with more background',
      all: 'extended in all directions with more context and background',
    }

    const directionDesc = directionMap[direction] || directionMap.all

    const sizeMap: Record<string, string> = {
      '16:9': '1344x768',
      '9:16': '768x1344',
      '4:3': '1152x864',
      '3:4': '864x1152',
      '1:1': '1024x1024',
    }
    const targetSize = sizeMap[aspectRatio] || '1344x768'

    const prompt = `Seamlessly ${directionDesc}, maintaining the original style and composition, professional quality, expanded canvas`

    const result = await generateImage(prompt, { size: targetSize })

    return NextResponse.json({
      imageUrl: result.url,
      base64: result.isBase64 ? result.url.replace(/^data:image\/\w+;base64,/, '') : null,
      direction,
      aspectRatio,
      provider: result.provider,
    })
  } catch (error) {
    console.error('Extend image API error:', error)
    return NextResponse.json(
      { error: 'Failed to extend image. Please try again.' },
      { status: 500 },
    )
  }
}
