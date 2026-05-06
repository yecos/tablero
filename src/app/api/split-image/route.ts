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

export async function POST(request: NextRequest) {
  try {
    const { layers, style, imageSize } = await request.json()

    if (!layers || !Array.isArray(layers) || layers.length === 0) {
      return NextResponse.json({ error: 'Layers array is required' }, { status: 400 })
    }

    const zai = await getZAI()

    // Generate each layer image
    const generatedLayers = []
    const validSizes = ['1024x1024', '1344x768', '768x1344', '864x1152', '1152x864', '1440x720', '720x1440']
    const size = validSizes.includes(imageSize) ? imageSize : '1024x1024'

    for (const layer of layers as LayerRequest[]) {
      try {
        // Enhance the prompt with style context
        const enhancedPrompt = layer.type === 'background'
          ? `${layer.generatePrompt}. Style: ${style || 'matching the original'}. Complete scene, no gaps, no missing areas, full background.`
          : `${layer.generatePrompt}. Style: ${style || 'matching the original'}. Clean extraction, isolated element.`

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
        }
      } catch (layerError) {
        console.error(`Failed to generate layer ${layer.id}:`, layerError)
        // Continue with other layers even if one fails
        generatedLayers.push({
          id: layer.id,
          name: layer.name,
          type: layer.type,
          imageUrl: null,
          base64: null,
          error: 'Failed to generate this layer'
        })
      }
    }

    return NextResponse.json({
      success: true,
      layers: generatedLayers
    })
  } catch (error) {
    console.error('Image split API error:', error)
    return NextResponse.json(
      { error: 'Failed to split image into layers. Please try again.' },
      { status: 500 }
    )
  }
}
