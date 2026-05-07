import ZAI from 'z-ai-web-dev-sdk'
import { generateImage as providerGenerateImage } from './ai-providers'

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
  // Use the provider system with automatic fallback
  const result = await providerGenerateImage(options.prompt, {
    size: options.size,
    negativePrompt: options.negativePrompt,
    style: options.style,
  })

  return {
    imageUrl: result.isBase64 ? null : result.url,
    base64: result.isBase64 ? result.url.replace(/^data:image\/\w+;base64,/, '') : null,
    prompt: options.prompt,
    size: options.size || '1024x1024',
  }
}
