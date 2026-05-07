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
    const body = await request.json()

    // Support two formats:
    // Format 1 (Direct): { description }
    // Format 2 (Workflow engine): { prompt, industry }
    let description: string
    let industry: string = ''

    if (body.description) {
      description = body.description
      industry = body.industry || ''
    } else if (body.prompt) {
      description = body.prompt
      industry = body.industry || ''
    } else {
      return NextResponse.json({ error: 'Brand description or prompt is required' }, { status: 400 })
    }

    const zai = await getZAI()

    const contextStr = industry ? ` in the ${industry} industry` : ''
    const prompt = `Generate a complete brand kit for the following brand${contextStr}: "${description}"

Return a JSON object with exactly this structure (no markdown, no extra text, just pure JSON):
{
  "brandName": "Brand Name",
  "colors": {
    "primary": "#hexcode",
    "secondary": "#hexcode",
    "accent": "#hexcode",
    "background": "#hexcode",
    "text": "#hexcode"
  },
  "fonts": {
    "heading": "Font Name",
    "body": "Font Name",
    "headingStyle": "description of heading style",
    "bodyStyle": "description of body style"
  },
  "voice": {
    "tone": "e.g., Professional yet approachable",
    "personality": ["trait1", "trait2", "trait3"],
    "keywords": ["keyword1", "keyword2", "keyword3"]
  },
  "logoConcept": "Detailed description of a logo concept that would work for this brand",
  "tagline": "A catchy tagline for the brand",
  "styleKeywords": ["modern", "minimalist", "etc"]
}

Make sure all hex colors are valid and visually cohesive. The fonts should be real, well-known font families. Be creative and specific.`

    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a professional brand identity designer. You create cohesive, beautiful brand kits. Always respond with valid JSON only, no markdown formatting or code blocks.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    })

    const content = response.choices?.[0]?.message?.content || ''

    let brandKit
    try {
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      brandKit = JSON.parse(cleanedContent)
    } catch {
      brandKit = {
        brandName: description,
        colors: {
          primary: '#8b5cf6',
          secondary: '#6366f1',
          accent: '#22d3ee',
          background: '#0a0a0f',
          text: '#f8fafc',
        },
        fonts: {
          heading: 'Inter',
          body: 'Inter',
          headingStyle: 'Bold, modern sans-serif',
          bodyStyle: 'Clean, readable sans-serif',
        },
        voice: {
          tone: 'Professional yet creative',
          personality: ['innovative', 'reliable', 'creative'],
          keywords: ['design', 'AI', 'creativity'],
        },
        logoConcept: `A modern, geometric mark that represents ${description}`,
        tagline: 'Design the future with AI',
        styleKeywords: ['modern', 'clean', 'innovative'],
      }
    }

    // Return in format that works for both direct use and workflow engine
    // Workflow engine expects the data directly accessible
    return NextResponse.json({
      brandKit,
      // Also expose color arrays for easy workflow consumption
      colors: brandKit.colors ? Object.values(brandKit.colors) : [],
      fonts: brandKit.fonts ? [brandKit.fonts.heading, brandKit.fonts.body] : [],
      tagline: brandKit.tagline || '',
    })
  } catch (error) {
    console.error('Brand kit API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate brand kit. Please try again.' },
      { status: 500 }
    )
  }
}
