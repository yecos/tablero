import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image, style, prompt } = body

    if (!image) {
      return NextResponse.json({ error: 'Se requiere una imagen' }, { status: 400 })
    }

    // Use ZAI vision to analyze, then generate in new style
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      // First analyze the image
      const analysis = await zai.chat.completions.createVision({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Describe this image in detail for recreation in a different style. Focus on composition, subject, and layout.',
              },
              { type: 'image_url', image_url: { url: image } },
            ],
          },
        ],
        thinking: { type: 'disabled' },
      })

      const description = analysis.choices?.[0]?.message?.content || ''
      const stylePrompt = `${style || 'photorealistic'} style: ${description}. ${prompt || ''}`

      const result = await zai.images.generations.create({
        prompt: stylePrompt,
        size: '1024x1024',
      })

      if (result.data && result.data.length > 0) {
        return NextResponse.json({
          success: true,
          data: { url: result.data[0].url, provider: 'zai', model: 'style-transfer' },
        })
      }
    } catch (err) {
      console.error('[style-transfer] ZAI error:', err)
    }

    return NextResponse.json({ error: 'Style transfer failed' }, { status: 500 })
  } catch (error) {
    console.error('[style-transfer] Error:', error)
    return NextResponse.json({ error: 'Failed to transfer style' }, { status: 500 })
  }
}
