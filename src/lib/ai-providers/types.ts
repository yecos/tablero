// ---------------------------------------------------------------------------
// AI Provider System — Common Types
// ---------------------------------------------------------------------------
// Each provider implements a consistent interface. The `tryProviders()` function
// tries providers in priority order with automatic fallback on failure.

/** Result of a text generation call */
export interface TextGenResult {
  text: string
  provider: string
  model?: string
}

/** Result of an image generation call */
export interface ImageGenResult {
  /** base64-encoded image data OR a public URL */
  url: string
  /** Whether `url` is base64 (data URL) vs a remote URL */
  isBase64: boolean
  provider: string
  model?: string
}

/** Result of a 3D generation call */
export interface ThreeDGenResult {
  /** base64-encoded GLB data */
  modelBase64: string
  provider: string
  isFallback?: boolean
}

/** Result of a remove-background call */
export interface RemoveBgResult {
  /** base64-encoded PNG with transparent background */
  imageBase64: string
  provider: string
}

/** Result of a style-transfer call */
export interface StyleTransferResult {
  /** base64-encoded or URL of the styled image */
  image: string
  isBase64: boolean
  provider: string
}

/** Result of a vectorization call */
export interface VectorizeResult {
  /** SVG string */
  svg: string
  provider: string
}

/** Result of a vision/analysis call */
export interface VisionResult {
  text: string
  provider: string
  model?: string
}

// ---------------------------------------------------------------------------
// Provider interfaces — one per capability
// ---------------------------------------------------------------------------

export interface TextProvider {
  name: string
  /** Return true when this provider is available (has API key, etc.) */
  isAvailable: () => boolean
  /** Generate text from messages */
  generate: (messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>, options?: { temperature?: number; maxTokens?: number }) => Promise<TextGenResult>
}

export interface ImageProvider {
  name: string
  isAvailable: () => boolean
  /** Generate an image from a text prompt */
  generate: (prompt: string, options?: { size?: string; negativePrompt?: string; style?: string }) => Promise<ImageGenResult>
}

export interface ThreeDProvider {
  name: string
  isAvailable: () => boolean
  /** Generate a 3D model from an image */
  generate: (imageBase64: string) => Promise<ThreeDGenResult>
}

export interface RemoveBgProvider {
  name: string
  isAvailable: () => boolean
  removeBackground: (imageBase64: string) => Promise<RemoveBgResult>
}

export interface StyleTransferProvider {
  name: string
  isAvailable: () => boolean
  transferStyle: (imageBase64: string, stylePrompt: string) => Promise<StyleTransferResult>
}

export interface VectorizeProvider {
  name: string
  isAvailable: () => boolean
  vectorize: (imageBase64: string) => Promise<VectorizeResult>
}

export interface VisionProvider {
  name: string
  isAvailable: () => boolean
  /** Analyze an image with a text prompt and return the AI response */
  analyze: (imageUrl: string, prompt: string, options?: { maxTokens?: number }) => Promise<VisionResult>
}

/** Result of an image-to-image transformation call */
export interface ImageToImageResult {
  /** base64-encoded or URL of the transformed image */
  image: string
  isBase64: boolean
  provider: string
  model?: string
}

/** Result of an upscaling call */
export interface UpscaleResult {
  /** base64-encoded or URL of the upscaled image */
  image: string
  isBase64: boolean
  provider: string
  scale?: number
}

/** Result of an inpainting/outpainting call */
export interface InpaintResult {
  /** base64-encoded or URL of the inpainted image */
  image: string
  isBase64: boolean
  provider: string
}

export interface ImageToImageProvider {
  name: string
  isAvailable: () => boolean
  /** Transform an image using a text prompt as guidance */
  transform: (imageBase64: string, prompt: string, options?: { strength?: number; negativePrompt?: string }) => Promise<ImageToImageResult>
}

export interface UpscaleProvider {
  name: string
  isAvailable: () => boolean
  /** Upscale an image to a higher resolution */
  upscale: (imageBase64: string, options?: { scale?: number }) => Promise<UpscaleResult>
}

export interface InpaintProvider {
  name: string
  isAvailable: () => boolean
  /** Inpaint/outpaint an image */
  inpaint: (imageBase64: string, maskBase64: string, prompt: string, options?: { direction?: string }) => Promise<InpaintResult>
}

// ---------------------------------------------------------------------------
// Generic fallback runner
// ---------------------------------------------------------------------------

export class ProviderExhaustedError extends Error {
  constructor(category: string, errors: string[]) {
    super(`All ${category} providers failed: ${errors.join('; ')}`)
    this.name = 'ProviderExhaustedError'
  }
}

/**
 * Try each provider in order. Return the first successful result.
 * If all fail, throw ProviderExhaustedError with all error messages.
 */
export async function tryProviders<T>(
  category: string,
  providers: Array<{ provider: { name: string; isAvailable: () => boolean }; fn: () => Promise<T> }>,
): Promise<T> {
  const errors: string[] = []

  for (const { provider, fn } of providers) {
    if (!provider.isAvailable()) {
      errors.push(`${provider.name}: not available (missing API key)`)
      continue
    }

    try {
      const result = await fn()
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`${provider.name}: ${msg}`)
      console.warn(`[ai-providers] ${category} provider "${provider.name}" failed: ${msg}`)
    }
  }

  throw new ProviderExhaustedError(category, errors)
}
