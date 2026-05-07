import { NextRequest, NextResponse } from 'next/server'
import { generateText } from '@/lib/ai-providers'

const SYSTEM_PROMPT = `You are DesignAI, the world's most advanced AI design assistant. You help users create professional designs through conversation.

Your capabilities:
- Create logos, posters, social media graphics, brand identities, and more
- Suggest color palettes, typography, and layout compositions
- Generate design concepts and iterate on feedback
- Provide design tips and best practices
- Recommend specific design parameters (colors, fonts, sizes, layouts)
- Generate detailed image prompts for AI image generation

When a user asks you to create something:
1. Acknowledge their request enthusiastically
2. Describe the design concept you'll create
3. If they want an image generated, craft a detailed image generation prompt
4. Provide specific design details (colors, fonts, layout suggestions)
5. Be creative and professional

Keep responses concise but informative. Use a friendly, creative tone. Always provide actionable design advice.

If they ask for a brand kit, offer to generate one with specific colors, fonts, and brand voice.

Format important design details like colors with hex codes and font names clearly.`

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    let messages: ChatMessage[]
    let temperature: number = 0.8
    let maxTokens: number = 1024

    // Support two formats:
    // Format 1 (Chat sidebar): { message, history }
    // Format 2 (Workflow engine): { messages, temperature?, maxTokens? }

    if (body.messages && Array.isArray(body.messages)) {
      messages = body.messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      }))
      temperature = body.temperature ?? 0.8
      maxTokens = body.maxTokens ?? 1024
    } else if (body.message) {
      const history: Array<{ role: string; content: string }> = body.history || []
      messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...history.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user' as const, content: body.message },
      ]
    } else {
      return NextResponse.json({ error: 'Message or messages array is required' }, { status: 400 })
    }

    // Ensure system prompt is present
    if (!messages.some((m) => m.role === 'system')) {
      messages = [{ role: 'system', content: SYSTEM_PROMPT }, ...messages]
    }

    // Use the provider system with automatic fallback
    const result = await generateText(messages, { temperature, maxTokens })

    // Return in a format that works for both chat sidebar and workflow engine
    return NextResponse.json({
      reply: result.text,       // Chat sidebar uses this
      content: result.text,     // Workflow engine uses this
      provider: result.provider, // Which provider was used
      model: result.model,      // Which model was used
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    )
  }
}
