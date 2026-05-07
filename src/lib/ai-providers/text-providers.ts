// ---------------------------------------------------------------------------
// Text Generation Providers — with automatic fallback
// ---------------------------------------------------------------------------
// Priority: ZAI (built-in) → Google Gemini → Groq → OpenRouter → Cerebras

import type { TextProvider, TextGenResult } from './types'

// ── ZAI SDK (built-in, always available) ──────────────────────────────────────

let zaiInstance: Awaited<ReturnType<typeof import('z-ai-web-dev-sdk').default.create>> | null = null

async function getZAI() {
  if (!zaiInstance) {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

export const zaiTextProvider: TextProvider = {
  name: 'zai-sdk',
  isAvailable: () => true, // Always available — no key needed
  async generate(messages, options) {
    const zai = await getZAI()
    const response = await zai.chat.completions.create({
      messages,
      max_tokens: options?.maxTokens ?? 1024,
      temperature: options?.temperature ?? 0.8,
    })
    const text = response.choices?.[0]?.message?.content
    if (!text) throw new Error('Empty response from ZAI SDK')
    return { text, provider: 'zai-sdk' }
  },
}

// ── Google Gemini ────────────────────────────────────────────────────────────

export const geminiProvider: TextProvider = {
  name: 'google-gemini',
  isAvailable: () => !!process.env.GOOGLE_API_KEY,
  async generate(messages, options) {
    const apiKey = process.env.GOOGLE_API_KEY!
    // Convert to Gemini format
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

    const systemInstruction = messages.find((m) => m.role === 'system')?.content

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
          generationConfig: {
            temperature: options?.temperature ?? 0.8,
            maxOutputTokens: options?.maxTokens ?? 1024,
          },
        }),
      },
    )

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Gemini API error ${res.status}: ${err}`)
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Empty response from Gemini')
    return { text, provider: 'google-gemini', model: 'gemini-2.0-flash' }
  },
}

// ── Groq (ultra-fast inference) ──────────────────────────────────────────────

export const groqProvider: TextProvider = {
  name: 'groq',
  isAvailable: () => !!process.env.GROQ_API_KEY,
  async generate(messages, options) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: options?.temperature ?? 0.8,
        max_tokens: options?.maxTokens ?? 1024,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Groq API error ${res.status}: ${err}`)
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content
    if (!text) throw new Error('Empty response from Groq')
    return { text, provider: 'groq', model: 'llama-3.3-70b-versatile' }
  },
}

// ── OpenRouter (free models) ─────────────────────────────────────────────────

export const openrouterProvider: TextProvider = {
  name: 'openrouter',
  isAvailable: () => !!process.env.OPENROUTER_API_KEY,
  async generate(messages, options) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://tablero.app',
        'X-Title': 'Tablero Design',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat:free',
        messages,
        temperature: options?.temperature ?? 0.8,
        max_tokens: options?.maxTokens ?? 1024,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`OpenRouter API error ${res.status}: ${err}`)
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content
    if (!text) throw new Error('Empty response from OpenRouter')
    return { text, provider: 'openrouter', model: 'deepseek-chat:free' }
  },
}

// ── Cerebras (high volume) ───────────────────────────────────────────────────

export const cerebrasProvider: TextProvider = {
  name: 'cerebras',
  isAvailable: () => !!process.env.CEREBRAS_API_KEY,
  async generate(messages, options) {
    const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CEREBRAS_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b',
        messages,
        temperature: options?.temperature ?? 0.8,
        max_tokens: options?.maxTokens ?? 1024,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Cerebras API error ${res.status}: ${err}`)
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content
    if (!text) throw new Error('Empty response from Cerebras')
    return { text, provider: 'cerebras', model: 'llama-3.3-70b' }
  },
}

// ── Ordered provider list for fallback ───────────────────────────────────────

export const textProviders: TextProvider[] = [
  zaiTextProvider,
  geminiProvider,
  groqProvider,
  openrouterProvider,
  cerebrasProvider,
]
