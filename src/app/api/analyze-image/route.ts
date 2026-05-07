import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

// Create a fresh ZAI instance per request to ensure clean state
async function getZAI() {
  return await ZAI.create()
}

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
        removePrompt: 'Empty background scene with the same style'
      },
      {
        id: 'sub_1', name: 'Main Subject', type: 'subject',
        description: 'The main subject or foreground element in the image',
        position: 'center',
        generatePrompt: 'Generate the main subject from the image on a clean transparent background, isolated and detailed',
        removePrompt: 'The background scene without the main subject'
      },
      {
        id: 'obj_1', name: 'Foreground Objects', type: 'object',
        description: 'Secondary objects and decorative elements in the scene',
        position: 'center',
        generatePrompt: 'Generate the secondary objects and decorative elements from the image on transparent background',
        removePrompt: 'The scene without secondary objects'
      }
    ],
    textElements: []
  }
}

export async function POST(request: NextRequest) {
  console.log('[analyze-image] Request received')

  try {
    let imgSource: string | null = null
    let mode: string = 'analyze'
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form upload
      console.log('[analyze-image] Processing multipart form upload')
      const formData = await request.formData()
      const imageFile = formData.get('image') as File | null
      const imageUrl = formData.get('imageUrl') as string | null
      mode = (formData.get('mode') as string) || 'analyze'

      if (imageFile) {
        const sizeMB = imageFile.size / (1024 * 1024)
        console.log(`[analyze-image] Uploaded file size: ${sizeMB.toFixed(2)} MB`)

        if (sizeMB > 2) {
          return NextResponse.json(
            { error: `Image is too large (${sizeMB.toFixed(1)}MB). Please upload a smaller image (under 2MB).` },
            { status: 413 }
          )
        }

        // Convert uploaded file to base64 data URL for VLM
        const arrayBuffer = await imageFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const mimeType = imageFile.type || 'image/jpeg'
        imgSource = `data:${mimeType};base64,${buffer.toString('base64')}`
      } else if (imageUrl) {
        imgSource = imageUrl
      }
    } else {
      // Handle JSON body - supports multiple formats:
      // Format 1 (Direct): { imageBase64, imageUrl }
      // Format 2 (Workflow engine): { image, mode }
      // Format 3 (Legacy): { imageBase64, imageUrl, mode }
      let body
      try {
        body = await request.json()
      } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
      }

      mode = body.mode || 'analyze'

      const imageBase64 = body.imageBase64
      const imageUrl = body.imageUrl
      const imageStr = body.image  // Workflow engine sends the image as 'image' field

      if (imageStr) {
        // Workflow engine format: image is a URL or base64 string
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
            { status: 413 }
          )
        }

        // Ensure proper data URL format
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

    // Call VLM directly (Vercel serverless is isolated per request, no memory accumulation)
    console.log('[analyze-image] Calling VLM API directly')

    let zai
    try {
      zai = await getZAI()
    } catch (sdkError) {
      console.error('[analyze-image] SDK initialization failed:', sdkError)
      return NextResponse.json({
        success: true,
        analysis: createFallbackAnalysis(),
        rawAnalysis: 'AI SDK initialization failed',
        fallback: true
      })
    }

    let content: string
    try {
      const response = await zai.chat.completions.createVision({
        model: 'glm-4v-flash',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: ANALYZE_PROMPT },
            { type: 'image_url', image_url: { url: imgSource } }
          ]
        }],
        thinking: { type: 'disabled' }
      })

      content = response.choices?.[0]?.message?.content || ''
    } catch (vlmError) {
      console.error('[analyze-image] VLM call failed:', vlmError)
      return NextResponse.json({
        success: true,
        analysis: createFallbackAnalysis(),
        rawAnalysis: 'Vision model call failed',
        fallback: true
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
    } catch (parseErr) {
      console.warn('[analyze-image] Failed to parse VLM response, using fallback')
      analysis = createFallbackAnalysis()
      isFallback = true
    }

    // Validate the analysis
    if (!analysis?.elements || !Array.isArray(analysis.elements) || analysis.elements.length === 0) {
      analysis = createFallbackAnalysis()
      isFallback = true
    }

    console.log('[analyze-image] Analysis complete, found', analysis.elements?.length || 0, 'elements and', analysis.textElements?.length || 0, 'text elements')

    // Return in format that works for both direct use and workflow engine
    // Workflow engine looks for: data.layers or just data
    return NextResponse.json({
      success: true,
      analysis,
      layers: analysis.elements?.map((el: { id?: string; name?: string; type?: string }) => ({
        id: el.id,
        name: el.name,
        type: el.type,
      })) || [],
      rawAnalysis: isFallback ? content : '',
      fallback: isFallback
    })
  } catch (error) {
    console.error('[analyze-image] Unhandled error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image. Please try again.' },
      { status: 500 }
    )
  }
}
