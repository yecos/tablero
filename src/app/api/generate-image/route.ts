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
    const { prompt, size = '1024x1024' } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const validSizes = ['1024x1024', '1344x768', '768x1344', '864x1152', '1152x864', '1440x720', '720x1440']
    const imageSize = validSizes.includes(size) ? size : '1024x1024'

    const zai = await getZAI()

    const response = await zai.images.generations.create({
      prompt,
      size: imageSize,
    })

    if (!response.data || response.data.length === 0) {
      return NextResponse.json({ error: 'No image was generated. Please try a different prompt.' }, { status: 500 })
    }

    const imageData = response.data[0]

    return NextResponse.json({
      imageUrl: imageData.url || null,
      base64: imageData.b64_json || imageData.base64 || null,
      prompt,
      size: imageSize,
    })
  } catch (error) {
    console.error('Image generation API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image. Please try again.' },
      { status: 500 }
    )
  }
}
