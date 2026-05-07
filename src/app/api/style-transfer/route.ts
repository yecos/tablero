import { NextRequest, NextResponse } from 'next/server'
import { transferStyle } from '@/lib/ai-providers'

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, imageUrl, stylePrompt, provider } = await request.json()

    if (!stylePrompt || typeof stylePrompt !== 'string') {
      return NextResponse.json({ error: 'stylePrompt is required' }, { status: 400 })
    }

    let imgSource: string | null = null

    if (imageBase64) {
      imgSource = imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`
    } else if (imageUrl) {
      try {
        const imgResponse = await fetch(imageUrl)
        if (imgResponse.ok) {
          const imgBuffer = Buffer.from(await imgResponse.arrayBuffer())
          const contentType = imgResponse.headers.get('content-type') || 'image/png'
          imgSource = `data:${contentType};base64,${imgBuffer.toString('base64')}`
        }
      } catch (err) {
        console.error('[style-transfer] Failed to fetch image URL:', err)
      }
    }

    if (!imgSource) {
      return NextResponse.json({ error: 'Image data is required (imageBase64 or imageUrl)' }, { status: 400 })
    }

    const result = await transferStyle(imgSource, stylePrompt, provider as string | undefined)

    return NextResponse.json({
      success: true,
      image: result.image,
      imageUrl: result.image,
      isBase64: result.isBase64,
      provider: result.provider,
    })
  } catch (error) {
    console.error('[style-transfer] Error:', error)
    return NextResponse.json(
      { error: 'Failed to apply style transfer. Please try again.' },
      { status: 500 }
    )
  }
}
