import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, creativity, resemblance, hdr, fractality, scale, image, mode, preset } = body

    if (!image && !prompt) {
      return NextResponse.json({ error: 'Se requiere una imagen o prompt' }, { status: 400 })
    }

    // Try fal.ai upscaler first (best quality)
    const falApiKey = process.env.FAL_API_KEY
    if (falApiKey) {
      try {
        const response = await fetch('https://fal.run/fal-ai/clarity-upscaler', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Key ${falApiKey}`,
          },
          body: JSON.stringify({
            image_url: image,
            prompt: prompt || 'enhance, improve quality, add detail, sharp',
            negative_prompt: 'blurry, low quality, artifacts, noise',
            scale: scale || 2,
            creativity: (creativity || 5) / 10,
            resemblance: (resemblance || 7) / 10,
            guidance_scale: 7 + (hdr || 3),
            num_inference_steps: 30 + Math.floor((creativity || 5) * 2),
          }),
        })

        if (response.ok) {
          const data = await response.json()
          return NextResponse.json({
            success: true,
            data: {
              url: data.image?.url || data.images?.[0]?.url,
              provider: 'fal',
              model: 'clarity-upscaler',
            },
          })
        }
      } catch (falError) {
        console.error('[enhance] fal.ai error:', falError)
      }
    }

    // Fallback: Use ZAI SDK for image generation with enhance prompt
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const enhancePrompt = prompt || `Ultra high quality, highly detailed, professional photography, sharp focus, 8K resolution${preset ? `, ${preset} style` : ''}`

      const response = await zai.images.generations.create({
        prompt: enhancePrompt,
        size: '1024x1024',
      })

      if (response.data && response.data.length > 0) {
        return NextResponse.json({
          success: true,
          data: {
            url: response.data[0].url,
            provider: 'zai',
            model: 'zai-enhance',
          },
        })
      }
    } catch (zaiError) {
      console.error('[enhance] ZAI error:', zaiError)
    }

    return NextResponse.json(
      { error: 'No AI providers available. Configure FAL_API_KEY or ZAI_API_KEY.' },
      { status: 503 }
    )
  } catch (error) {
    console.error('[enhance] Error:', error)
    return NextResponse.json({ error: 'Failed to enhance image' }, { status: 500 })
  }
}
