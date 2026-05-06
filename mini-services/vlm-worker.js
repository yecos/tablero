#!/usr/bin/env node
/**
 * VLM Worker Script
 * Runs as a separate process to avoid memory issues in the Next.js server.
 * Accepts image data (base64 or file path), calls VLM API, outputs JSON result.
 * 
 * Usage: node vlm-worker.js <base64-data-or-filepath> [analysis-type]
 * - analysis-type: "analyze" (default) or "describe"
 */

const ZAI = require('z-ai-web-dev-sdk').default
const fs = require('fs')
const path = require('path')

async function main() {
  const input = process.argv[2]
  const analysisType = process.argv[3] || 'analyze'

  if (!input) {
    console.error(JSON.stringify({ error: 'No input provided' }))
    process.exit(1)
  }

  try {
    // Create ZAI instance
    const zai = await ZAI.create()

    // Determine image source
    let imgSource
    if (input.startsWith('data:') || input.startsWith('http')) {
      imgSource = input
    } else if (fs.existsSync(input)) {
      // It's a file path - read and convert to base64 data URL
      const buffer = fs.readFileSync(input)
      const ext = path.extname(input).toLowerCase()
      const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
      imgSource = `data:${mimeType};base64,${buffer.toString('base64')}`
    } else {
      // Assume it's raw base64
      imgSource = `data:image/jpeg;base64,${input}`
    }

    let prompt
    if (analysisType === 'analyze') {
      prompt = `You are an expert design analysis AI. Analyze this image carefully and identify ALL distinct visual elements that could be separated into editable layers.

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
    } else {
      prompt = 'Describe this image briefly in 1-2 sentences.'
    }

    const response = await zai.chat.completions.createVision({
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imgSource } }
        ]
      }],
      thinking: { type: 'disabled' }
    })

    const content = response.choices?.[0]?.message?.content || ''

    if (analysisType === 'analyze') {
      // Parse JSON from response
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0])
          // Output as JSON to stdout
          console.log(JSON.stringify({ success: true, analysis, rawAnalysis: content }))
        } else {
          throw new Error('No JSON found')
        }
      } catch (parseErr) {
        // Output fallback
        console.log(JSON.stringify({
          success: true,
          analysis: createFallbackAnalysis(),
          rawAnalysis: content,
          fallback: true
        }))
      }
    } else {
      console.log(JSON.stringify({ success: true, description: content }))
    }

    // Exit cleanly
    process.exit(0)
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error(JSON.stringify({
      success: false,
      error: errMsg,
      fallback: true,
      analysis: createFallbackAnalysis()
    }))
    process.exit(0) // Exit with 0 so the parent process can read the output
  }
}

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

main()
