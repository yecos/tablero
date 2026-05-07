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
    const { prompt, sketchBase64, style = 'natural' } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'El prompt es obligatorio' },
        { status: 400 }
      )
    }

    const zai = await getZAI()

    const styleMap: Record<string, string> = {
      vivid: 'vivid colors, vibrant, dramatic lighting',
      natural: 'natural, photorealistic, realistic lighting',
      cinematic: 'cinematic, moody, film-like, anamorphic',
      anime: 'anime style, cel-shaded, Japanese animation',
      illustration: 'digital illustration, artistic, hand-drawn feel',
    }

    const styleDesc = styleMap[style] || styleMap.natural

    const enhancedPrompt = `Based on a sketch: ${prompt}. ${styleDesc}. High quality, detailed, professional`

    const response = await zai.images.generations.create({
      prompt: enhancedPrompt,
      size: '1024x1024',
    })

    if (!response.data || response.data.length === 0) {
      return NextResponse.json(
        { error: 'No se pudo generar la imagen. Intenta con un prompt diferente.' },
        { status: 500 }
      )
    }

    const imageData = response.data[0] as { base64?: string; url?: string; b64_json?: string }

    return NextResponse.json({
      imageUrl: imageData.url || null,
      base64: imageData.b64_json || imageData.base64 || null,
      prompt,
      style,
    })
  } catch (error) {
    console.error('Error en la API de sketch-to-image:', error)
    return NextResponse.json(
      { error: 'Error al convertir sketch a imagen. Por favor, inténtalo de nuevo.' },
      { status: 500 }
    )
  }
}
