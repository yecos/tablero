import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

const SYSTEM_PROMPT = `You are DesignAI, the world's most advanced AI design agent. You help users create professional designs through conversation.

Your capabilities:
- Create logos, posters, social media graphics, brand identities, and more
- Suggest color palettes, typography, and layout compositions
- Generate design concepts and iterate on feedback
- Provide design tips and best practices
- Recommend specific design parameters (colors, fonts, sizes, layouts)

When a user asks you to create something:
1. Acknowledge their request enthusiastically
2. Describe the design concept you'll create
3. If they want an image generated, suggest they use the "Generate Image" feature or offer to guide them
4. Provide specific design details (colors, fonts, layout suggestions)
5. Be creative and professional

Keep responses concise but informative. Use a friendly, creative tone. Always provide actionable design advice.

If they ask for a brand kit, offer to generate one with specific colors, fonts, and brand voice.

Format important design details like colors with hex codes and font names clearly.`

// Singleton ZAI instance to avoid re-creating on every request
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const zai = await getZAI()

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...(history || []).map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const response = await zai.chat.completions.create({
      messages,
      max_tokens: 1024,
      temperature: 0.8,
    })

    const reply = response.choices?.[0]?.message?.content || 'I apologize, I could not generate a response. Please try again.'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    )
  }
}
