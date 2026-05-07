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
    const { imageBase64, imageUrl, direction = 'all', aspectRatio = '16:9' } = await request.json()

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json(
        { error: 'Se requiere una imagen (imageBase64 o imageUrl)' },
        { status: 400 }
      )
    }

    const zai = await getZAI()

    const directionMap: Record<string, string> = {
      up: 'extended upward with more sky and ceiling space',
      down: 'extended downward with more ground and floor space',
      left: 'extended to the left with more background',
      right: 'extended to the right with more background',
      all: 'extended in all directions with more context and background',
    }

    const directionDesc = directionMap[direction] || directionMap.all

    const sizeMap: Record<string, '1344x768' | '768x1344' | '1152x864' | '864x1152' | '1024x1024'> = {
      '16:9': '1344x768',
      '9:16': '768x1344',
      '4:3': '1152x864',
      '3:4': '864x1152',
      '1:1': '1024x1024',
    }
    const targetSize = sizeMap[aspectRatio] || '1344x768'

    const prompt = `Seamlessly ${directionDesc}, maintaining the original style and composition, professional quality, expanded canvas`

    const response = await zai.images.generations.create({
      prompt,
      size: targetSize,
    })

    if (!response.data || response.data.length === 0) {
      return NextResponse.json(
        { error: 'No se pudo extender la imagen. Inténtalo de nuevo.' },
        { status: 500 }
      )
    }

    const imageData = response.data[0] as { base64?: string; url?: string; b64_json?: string }

    return NextResponse.json({
      imageUrl: imageData.url || null,
      base64: imageData.b64_json || imageData.base64 || null,
      direction,
      aspectRatio,
    })
  } catch (error) {
    console.error('Error en la API de extender imagen:', error)
    return NextResponse.json(
      { error: 'Error al extender la imagen. Por favor, inténtalo de nuevo.' },
      { status: 500 }
    )
  }
}
