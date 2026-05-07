import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ProviderCategory = 
  | 'text'
  | 'image'
  | 'image-gen'
  | '3d'
  | 'remove-bg'
  | 'style-transfer'
  | 'vectorize'
  | 'vision'
  | 'img2img'
  | 'upscale'
  | 'inpaint'

export interface ProviderOption {
  name: string
  label: string
  category: ProviderCategory
  requiresKey: string | null
  isFree: boolean
  quality: 'fast' | 'balanced' | 'quality'
  description: string
}

export const PROVIDER_OPTIONS: ProviderOption[] = [
  // Text
  { name: 'zai-sdk', label: 'ZAI SDK', category: 'text', requiresKey: null, isFree: true, quality: 'balanced', description: 'Built-in AI, always available' },
  { name: 'google-gemini', label: 'Google Gemini', category: 'text', requiresKey: 'GOOGLE_API_KEY', isFree: true, quality: 'quality', description: 'Gemini 2.0 Flash, fast and smart' },
  { name: 'groq', label: 'Groq', category: 'text', requiresKey: 'GROQ_API_KEY', isFree: true, quality: 'fast', description: 'Ultra-fast LLaMA 70B inference' },
  { name: 'openrouter', label: 'OpenRouter', category: 'text', requiresKey: 'OPENROUTER_API_KEY', isFree: true, quality: 'balanced', description: 'DeepSeek Chat free tier' },
  { name: 'cerebras', label: 'Cerebras', category: 'text', requiresKey: 'CEREBRAS_API_KEY', isFree: true, quality: 'fast', description: 'High-speed LLaMA 70B' },

  // Image Generation
  { name: 'zai-sdk', label: 'ZAI SDK', category: 'image-gen', requiresKey: null, isFree: true, quality: 'quality', description: 'Built-in image generation' },
  { name: 'pollinations', label: 'Pollinations', category: 'image-gen', requiresKey: null, isFree: true, quality: 'balanced', description: 'Free FLUX generation, no key' },
  { name: 'together', label: 'Together AI', category: 'image-gen', requiresKey: 'TOGETHER_API_KEY', isFree: true, quality: 'fast', description: 'FLUX Schnell, fast & free tier' },
  { name: 'huggingface', label: 'HuggingFace', category: 'image-gen', requiresKey: 'HF_TOKEN', isFree: true, quality: 'quality', description: 'FLUX Dev, quality mode' },
  { name: 'fal-ai', label: 'fal.ai', category: 'image-gen', requiresKey: 'FAL_API_KEY', isFree: false, quality: 'fast', description: '$10 free credits, fast inference' },

  // Image-to-Image
  { name: 'hf-img2img', label: 'HuggingFace I2I', category: 'img2img', requiresKey: 'HF_TOKEN', isFree: true, quality: 'quality', description: 'Real image-to-image with FLUX' },
  { name: 'fal-img2img', label: 'fal.ai I2I', category: 'img2img', requiresKey: 'FAL_API_KEY', isFree: false, quality: 'quality', description: 'FLUX Dev image-to-image' },
  { name: 'together-img2img', label: 'Together I2I', category: 'img2img', requiresKey: 'TOGETHER_API_KEY', isFree: true, quality: 'balanced', description: 'Prompt-guided image editing' },
  { name: 'pollinations-img2img', label: 'Pollinations I2I', category: 'img2img', requiresKey: null, isFree: true, quality: 'balanced', description: 'Free, prompt-only fallback' },

  // Upscale
  { name: 'hf-esrgan', label: 'HuggingFace ESRGAN', category: 'upscale', requiresKey: 'HF_TOKEN', isFree: true, quality: 'quality', description: 'Real-ESRGAN 4x upscaling' },
  { name: 'fal-upscale', label: 'fal.ai Upscale', category: 'upscale', requiresKey: 'FAL_API_KEY', isFree: false, quality: 'quality', description: '2x AI upscaling' },
  { name: 'client-upscale', label: 'Browser Upscale', category: 'upscale', requiresKey: null, isFree: true, quality: 'fast', description: 'Client-side basic upscale' },

  // Inpaint
  { name: 'hf-inpaint', label: 'HuggingFace Inpaint', category: 'inpaint', requiresKey: 'HF_TOKEN', isFree: true, quality: 'quality', description: 'FLUX Fill for inpainting' },
  { name: 'fal-inpaint', label: 'fal.ai Inpaint', category: 'inpaint', requiresKey: 'FAL_API_KEY', isFree: false, quality: 'quality', description: 'FLUX Dev Fill, $10 free' },

  // 3D
  { name: 'hunyuan3d-gradio', label: 'Hunyuan3D', category: '3d', requiresKey: null, isFree: true, quality: 'quality', description: 'Tencent 3D, always free' },
  { name: 'tripo3d', label: 'Tripo3D', category: '3d', requiresKey: 'TRIPO_API_KEY', isFree: true, quality: 'quality', description: '2,000 free credits' },
  { name: 'sf3d-huggingface', label: 'Stable Fast 3D', category: '3d', requiresKey: 'HF_TOKEN', isFree: true, quality: 'fast', description: '0.5s generation speed' },
  { name: 'fal-ai-3d', label: 'fal.ai 3D', category: '3d', requiresKey: 'FAL_API_KEY', isFree: false, quality: 'quality', description: '$10 free credits' },

  // Remove BG
  { name: 'hf-rembg', label: 'HuggingFace Rembg', category: 'remove-bg', requiresKey: 'HF_TOKEN', isFree: true, quality: 'quality', description: 'BRIA RMBG-1.4 model' },
  { name: 'remove-bg', label: 'Remove.bg', category: 'remove-bg', requiresKey: 'REMOVEBG_API_KEY', isFree: true, quality: 'quality', description: 'Professional background removal' },
  { name: 'clipdrop-rembg', label: 'Clipdrop Rembg', category: 'remove-bg', requiresKey: 'CLIPDROP_API_KEY', isFree: false, quality: 'quality', description: 'Stability AI powered' },

  // Style Transfer
  { name: 'hf-style-transfer', label: 'HuggingFace Style', category: 'style-transfer', requiresKey: 'HF_TOKEN', isFree: true, quality: 'balanced', description: 'FLUX prompt-based style' },
  { name: 'pollinations-style', label: 'Pollinations Style', category: 'style-transfer', requiresKey: null, isFree: true, quality: 'balanced', description: 'Free, prompt-only style' },
  { name: 'fal-style-transfer', label: 'fal.ai Style', category: 'style-transfer', requiresKey: 'FAL_API_KEY', isFree: false, quality: 'quality', description: 'Real style transfer with image' },

  // Vectorize
  { name: 'vectorizer-ai', label: 'Vectorizer.ai', category: 'vectorize', requiresKey: 'VECTORIZER_API_KEY', isFree: false, quality: 'quality', description: 'Professional raster-to-SVG' },
  { name: 'hf-vectorize', label: 'HuggingFace SVG', category: 'vectorize', requiresKey: 'HF_TOKEN', isFree: true, quality: 'balanced', description: 'SVG tracer via HF Spaces' },

  // Vision
  { name: 'zai-vlm', label: 'ZAI Vision', category: 'vision', requiresKey: null, isFree: true, quality: 'balanced', description: 'Built-in VLM, always available' },
  { name: 'gemini-vision', label: 'Gemini Vision', category: 'vision', requiresKey: 'GOOGLE_API_KEY', isFree: true, quality: 'quality', description: 'Gemini 2.0 Flash Vision' },
]

export interface ProviderState {
  // Selected providers per category (null = auto/fallback)
  selectedProviders: Record<ProviderCategory, string | null>
  
  // Actions
  setProvider: (category: ProviderCategory, providerName: string | null) => void
  getProvider: (category: ProviderCategory) => string | null
  getProvidersForCategory: (category: ProviderCategory) => ProviderOption[]
  resetToDefaults: () => void
}

const defaultSelections: Record<ProviderCategory, string | null> = {
  text: null,
  image: null,
  'image-gen': null,
  '3d': null,
  'remove-bg': null,
  'style-transfer': null,
  vectorize: null,
  vision: null,
  img2img: null,
  upscale: null,
  inpaint: null,
}

export const useProviderStore = create<ProviderState>()(
  persist(
    (set, get) => ({
      selectedProviders: { ...defaultSelections },

      setProvider: (category, providerName) =>
        set((state) => ({
          selectedProviders: { ...state.selectedProviders, [category]: providerName },
        })),

      getProvider: (category) => get().selectedProviders[category],

      getProvidersForCategory: (category) =>
        PROVIDER_OPTIONS.filter((p) => p.category === category),

      resetToDefaults: () => set({ selectedProviders: { ...defaultSelections } }),
    }),
    {
      name: 'tablero-provider-settings',
    }
  )
)
