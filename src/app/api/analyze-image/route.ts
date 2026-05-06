import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

export const maxDuration = 60 // Allow up to 60 seconds for VLM processing

// Increase body size limit for base64 image payloads
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  console.log('[analyze-image] Request received')

  try {
    // Parse request body with error handling
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { imageBase64, imageUrl } = body

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json({ error: 'Image data (base64 or URL) is required' }, { status: 400 })
    }

    // Log payload size for debugging
    if (imageBase64) {
      const sizeMB = (imageBase64.length * 0.75) / (1024 * 1024)
      console.log(`[analyze-image] Base64 payload size: ${sizeMB.toFixed(2)} MB`)

      // Reject payloads that are too large (> 3MB decoded) - they will cause VLM timeouts
      if (sizeMB > 3) {
        console.error('[analyze-image] Payload too large:', sizeMB.toFixed(2), 'MB')
        return NextResponse.json(
          { error: 'Image is too large for analysis. Please upload a smaller image (recommended: under 1MB).' },
          { status: 413 }
        )
      }
    }

    // Initialize SDK
    let zai
    try {
      zai = await getZAI()
    } catch (sdkError) {
      console.error('[analyze-image] SDK initialization failed:', sdkError)
      return NextResponse.json(
        { error: 'AI service unavailable. Please try again.' },
        { status: 503 }
      )
    }

    // Build the image source for VLM
    // Client-side already compresses images to max 512px JPEG before sending
    const imgSource = imageBase64
      ? `data:image/jpeg;base64,${imageBase64}`
      : imageUrl

    console.log('[analyze-image] Starting VLM analysis, image source type:', imageBase64 ? 'base64' : 'url')

    // Step 1: Analyze the image with VLM to identify all visual elements
    const analysisPrompt = `You are an expert design analysis AI. Analyze this image carefully and identify ALL distinct visual elements that could be separated into editable layers.

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
    },
    {
      "id": "sub_1",
      "name": "Main Subject",
      "type": "subject",
      "description": "Description of the main subject",
      "position": "center",
      "generatePrompt": "Prompt to generate this subject on transparent background",
      "removePrompt": "Prompt to generate the scene without this subject"
    }
  ],
  "textElements": [
    {
      "id": "txt_1",
      "text": "The actual text content",
      "name": "Headline",
      "style": "Description of typography style (font weight, color, effects, shadows, perspective)",
      "position": "top-center",
      "fontSize": "approximate relative size (large/medium/small)"
    }
  ]
}`

    let analysisResponse
    try {
      analysisResponse = await zai.chat.completions.createVision({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: analysisPrompt },
              { type: 'image_url', image_url: { url: imgSource } }
            ]
          }
        ],
        thinking: { type: 'disabled' }
      })
    } catch (vlmError: unknown) {
      console.error('[analyze-image] VLM call failed:', vlmError)
      const errMsg = vlmError instanceof Error ? vlmError.message : String(vlmError)
      // If VLM fails, return fallback analysis so UI still works
      return NextResponse.json({
        success: true,
        analysis: createFallbackAnalysis(),
        rawAnalysis: `VLM analysis failed: ${errMsg}`,
        fallback: true
      })
    }

    const analysisText = analysisResponse.choices?.[0]?.message?.content || ''

    if (!analysisText) {
      console.error('[analyze-image] Empty VLM response')
      return NextResponse.json({
        success: true,
        analysis: createFallbackAnalysis(),
        rawAnalysis: '',
        fallback: true
      })
    }

    console.log('[analyze-image] VLM response length:', analysisText.length)

    // Parse the JSON response - handle potential markdown code blocks
    let analysis
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('[analyze-image] JSON parse failed:', parseError)
      analysis = createFallbackAnalysis()
    }

    // Validate the analysis has the minimum required structure
    if (!analysis.elements || !Array.isArray(analysis.elements) || analysis.elements.length === 0) {
      console.error('[analyze-image] Invalid analysis structure, using fallback')
      analysis = createFallbackAnalysis()
    }

    console.log('[analyze-image] Analysis complete, found', analysis.elements?.length || 0, 'elements and', analysis.textElements?.length || 0, 'text elements')

    return NextResponse.json({
      success: true,
      analysis,
      rawAnalysis: analysisText
    })
  } catch (error) {
    console.error('[analyze-image] Unhandled error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image. Please try again.' },
      { status: 500 }
    )
  }
}

function createFallbackAnalysis() {
  return {
    description: 'AI-powered image analysis - editable layers detected',
    style: 'general',
    elements: [
      {
        id: 'bg_1',
        name: 'Background',
        type: 'background',
        description: 'The complete background scene of the image',
        position: 'full',
        generatePrompt: 'Generate a background scene matching the original image style and context, complete composition',
        removePrompt: 'Empty background scene with the same style'
      },
      {
        id: 'sub_1',
        name: 'Main Subject',
        type: 'subject',
        description: 'The main subject or foreground element in the image',
        position: 'center',
        generatePrompt: 'Generate the main subject from the image on a clean transparent background, isolated and detailed',
        removePrompt: 'The background scene without the main subject'
      },
      {
        id: 'obj_1',
        name: 'Foreground Objects',
        type: 'object',
        description: 'Secondary objects and decorative elements in the scene',
        position: 'center',
        generatePrompt: 'Generate the secondary objects and decorative elements from the image on transparent background',
        removePrompt: 'The scene without secondary objects'
      }
    ],
    textElements: []
  }
}
