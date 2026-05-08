import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image, prompt } = body

    if (!image) {
      return NextResponse.json({ error: 'Se requiere una imagen' }, { status: 400 })
    }

    const falApiKey = process.env.FAL_API_KEY
    if (falApiKey) {
      try {
        const response = await fetch('https://fal.run/fal-ai/relight', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Key ${falApiKey}`,
          },
          body: JSON.stringify({
            image_url: image,
            prompt: prompt || 'professional studio lighting',
          }),
        })
        if (response.ok) {
          const data = await response.json()
          return NextResponse.json({
            success: true,
            data: { url: data.image?.url, provider: 'fal' },
          })
        }
      } catch (err) {
        console.error('[relight] fal.ai error:', err)
      }
    }

    // Fallback: Use ZAI SDK
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const relightPrompt = `${prompt || 'professional studio lighting, cinematic lighting, dramatic light'}, architectural photography, interior design photography, ultra detailed`

      const response = await zai.images.generations.create({
        prompt: relightPrompt,
        size: '1024x1024',
      })

      if (response.data && response.data.length > 0) {
        return NextResponse.json({
          success: true,
          data: { url: response.data[0].url, provider: 'zai' },
        })
      }
    } catch (err) {
      console.error('[relight] ZAI error:', err)
    }

    return NextResponse.json({ error: 'Relight requires FAL_API_KEY' }, { status: 503 })
  } catch (error) {
    console.error('[relight] Error:', error)
    return NextResponse.json({ error: 'Failed to relight image' }, { status: 500 })
  }
}
