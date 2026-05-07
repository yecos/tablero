import { NextRequest, NextResponse } from 'next/server'
import { generate3D } from '@/lib/ai-providers'
import { createFallbackGLB } from '@/lib/ai-providers/threed-providers'

export const maxDuration = 120
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  console.log('[image-to-3d] Request received')

  try {
    const body = await request.json()
    const { imageBase64, imageUrl } = body

    let imgSource: string | null = null

    if (imageBase64) {
      if (imageBase64.startsWith('data:')) {
        imgSource = imageBase64
      } else {
        imgSource = `data:image/jpeg;base64,${imageBase64}`
      }
    } else if (imageUrl) {
      try {
        const imgResponse = await fetch(imageUrl)
        if (imgResponse.ok) {
          const imgBuffer = Buffer.from(await imgResponse.arrayBuffer())
          const contentType = imgResponse.headers.get('content-type') || 'image/jpeg'
          imgSource = `data:${contentType};base64,${imgBuffer.toString('base64')}`
        }
      } catch (fetchErr) {
        console.error('[image-to-3d] Failed to fetch image URL:', fetchErr)
      }
    }

    if (!imgSource) {
      return NextResponse.json(
        { error: 'Image data is required (imageBase64 or imageUrl)' },
        { status: 400 }
      )
    }

    // Use the provider system with automatic fallback
    try {
      const result = await generate3D(imgSource)
      console.log('[image-to-3d] Successfully generated 3D model via', result.provider,
        'size:', (result.modelBase64.length * 0.75 / 1024).toFixed(1), 'KB')

      return NextResponse.json({
        success: true,
        modelData: result.modelBase64,
        fallback: result.isFallback ?? false,
        provider: result.provider,
      })
    } catch (providerError) {
      console.warn('[image-to-3d] All providers failed, using fallback cube:', providerError)

      // Ultimate fallback: return a simple cube GLB
      const fallbackData = createFallbackGLB()
      return NextResponse.json({
        success: true,
        modelData: fallbackData,
        fallback: true,
        provider: 'fallback-cube',
        message: '3D generation service unavailable. Using placeholder model.',
      })
    }
  } catch (error) {
    console.error('[image-to-3d] Unhandled error:', error)

    // Return fallback even on error
    const fallbackData = createFallbackGLB()
    return NextResponse.json({
      success: true,
      modelData: fallbackData,
      fallback: true,
      provider: 'fallback-cube',
      message: '3D generation failed. Using placeholder model.',
    })
  }
}
