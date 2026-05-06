import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

interface LayerRequest {
  id: string
  name: string
  type: string
  generatePrompt: string
}

export const maxDuration = 120 // Allow up to 2 minutes for generating multiple layers

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { layers, style, imageSize } = body

    if (!layers || !Array.isArray(layers) || layers.length === 0) {
      return NextResponse.json({ error: 'Layers array is required' }, { status: 400 })
    }

    // Initialize SDK
    let zai
    try {
      zai = await getZAI()
    } catch (sdkError) {
      console.error('[split-image] SDK initialization failed:', sdkError)
      return NextResponse.json(
        { error: 'AI service unavailable. Please try again.' },
        { status: 503 }
      )
    }

    const validSizes = ['1024x1024', '1344x768', '768x1344', '864x1152', '1152x864', '1440x720', '720x1440']
    const size = validSizes.includes(imageSize) ? imageSize : '1024x1024'

    console.log(`[split-image] Generating ${layers.length} layers, size: ${size}`)

    // Generate each layer image sequentially to avoid overwhelming the API
    const generatedLayers = []

    for (const layer of layers as LayerRequest[]) {
      try {
        // Enhance the prompt with style context
        let enhancedPrompt: string
        if (layer.type === 'background') {
          enhancedPrompt = `${layer.generatePrompt}. Style: ${style || 'matching the original'}. Complete scene, no gaps, no missing areas, full background.`
        } else {
          enhancedPrompt = `${layer.generatePrompt}. Style: ${style || 'matching the original'}. Clean extraction, isolated element on transparent background.`
        }

        console.log(`[split-image] Generating layer "${layer.name}" (${layer.type})`)

        const response = await zai.images.generations.create({
          prompt: enhancedPrompt,
          size,
        })

        if (response.data && response.data.length > 0) {
          const imageData = response.data[0]
          generatedLayers.push({
            id: layer.id,
            name: layer.name,
            type: layer.type,
            imageUrl: imageData.url || null,
            base64: imageData.b64_json || imageData.base64 || null,
          })
          console.log(`[split-image] Layer "${layer.name}" generated successfully`)
        } else {
          console.error(`[split-image] No data returned for layer "${layer.name}"`)
          generatedLayers.push({
            id: layer.id,
            name: layer.name,
            type: layer.type,
            imageUrl: null,
            base64: null,
            error: 'No image data returned'
          })
        }
      } catch (layerError) {
        console.error(`[split-image] Failed to generate layer "${layer.name}":`, layerError)
        generatedLayers.push({
          id: layer.id,
          name: layer.name,
          type: layer.type,
          imageUrl: null,
          base64: null,
          error: 'Generation failed for this layer'
        })
      }
    }

    const successCount = generatedLayers.filter(l => l.imageUrl || l.base64).length
    console.log(`[split-image] Complete: ${successCount}/${layers.length} layers generated`)

    return NextResponse.json({
      success: true,
      layers: generatedLayers
    })
  } catch (error) {
    console.error('[split-image] Unhandled error:', error)
    return NextResponse.json(
      { error: 'Failed to split image into layers. Please try again.' },
      { status: 500 }
    )
  }
}
