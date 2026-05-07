// ---------------------------------------------------------------------------
// AI Provider System — Unified Exports
// ---------------------------------------------------------------------------
// This is the main entry point for all AI providers. It exports:
// 1. Individual provider instances
// 2. Ordered provider arrays for each category
// 3. The `tryProviders()` fallback runner
// 4. Convenience functions that run providers with automatic fallback

export * from './types'

// ── Provider arrays ──────────────────────────────────────────────────────────
export { textProviders, zaiTextProvider, geminiProvider, groqProvider, openrouterProvider, cerebrasProvider } from './text-providers'
export { imageProviders, zaiImageProvider, pollinationsProvider, togetherImageProvider, huggingfaceImageProvider, falImageProvider } from './image-providers'
export { threeDProviders, hunyuan3dProvider, tripo3dProvider, sf3dProvider, fal3dProvider, fallback3dProvider, createFallbackGLB } from './threed-providers'
export { removeBgProviders, styleTransferProviders, vectorizeProviders, visionProviders, hfRembgProvider, removebgProvider, clipdropRembgProvider, hfStyleTransferProvider, pollinationsStyleProvider, falStyleTransferProvider, vectorizerProvider, hfVectorizerProvider, zaiVisionProvider, geminiVisionProvider } from './design-providers'
export { imageToImageProviders, upscaleProviders, inpaintProviders, hfImageToImageProvider, togetherImageToImageProvider, falImageToImageProvider, pollinationsImageToImageProvider, hfUpscaleProvider, falUpscaleProvider, clientUpscaleProvider, hfInpaintProvider, falInpaintProvider } from './transform-providers'

// ── Convenience functions with automatic fallback ────────────────────────────

import { tryProviders, type TextGenResult, type ImageGenResult, type ThreeDGenResult, type RemoveBgResult, type StyleTransferResult, type VectorizeResult, type VisionResult, type ImageToImageResult, type UpscaleResult, type InpaintResult } from './types'
import { textProviders } from './text-providers'
import { imageProviders } from './image-providers'
import { threeDProviders } from './threed-providers'
import { removeBgProviders, styleTransferProviders, vectorizeProviders, visionProviders } from './design-providers'
import { imageToImageProviders, upscaleProviders, inpaintProviders } from './transform-providers'

/**
 * Generate text using available providers with automatic fallback.
 * Tries: ZAI → Gemini → Groq → OpenRouter → Cerebras
 */
export async function generateText(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: { temperature?: number; maxTokens?: number },
  preferredProvider?: string,
): Promise<TextGenResult> {
  const providers = preferredProvider
    ? textProviders.filter(p => p.name === preferredProvider)
    : textProviders
  return tryProviders<TextGenResult>('text', providers.map((p) => ({
    provider: p,
    fn: () => p.generate(messages, options),
  })))
}

/**
 * Generate an image using available providers with automatic fallback.
 * Tries: ZAI → Pollinations → Together → HuggingFace → fal.ai
 */
export async function generateImage(
  prompt: string,
  options?: { size?: string; negativePrompt?: string; style?: string },
  preferredProvider?: string,
): Promise<ImageGenResult> {
  const providers = preferredProvider
    ? imageProviders.filter(p => p.name === preferredProvider)
    : imageProviders
  return tryProviders<ImageGenResult>('image', providers.map((p) => ({
    provider: p,
    fn: () => p.generate(prompt, options),
  })))
}

/**
 * Generate a 3D model using available providers with automatic fallback.
 * Tries: Hunyuan3D → Tripo3D → SF3D → fal.ai → Fallback Cube
 */
export async function generate3D(imageBase64: string, preferredProvider?: string): Promise<ThreeDGenResult> {
  const providers = preferredProvider
    ? threeDProviders.filter(p => p.name === preferredProvider)
    : threeDProviders
  return tryProviders<ThreeDGenResult>('3d', providers.map((p) => ({
    provider: p,
    fn: () => p.generate(imageBase64),
  })))
}

/**
 * Remove image background using available providers with automatic fallback.
 * Tries: HF Rembg → Remove.bg → Clipdrop
 */
export async function removeBackground(imageBase64: string, preferredProvider?: string): Promise<RemoveBgResult> {
  const providers = preferredProvider
    ? removeBgProviders.filter(p => p.name === preferredProvider)
    : removeBgProviders
  return tryProviders<RemoveBgResult>('remove-bg', providers.map((p) => ({
    provider: p,
    fn: () => p.removeBackground(imageBase64),
  })))
}

/**
 * Apply style transfer using available providers with automatic fallback.
 * Tries: HF Style → Pollinations → fal.ai
 */
export async function transferStyle(imageBase64: string, stylePrompt: string, preferredProvider?: string): Promise<StyleTransferResult> {
  const providers = preferredProvider
    ? styleTransferProviders.filter(p => p.name === preferredProvider)
    : styleTransferProviders
  return tryProviders<StyleTransferResult>('style-transfer', providers.map((p) => ({
    provider: p,
    fn: () => p.transferStyle(imageBase64, stylePrompt),
  })))
}

/**
 * Vectorize a raster image to SVG using available providers with automatic fallback.
 * Tries: Vectorizer.ai → HF Vectorize
 */
export async function vectorizeImage(imageBase64: string, preferredProvider?: string): Promise<VectorizeResult> {
  const providers = preferredProvider
    ? vectorizeProviders.filter(p => p.name === preferredProvider)
    : vectorizeProviders
  return tryProviders<VectorizeResult>('vectorize', providers.map((p) => ({
    provider: p,
    fn: () => p.vectorize(imageBase64),
  })))
}

/**
 * Analyze an image using vision providers with automatic fallback.
 * Tries: ZAI VLM → Gemini Vision
 */
export async function analyzeImage(
  imageUrl: string,
  prompt: string,
  options?: { maxTokens?: number },
  preferredProvider?: string,
): Promise<VisionResult> {
  const providers = preferredProvider
    ? visionProviders.filter(p => p.name === preferredProvider)
    : visionProviders
  return tryProviders<VisionResult>('vision', providers.map((p) => ({
    provider: p,
    fn: () => p.analyze(imageUrl, prompt, options),
  })))
}

/**
 * Transform an image using a text prompt (image-to-image).
 * For real style transfer, sketch-to-image, and guided editing.
 * Tries: HF img2img → fal.ai img2img → Together img2img → Pollinations
 */
export async function transformImage(
  imageBase64: string,
  prompt: string,
  options?: { strength?: number; negativePrompt?: string },
  preferredProvider?: string,
): Promise<ImageToImageResult> {
  const providers = preferredProvider
    ? imageToImageProviders.filter(p => p.name === preferredProvider)
    : imageToImageProviders
  return tryProviders<ImageToImageResult>('img2img', providers.map((p) => ({
    provider: p,
    fn: () => p.transform(imageBase64, prompt, options),
  })))
}

/**
 * Upscale an image to higher resolution.
 * Tries: HF ESRGAN → fal.ai Upscale → Client fallback
 */
export async function upscaleImage(
  imageBase64: string,
  options?: { scale?: number },
  preferredProvider?: string,
): Promise<UpscaleResult> {
  const providers = preferredProvider
    ? upscaleProviders.filter(p => p.name === preferredProvider)
    : upscaleProviders
  return tryProviders<UpscaleResult>('upscale', providers.map((p) => ({
    provider: p,
    fn: () => p.upscale(imageBase64, options),
  })))
}

/**
 * Inpaint or outpaint an image using a mask and prompt.
 * Tries: HF Inpaint → fal.ai Inpaint
 */
export async function inpaintImage(
  imageBase64: string,
  maskBase64: string,
  prompt: string,
  options?: { direction?: string },
  preferredProvider?: string,
): Promise<InpaintResult> {
  const providers = preferredProvider
    ? inpaintProviders.filter(p => p.name === preferredProvider)
    : inpaintProviders
  return tryProviders<InpaintResult>('inpaint', providers.map((p) => ({
    provider: p,
    fn: () => p.inpaint(imageBase64, maskBase64, prompt, options),
  })))
}
