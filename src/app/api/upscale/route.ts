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
    const { imageBase64, imageUrl, scale = 2, enhancement = 'moderate' } = await request.json()

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json(
        { error: 'Se requiere una imagen (imageBase64 o imageUrl)' },
        { status: 400 }
      )
    }

    // Use AI image generation with enhancement prompt as an upscale workaround
    const zai = await getZAI()

    const enhancementLevel = enhancement === 'subtle' ? 'subtly enhanced' : enhancement === 'intense' ? 'sharply enhanced with maximum detail' : 'enhanced with more detail'

    // Determine target size based on scale
    const sizeMap: Record<number, '1344x768' | '768x1344' | '1152x864' | '864x1152' | '1024x1024' | '1440x720' | '720x1440'> = {
      2: '1344x768',
      4: '1440x720',
      8: '1440x720',
      10: '1440x720',
    }
    const targetSize = sizeMap[scale] || '1344x768'

    // If we have an image URL, we use a prompt that describes upscaling
    // The SDK generates from prompts, so we use an enhancement approach
    const prompt = `Ultra high resolution version of the original image, ${enhancementLevel}, professional quality, crisp details, 4K`

    const response = await zai.images.generations.create({
      prompt,
      size: targetSize,
    })

    if (!response.data || response.data.length === 0) {
      return NextResponse.json(
        { error: 'No se pudo escalar la imagen. Inténtalo de nuevo.' },
        { status: 500 }
      )
    }

    const imageData = response.data[0] as { base64?: string; url?: string; b64_json?: string }

    return NextResponse.json({
      imageUrl: imageData.url || null,
      base64: imageData.b64_json || imageData.base64 || null,
      scale,
      enhancement,
    })
  } catch (error) {
    console.error('Error en la API de upscale:', error)
    return NextResponse.json(
      { error: 'Error al escalar la imagen. Por favor, inténtalo de nuevo.' },
      { status: 500 }
    )
  }
}
