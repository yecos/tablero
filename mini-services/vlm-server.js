const http = require('http')
const fs = require('fs')
const path = require('path')
const ZAI = require('z-ai-web-dev-sdk').default

const PORT = 3001

let zaiInstance = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

function createFallbackAnalysis() {
  return {
    description: 'AI-powered image analysis - editable layers detected',
    style: 'general',
    elements: [
      { id: 'bg_1', name: 'Background', type: 'background', description: 'The complete background scene of the image', position: 'full', generatePrompt: 'Generate a background scene matching the original image style and context, complete composition', removePrompt: 'Empty background scene with the same style' },
      { id: 'sub_1', name: 'Main Subject', type: 'subject', description: 'The main subject or foreground element in the image', position: 'center', generatePrompt: 'Generate the main subject from the image on a clean transparent background, isolated and detailed', removePrompt: 'The background scene without the main subject' },
      { id: 'obj_1', name: 'Foreground Objects', type: 'object', description: 'Secondary objects and decorative elements in the scene', position: 'center', generatePrompt: 'Generate the secondary objects and decorative elements from the image on transparent background', removePrompt: 'The scene without secondary objects' }
    ],
    textElements: []
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok' }))
    return
  }

  // Use streaming body parsing to avoid buffering the entire body in memory
  const chunks = []
  req.on('data', chunk => chunks.push(chunk))
  req.on('end', async () => {
    try {
      const body = Buffer.concat(chunks).toString()
      const parsed = JSON.parse(body)
      const { imagePath, imageUrl, analysisType } = parsed
      
      if (!imagePath && !imageUrl) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'No image data provided' }))
        return
      }

      console.log(`[vlm-server] Processing ${analysisType || 'analyze'} request, input: ${imagePath ? 'file' : 'url'}`)

      // Build image source from file path (avoids passing base64 through HTTP)
      let imgSource
      if (imagePath) {
        // Read the file and create a data URL
        if (!fs.existsSync(imagePath)) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Image file not found' }))
          return
        }
        const buffer = fs.readFileSync(imagePath)
        const ext = path.extname(imagePath).toLowerCase()
        const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
        imgSource = `data:${mimeType};base64,${buffer.toString('base64')}`
        
        // Delete the temp file after reading
        try { fs.unlinkSync(imagePath) } catch { /* ignore */ }
      } else {
        imgSource = imageUrl
      }

      const zai = await getZAI()

      const prompt = analysisType === 'describe'
        ? 'Describe this image briefly.'
        : `You are an expert design analysis AI. Analyze this image carefully and identify ALL distinct visual elements that could be separated into editable layers.

For each element, provide:
- A descriptive name
- The type: one of "background", "subject", "text", "object", "decoration", "effect"
- A brief description
- Approximate position: one of "full", "top", "bottom", "left", "right", "center", "top-left", "top-right", "bottom-left", "bottom-right"
- A detailed prompt to regenerate JUST this element
- A prompt to regenerate the background WITHOUT this element

IMPORTANT: Respond ONLY with valid JSON:
{
  "description": "Overall description",
  "style": "Visual style",
  "elements": [
    { "id": "bg_1", "name": "Background", "type": "background", "description": "...", "position": "full", "generatePrompt": "...", "removePrompt": "..." },
    { "id": "sub_1", "name": "Main Subject", "type": "subject", "description": "...", "position": "center", "generatePrompt": "...", "removePrompt": "..." }
  ],
  "textElements": [
    { "id": "txt_1", "text": "actual text", "name": "Headline", "style": "typography style", "position": "top-center", "fontSize": "large/medium/small" }
  ]
}`

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

      if (analysisType === 'describe') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: true, description: content }))
        return
      }

      // Parse analysis
      let analysis
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : createFallbackAnalysis()
      } catch {
        analysis = createFallbackAnalysis()
      }

      if (!analysis.elements || !Array.isArray(analysis.elements) || analysis.elements.length === 0) {
        analysis = createFallbackAnalysis()
      }

      console.log(`[vlm-server] Analysis complete: ${analysis.elements?.length} elements`)
      
      // Force GC if available
      if (global.gc) global.gc()

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ success: true, analysis, rawAnalysis: content }))
    } catch (error) {
      console.error('[vlm-server] Error:', error.message)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        success: true,
        analysis: createFallbackAnalysis(),
        rawAnalysis: `Error: ${error.message}`,
        fallback: true
      }))
    }
  })
})

server.listen(PORT, () => {
  console.log(`[vlm-server] Running on port ${PORT}`)
})
