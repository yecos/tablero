import ZAI from 'z-ai-web-dev-sdk'

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null

export async function getAIClient() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

export interface ImageGenerationOptions {
  prompt: string
  size?: '1024x1024' | '1344x768' | '768x1344' | '864x1152' | '1152x864' | '1440x720' | '720x1440'
  negativePrompt?: string
  style?: string
  model?: string
}

export interface ImageGenerationResult {
  imageUrl: string | null
  base64: string | null
  prompt: string
  size: string
}

export async function generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
  const zai = await getAIClient()

  const validSizes = ['1024x1024', '1344x768', '768x1344', '864x1152', '1152x864', '1440x720', '720x1440'] as const
  const imageSize = validSizes.includes(options.size || '' as typeof validSizes[number]) ? options.size! : '1024x1024' as const

  const enhancedPrompt = options.style
    ? `${options.prompt}, ${options.style} style`
    : options.prompt

  const response = await zai.images.generations.create({
    prompt: enhancedPrompt,
    size: imageSize,
  })

  if (!response.data || response.data.length === 0) {
    throw new Error('No se generó ninguna imagen. Intenta con un prompt diferente.')
  }

  const imageData = response.data[0] as { base64?: string; url?: string; b64_json?: string }

  return {
    imageUrl: imageData.url || null,
    base64: imageData.b64_json || imageData.base64 || null,
    prompt: options.prompt,
    size: imageSize,
  }
}
