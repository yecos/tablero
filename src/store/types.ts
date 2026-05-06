export interface ConnectionPoint {
  id: string
  x: number  // relative to element center
  y: number  // relative to element center
  label?: string
}

export interface NodeEdge {
  id: string
  sourceId: string
  sourcePointId: string
  targetId: string
  targetPointId: string
  color?: string
  label?: string
}

export interface DesignElement {
  id: string
  type: 'image' | 'text' | 'shape' | 'group' | '3d'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  content: string
  src?: string
  color?: string
  fontSize?: number
  fontFamily?: string
  selected: boolean
  locked: boolean
  visible: boolean
  opacity: number
  // Edit Elements / Image-to-Editable support
  isEditableLayer?: boolean
  parentImageId?: string
  layerType?: 'background' | 'subject' | 'text' | 'object' | 'decoration' | 'effect'
  layerName?: string
  // 3D support
  modelUrl?: string
  modelData?: string
  isGenerating3D?: boolean
  connectionPoints?: ConnectionPoint[]
}

export interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  elements: string[]
}

export interface ImageAnalysis {
  description: string
  style: string
  elements: ImageAnalysisElement[]
  textElements: ImageTextElement[]
}

export interface ImageAnalysisElement {
  id: string
  name: string
  type: 'background' | 'subject' | 'text' | 'object' | 'decoration' | 'effect'
  description: string
  position: string
  generatePrompt: string
  removePrompt: string
}

export interface ImageTextElement {
  id: string
  text: string
  name: string
  style: string
  position: string
  fontSize: string
}

export interface SplitLayer {
  id: string
  name: string
  type: string
  imageUrl: string | null
  base64: string | null
  error?: string
}

export interface ImageSplitState {
  isAnalyzing: boolean
  isSplitting: boolean
  originalImageId: string | null
  analysis: ImageAnalysis | null
  splitLayers: SplitLayer[]
  showSplitPanel: boolean
}

export interface BrandKitData {
  brandName: string
  colors: Record<string, string>
  fonts: {
    heading: string
    headingStyle: string
    body: string
    bodyStyle: string
  }
  voice: {
    tone: string
    personality: string[]
    keywords: string[]
  }
  logoConcept: string
  tagline: string
}
