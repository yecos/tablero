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

// ── Convenience functions with automatic fallback ────────────────────────────

import { tryProviders, type TextGenResult, type ImageGenResult, type ThreeDGenResult, type RemoveBgResult, type StyleTransferResult, type VectorizeResult, type VisionResult } from './types'
import { textProviders } from './text-providers'
import { imageProviders } from './image-providers'
import { threeDProviders } from './threed-providers'
import { removeBgProviders, styleTransferProviders, vectorizeProviders, visionProviders } from './design-providers'

/**
 * Generate text using available providers with automatic fallback.
 * Tries: ZAI → Gemini → Groq → OpenRouter → Cerebras
 */
export async function generateText(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: { temperature?: number; maxTokens?: number },
): Promise<TextGenResult> {
  return tryProviders<TextGenResult>('text', textProviders.map((p) => ({
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
): Promise<ImageGenResult> {
  return tryProviders<ImageGenResult>('image', imageProviders.map((p) => ({
    provider: p,
    fn: () => p.generate(prompt, options),
  })))
}

/**
 * Generate a 3D model using available providers with automatic fallback.
 * Tries: Hunyuan3D → Tripo3D → SF3D → fal.ai → Fallback Cube
 */
export async function generate3D(imageBase64: string): Promise<ThreeDGenResult> {
  return tryProviders<ThreeDGenResult>('3d', threeDProviders.map((p) => ({
    provider: p,
    fn: () => p.generate(imageBase64),
  })))
}

/**
 * Remove image background using available providers with automatic fallback.
 * Tries: HF Rembg → Remove.bg → Clipdrop
 */
export async function removeBackground(imageBase64: string): Promise<RemoveBgResult> {
  return tryProviders<RemoveBgResult>('remove-bg', removeBgProviders.map((p) => ({
    provider: p,
    fn: () => p.removeBackground(imageBase64),
  })))
}

/**
 * Apply style transfer using available providers with automatic fallback.
 * Tries: HF Style → Pollinations → fal.ai
 */
export async function transferStyle(imageBase64: string, stylePrompt: string): Promise<StyleTransferResult> {
  return tryProviders<StyleTransferResult>('style-transfer', styleTransferProviders.map((p) => ({
    provider: p,
    fn: () => p.transferStyle(imageBase64, stylePrompt),
  })))
}

/**
 * Vectorize a raster image to SVG using available providers with automatic fallback.
 * Tries: Vectorizer.ai → HF Vectorize
 */
export async function vectorizeImage(imageBase64: string): Promise<VectorizeResult> {
  return tryProviders<VectorizeResult>('vectorize', vectorizeProviders.map((p) => ({
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
): Promise<VisionResult> {
  return tryProviders<VisionResult>('vision', visionProviders.map((p) => ({
    provider: p,
    fn: () => p.analyze(imageUrl, prompt, options),
  })))
}
