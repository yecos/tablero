import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execFileAsync = promisify(execFile)

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const TEMP_DIR = path.join(process.cwd(), 'upload', 'temp')
const WORKER_SCRIPT = path.join(process.cwd(), 'mini-services', 'vlm-worker.js')

async function ensureTempDir() {
  if (!existsSync(TEMP_DIR)) {
    await mkdir(TEMP_DIR, { recursive: true })
  }
}

export async function POST(request: NextRequest) {
  console.log('[analyze-image] Request received')

  let tempFilePath: string | null = null

  try {
    let imageBase64: string | null = null
    let imageUrl: string | null = null

    // Check content type to determine how to parse the request
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form upload (much more memory efficient than base64 in JSON)
      console.log('[analyze-image] Processing multipart form upload')
      const formData = await request.formData()
      const imageFile = formData.get('image') as File | null
      imageUrl = formData.get('imageUrl') as string | null

      if (imageFile) {
        // Save the uploaded file directly to disk (no base64 encoding/decoding!)
        await ensureTempDir()
        const tempId = `analyze_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`
        tempFilePath = path.join(TEMP_DIR, tempId)

        const arrayBuffer = await imageFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        await writeFile(tempFilePath, buffer)
        console.log('[analyze-image] Saved uploaded image:', tempFilePath, `(${(buffer.length / 1024).toFixed(1)} KB)`)
      }
    } else {
      // Handle JSON body (for backward compatibility and URL-based analysis)
      let body
      try {
        body = await request.json()
      } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
      }
      imageBase64 = body.imageBase64
      imageUrl = body.imageUrl

      if (imageBase64) {
        const sizeMB = (imageBase64.length * 0.75) / (1024 * 1024)
        console.log(`[analyze-image] Base64 payload size: ${sizeMB.toFixed(2)} MB`)

        if (sizeMB > 1) {
          return NextResponse.json(
            { error: `Image is too large (${sizeMB.toFixed(1)}MB). Please upload a smaller image.` },
            { status: 413 }
          )
        }

        // Save base64 to temp file
        await ensureTempDir()
        const tempId = `analyze_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`
        tempFilePath = path.join(TEMP_DIR, tempId)
        const buffer = Buffer.from(imageBase64, 'base64')
        await writeFile(tempFilePath, buffer)
        console.log('[analyze-image] Saved base64 image:', tempFilePath, `(${(buffer.length / 1024).toFixed(1)} KB)`)
      }
    }

    if (!tempFilePath && !imageUrl) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 })
    }

    // Determine the input for the worker script
    const workerInput = tempFilePath || imageUrl!

    console.log('[analyze-image] Spawning VLM worker process, input:', tempFilePath ? 'file' : 'url')

    // Run the VLM worker as a SEPARATE process to isolate memory usage
    const { stdout, stderr } = await execFileAsync(
      'node',
      [WORKER_SCRIPT, workerInput, 'analyze'],
      {
        timeout: 55000,
        maxBuffer: 5 * 1024 * 1024,
        env: { ...process.env }
      }
    )

    // Clean up temp file
    if (tempFilePath) {
      try { await unlink(tempFilePath) } catch { /* ignore */ }
      tempFilePath = null
    }

    // Parse the worker output
    let result
    try {
      result = JSON.parse(stdout.trim())
    } catch {
      console.error('[analyze-image] Worker output parse failed')
      console.error('[analyze-image] stdout:', stdout.substring(0, 300))
      if (stderr) console.error('[analyze-image] stderr:', stderr.substring(0, 300))

      return NextResponse.json({
        success: true,
        analysis: createFallbackAnalysis(),
        rawAnalysis: 'Worker process returned invalid output',
        fallback: true
      })
    }

    if (result.error && !result.analysis) {
      console.error('[analyze-image] Worker error:', result.error)
      return NextResponse.json({
        success: true,
        analysis: createFallbackAnalysis(),
        rawAnalysis: result.error,
        fallback: true
      })
    }

    // Validate the analysis
    if (!result.analysis?.elements || !Array.isArray(result.analysis.elements) || result.analysis.elements.length === 0) {
      result.analysis = createFallbackAnalysis()
      result.fallback = true
    }

    console.log('[analyze-image] Analysis complete, found', result.analysis?.elements?.length || 0, 'elements and', result.analysis?.textElements?.length || 0, 'text elements')

    return NextResponse.json({
      success: true,
      analysis: result.analysis,
      rawAnalysis: result.rawAnalysis || '',
      fallback: result.fallback || false
    })
  } catch (error) {
    console.error('[analyze-image] Unhandled error:', error)

    if (tempFilePath) {
      try { await unlink(tempFilePath) } catch { /* ignore */ }
    }

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
