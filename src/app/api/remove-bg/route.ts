import { NextRequest, NextResponse } from 'next/server'
import { removeBackground } from '@/lib/ai-providers'

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, imageUrl, provider } = await request.json()

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
        console.error('[remove-bg] Failed to fetch image URL:', err)
      }
    }

    if (!imgSource) {
      return NextResponse.json({ error: 'Image data is required (imageBase64 or imageUrl)' }, { status: 400 })
    }

    const result = await removeBackground(imgSource, provider as string | undefined)

    return NextResponse.json({
      success: true,
      imageBase64: result.imageBase64,
      imageUrl: `data:image/png;base64,${result.imageBase64}`,
      provider: result.provider,
    })
  } catch (error) {
    console.error('[remove-bg] Error:', error)
    return NextResponse.json(
      { error: 'Failed to remove background. Please try again.' },
      { status: 500 }
    )
  }
}
