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
    const { imageBase64, imageUrl } = await request.json()

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json({ error: 'Image data (base64 or URL) is required' }, { status: 400 })
    }

    const zai = await getZAI()

    // Build the image URL for VLM
    const imgSource = imageBase64
      ? `data:image/png;base64,${imageBase64}`
      : imageUrl

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

    const analysisResponse = await zai.chat.completions.createVision({
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

    const analysisText = analysisResponse.choices[0]?.message?.content || ''

    // Parse the JSON response - handle potential markdown code blocks
    let analysis
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch {
      // Fallback: create a basic analysis structure
      analysis = {
        description: 'Image analysis completed',
        style: 'general',
        elements: [
          {
            id: 'bg_1',
            name: 'Background',
            type: 'background',
            description: 'The background of the image',
            position: 'full',
            generatePrompt: 'Generate the same background scene from the image, maintaining style and context',
            removePrompt: 'Same background scene, empty'
          },
          {
            id: 'sub_1',
            name: 'Main Subject',
            type: 'subject',
            description: 'The main subject or foreground element',
            position: 'center',
            generatePrompt: 'Generate the main subject from the image on a transparent background, isolated',
            removePrompt: 'The background scene without the main subject'
          }
        ],
        textElements: []
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      rawAnalysis: analysisText
    })
  } catch (error) {
    console.error('Image analysis API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image. Please try again.' },
      { status: 500 }
    )
  }
}
