import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/lib/ai-providers'

interface LayerRequest {
  id: string
  name: string
  type: string
  generatePrompt: string
}

export const maxDuration = 120

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

    const validSizes = ['1024x1024', '1344x768', '768x1344', '864x1152', '1152x864', '1440x720', '720x1440']
    const size = validSizes.includes(imageSize) ? imageSize : '1024x1024'

    console.log(`[split-image] Generating ${layers.length} layers, size: ${size}`)

    const generatedLayers = []

    for (const layer of layers as LayerRequest[]) {
      try {
        let enhancedPrompt: string
        if (layer.type === 'background') {
          enhancedPrompt = `${layer.generatePrompt}. Style: ${style || 'matching the original'}. Complete scene, no gaps, no missing areas, full background.`
        } else {
          enhancedPrompt = `${layer.generatePrompt}. Style: ${style || 'matching the original'}. Clean extraction, isolated element on transparent background.`
        }

        console.log(`[split-image] Generating layer "${layer.name}" (${layer.type})`)

        const result = await generateImage(enhancedPrompt, { size })

        generatedLayers.push({
          id: layer.id,
          name: layer.name,
          type: layer.type,
          imageUrl: result.url,
          base64: result.isBase64 ? result.url.replace(/^data:image\/\w+;base64,/, '') : null,
          provider: result.provider,
        })
        console.log(`[split-image] Layer "${layer.name}" generated via ${result.provider}`)
      } catch (layerError) {
        console.error(`[split-image] Failed to generate layer "${layer.name}":`, layerError)
        generatedLayers.push({
          id: layer.id,
          name: layer.name,
          type: layer.type,
          imageUrl: null,
          base64: null,
          error: 'Generation failed for this layer',
        })
      }
    }

    const successCount = generatedLayers.filter(l => l.imageUrl || l.base64).length
    console.log(`[split-image] Complete: ${successCount}/${layers.length} layers generated`)

    return NextResponse.json({
      success: true,
      layers: generatedLayers,
    })
  } catch (error) {
    console.error('[split-image] Unhandled error:', error)
    return NextResponse.json(
      { error: 'Failed to split image into layers. Please try again.' },
      { status: 500 },
    )
  }
}
