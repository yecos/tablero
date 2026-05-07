import { NextRequest, NextResponse } from 'next/server'
import { analyzeImage } from '@/lib/ai-providers'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const ANALYZE_PROMPT = `You are an expert design analysis AI. Analyze this image carefully and identify ALL distinct visual elements that could be separated into editable layers.

For each element, provide:
- A descriptive name (e.g., "Background", "Main Subject", "Title Text", "Logo", "Decorative Element")
- The type: one of "background", "subject", "text", "object", "decoration", "effect"
- A brief description of what it looks like and its visual characteristics
- Approximate position: one of "full", "top", "bottom", "left", "right", "center", "top-left", "top-right", "bottom-left", "bottom-right"
- A detailed prompt that could be used to regenerate JUST this element on a transparent background (for subjects/objects) or as a complete scene (for backgrounds)
- A prompt to regenerate the background WITHOUT this element (for inpainting/generative completion)

IMPORTANT: You must respond ONLY with valid JSON in this exact format, no additional text:
{
  "description": "Overall description of the image",
  "style": "Visual style description (e.g., modern minimalist, vintage, photorealistic)",
  "elements": [
    {
      "id": "bg_1",
      "name": "Background",
      "type": "background",
      "description": "Description of the background",
      "position": "full",
      "generatePrompt": "Prompt to generate just this element",
      "removePrompt": "Prompt to generate the background without foreground elements"
    }
  ],
  "textElements": [
    {
      "id": "txt_1",
      "text": "The actual text content",
      "name": "Headline",
      "style": "Description of typography style",
      "position": "top-center",
      "fontSize": "large/medium/small"
    }
  ]
}`

function createFallbackAnalysis() {
  return {
    description: 'AI-powered image analysis - editable layers detected',
    style: 'general',
    elements: [
      {
        id: 'bg_1', name: 'Background', type: 'background',
        description: 'The complete background scene of the image',
        position: 'full',
        generatePrompt: 'Generate a background scene matching the original image style and context, complete composition',
        removePrompt: 'Empty background scene with the same style',
      },
      {
        id: 'sub_1', name: 'Main Subject', type: 'subject',
        description: 'The main subject or foreground element in the image',
        position: 'center',
        generatePrompt: 'Generate the main subject from the image on a clean transparent background, isolated and detailed',
        removePrompt: 'The background scene without the main subject',
      },
      {
        id: 'obj_1', name: 'Foreground Objects', type: 'object',
        description: 'Secondary objects and decorative elements in the scene',
        position: 'center',
        generatePrompt: 'Generate the secondary objects and decorative elements from the image on transparent background',
        removePrompt: 'The scene without secondary objects',
      },
    ],
    textElements: [],
  }
}

export async function POST(request: NextRequest) {
  console.log('[analyze-image] Request received')

  try {
    let imgSource: string | null = null
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      console.log('[analyze-image] Processing multipart form upload')
      const formData = await request.formData()
      const imageFile = formData.get('image') as File | null
      const imageUrl = formData.get('imageUrl') as string | null

      if (imageFile) {
        const sizeMB = imageFile.size / (1024 * 1024)
        console.log(`[analyze-image] Uploaded file size: ${sizeMB.toFixed(2)} MB`)

        if (sizeMB > 2) {
          return NextResponse.json(
            { error: `Image is too large (${sizeMB.toFixed(1)}MB). Please upload a smaller image (under 2MB).` },
            { status: 413 },
          )
        }

        const arrayBuffer = await imageFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const mimeType = imageFile.type || 'image/jpeg'
        imgSource = `data:${mimeType};base64,${buffer.toString('base64')}`
      } else if (imageUrl) {
        imgSource = imageUrl
      }
    } else {
      let body
      try {
        body = await request.json()
      } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
      }

      const imageBase64 = body.imageBase64
      const imageUrl = body.imageUrl
      const imageStr = body.image

      if (imageStr) {
        if (imageStr.startsWith('http')) {
          imgSource = imageStr
        } else if (imageStr.startsWith('data:')) {
          imgSource = imageStr
        } else {
          imgSource = `data:image/jpeg;base64,${imageStr}`
        }
      } else if (imageBase64) {
        const sizeMB = (imageBase64.length * 0.75) / (1024 * 1024)
        console.log(`[analyze-image] Base64 payload size: ${sizeMB.toFixed(2)} MB`)

        if (sizeMB > 2) {
          return NextResponse.json(
            { error: `Image is too large (${sizeMB.toFixed(1)}MB). Please upload a smaller image.` },
            { status: 413 },
          )
        }

        if (imageBase64.startsWith('data:')) {
          imgSource = imageBase64
        } else {
          imgSource = `data:image/jpeg;base64,${imageBase64}`
        }
      } else if (imageUrl) {
        imgSource = imageUrl
      }
    }

    if (!imgSource) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 })
    }

    // Use the provider system with automatic fallback
    let content: string
    let usedProvider: string
    try {
      const result = await analyzeImage(imgSource, ANALYZE_PROMPT)
      content = result.text
      usedProvider = result.provider
      console.log(`[analyze-image] Vision analysis complete via ${usedProvider}`)
    } catch (providerError) {
      console.warn('[analyze-image] All vision providers failed:', providerError)
      return NextResponse.json({
        success: true,
        analysis: createFallbackAnalysis(),
        rawAnalysis: 'Vision analysis providers unavailable',
        fallback: true,
      })
    }

    // Parse JSON from the VLM response
    let analysis
    let isFallback = false

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in VLM response')
      }
    } catch {
      console.warn('[analyze-image] Failed to parse VLM response, using fallback')
      analysis = createFallbackAnalysis()
      isFallback = true
    }

    if (!analysis?.elements || !Array.isArray(analysis.elements) || analysis.elements.length === 0) {
      analysis = createFallbackAnalysis()
      isFallback = true
    }

    console.log('[analyze-image] Analysis complete, found', analysis.elements?.length || 0, 'elements and', analysis.textElements?.length || 0, 'text elements')

    return NextResponse.json({
      success: true,
      analysis,
      layers: analysis.elements?.map((el: { id?: string; name?: string; type?: string }) => ({
        id: el.id,
        name: el.name,
        type: el.type,
      })) || [],
      rawAnalysis: isFallback ? content : '',
      fallback: isFallback,
      provider: usedProvider,
    })
  } catch (error) {
    console.error('[analyze-image] Unhandled error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image. Please try again.' },
      { status: 500 },
    )
  }
}
