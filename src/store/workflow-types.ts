// Workflow Node Types and Interfaces

export type PortDataType = 'text' | 'image' | 'model3d' | 'brandKit' | 'imageLayers' | 'color' | 'number' | 'any'

export interface WorkflowPort {
  id: string
  name: string
  dataType: PortDataType
  direction: 'input' | 'output'
}

export type WorkflowNodeType =
  | 'text-ai'          // AI text generation / prompt
  | 'image-gen'        // AI image generation from prompt
  | 'image-edit'       // Edit/decompose image layers
  | '3d-gen'           // Image to 3D conversion
  | 'brand-kit'        // Brand kit generation
  | 'remove-bg'        // Remove image background
  | 'style-transfer'   // Apply artistic style to image
  | 'svg-vectorize'    // Convert raster image to SVG
  | 'output'           // Preview/display node
  | 'text-input'       // Manual text input
  | 'image-input'      // Manual image upload
  | 'color-picker'     // Color selection
  | 'number-input'     // Numeric value input
  | 'image-transform'  // Transform images (resize, filter, etc.)
  | 'text-template'    // Template with variable substitution
  | 'condition'        // Conditional branching
  | 'merge'            // Combine multiple inputs
  | 'note'             // Documentation/comment node
  | 'export'           // Download/export results

export type WorkflowNodeStatus = 'idle' | 'running' | 'completed' | 'error'

export interface WorkflowNode {
  id: string
  type: WorkflowNodeType
  x: number
  y: number
  width: number
  height: number
  title: string
  status: WorkflowNodeStatus
  ports: WorkflowPort[]
  // Node-specific data
  data: Record<string, unknown>
  // Results
  outputs: Record<string, PortDataValue>
  errorMessage?: string
}

export interface PortDataValue {
  dataType: PortDataType
  value: unknown
  meta?: Record<string, unknown>
}

export interface WorkflowConnection {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
}

export interface Workflow {
  id: string
  name: string
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
}

// ---- Node Type Definitions ----

export interface TextAINodeData {
  prompt: string
  systemPrompt: string
  temperature: number
  maxTokens: number
}

export interface ImageGenNodeData {
  prompt: string
  negativePrompt: string
  size: '1024x1024' | '1344x768' | '768x1344' | '1152x864' | '864x1152'
  style: 'vivid' | 'natural'
}

export interface ImageEditNodeData {
  mode: 'analyze' | 'split'
  selectedLayers: string[]
}

export interface ThreeDGenNodeData {
  // Takes image input, generates 3D
}

export interface BrandKitNodeData {
  prompt: string
  industry: string
}

export interface OutputNodeData {
  // Display/preview node
}

export interface TextInputNodeData {
  text: string
}

export interface ImageInputNodeData {
  imageBase64: string
  fileName: string
}

export interface ColorPickerNodeData {
  color: string
}

export interface NumberInputNodeData {
  value: number
  min: number
  max: number
  step: number
}

export interface ImageTransformNodeData {
  mode: 'resize' | 'filter' | 'adjust'
  width: number
  height: number
  filter: 'none' | 'grayscale' | 'sepia' | 'invert' | 'blur' | 'sharpen'
  brightness: number
  contrast: number
  saturation: number
}

export interface TextTemplateNodeData {
  template: string
}

export interface ConditionNodeData {
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
}

export interface MergeNodeData {
  mode: 'concat' | 'array' | 'first' | 'last'
}

export interface NoteNodeData {
  content: string
  color: string
}

export interface ExportNodeData {
  format: 'png' | 'txt' | 'json' | 'svg'
  fileName: string
}

export interface RemoveBgNodeData {
  // Takes image input, outputs image with transparent background
}

export interface StyleTransferNodeData {
  stylePrompt: string
}

export interface SvgVectorizeNodeData {
  // Takes image input, outputs SVG text
}

// ---- Type Compatibility ----

export function isTypeCompatible(source: PortDataType, target: PortDataType): boolean {
  if (target === 'any' || source === 'any') return true
  if (source === target) return true
  // color and number are compatible with text
  if (target === 'text' && (source === 'color' || source === 'number')) return true
  // color is compatible with number (hex value)
  if (target === 'number' && source === 'color') return true
  return false
}

// ---- Default Node Configurations ----

export const NODE_DEFAULTS: Record<WorkflowNodeType, {
  title: string
  width: number
  height: number
  color: string
  icon: string
  category: 'input' | 'ai' | 'transform' | 'logic' | 'output'
  ports: Omit<WorkflowPort, 'id'>[]
  defaultData: Record<string, unknown>
}> = {
  // ── Input Nodes ──────────────────────────────────────────────
  'text-input': {
    title: 'Text Input',
    width: 280,
    height: 200,
    color: '#64748b', // slate
    icon: 'text-input',
    category: 'input',
    ports: [
      { name: 'Text', dataType: 'text', direction: 'output' },
    ],
    defaultData: {
      text: '',
    },
  },
  'image-input': {
    title: 'Image Input',
    width: 280,
    height: 260,
    color: '#e11d48', // rose
    icon: 'image-input',
    category: 'input',
    ports: [
      { name: 'Image', dataType: 'image', direction: 'output' },
    ],
    defaultData: {
      imageBase64: '',
      fileName: '',
    },
  },
  'color-picker': {
    title: 'Color Picker',
    width: 280,
    height: 160,
    color: '#f43f5e', // rose-500
    icon: 'color',
    category: 'input',
    ports: [
      { name: 'Color', dataType: 'color', direction: 'output' },
    ],
    defaultData: {
      color: '#8b5cf6',
    },
  },
  'number-input': {
    title: 'Number Input',
    width: 280,
    height: 160,
    color: '#0ea5e9', // sky
    icon: 'number',
    category: 'input',
    ports: [
      { name: 'Value', dataType: 'number', direction: 'output' },
    ],
    defaultData: {
      value: 50,
      min: 0,
      max: 100,
      step: 1,
    },
  },

  // ── AI Nodes ─────────────────────────────────────────────────
  'text-ai': {
    title: 'AI Text',
    width: 280,
    height: 220,
    color: '#8b5cf6', // purple
    icon: 'text',
    category: 'ai',
    ports: [
      { name: 'Context', dataType: 'text', direction: 'input' },
      { name: 'Prompt', dataType: 'text', direction: 'output' },
    ],
    defaultData: {
      prompt: '',
      systemPrompt: 'You are a creative design assistant.',
      temperature: 0.7,
      maxTokens: 500,
    },
  },
  'image-gen': {
    title: 'Image Gen',
    width: 280,
    height: 320,
    color: '#ec4899', // pink
    icon: 'image',
    category: 'ai',
    ports: [
      { name: 'Prompt', dataType: 'text', direction: 'input' },
      { name: 'Image', dataType: 'image', direction: 'output' },
    ],
    defaultData: {
      prompt: '',
      negativePrompt: '',
      size: '1024x1024',
      style: 'vivid',
    },
  },
  'image-edit': {
    title: 'Image Edit',
    width: 280,
    height: 280,
    color: '#f59e0b', // amber
    icon: 'edit',
    category: 'ai',
    ports: [
      { name: 'Image', dataType: 'image', direction: 'input' },
      { name: 'Layers', dataType: 'imageLayers', direction: 'output' },
    ],
    defaultData: {
      mode: 'analyze',
      selectedLayers: [],
    },
  },
  '3d-gen': {
    title: '3D Gen',
    width: 280,
    height: 340,
    color: '#06b6d4', // cyan
    icon: '3d',
    category: 'ai',
    ports: [
      { name: 'Image', dataType: 'image', direction: 'input' },
      { name: '3D Model', dataType: 'model3d', direction: 'output' },
    ],
    defaultData: {},
  },
  'brand-kit': {
    title: 'Brand Kit',
    width: 280,
    height: 260,
    color: '#10b981', // emerald
    icon: 'brand',
    category: 'ai',
    ports: [
      { name: 'Prompt', dataType: 'text', direction: 'input' },
      { name: 'Brand Kit', dataType: 'brandKit', direction: 'output' },
    ],
    defaultData: {
      prompt: '',
      industry: '',
    },
  },
  'remove-bg': {
    title: 'Remove BG',
    width: 280,
    height: 260,
    color: '#ef4444', // red
    icon: 'scissors',
    category: 'ai',
    ports: [
      { name: 'Image', dataType: 'image', direction: 'input' },
      { name: 'Image', dataType: 'image', direction: 'output' },
    ],
    defaultData: {},
  },
  'style-transfer': {
    title: 'Style Transfer',
    width: 280,
    height: 300,
    color: '#a855f7', // purple
    icon: 'palette',
    category: 'ai',
    ports: [
      { name: 'Image', dataType: 'image', direction: 'input' },
      { name: 'Style', dataType: 'text', direction: 'input' },
      { name: 'Image', dataType: 'image', direction: 'output' },
    ],
    defaultData: {
      stylePrompt: '',
    },
  },
  'svg-vectorize': {
    title: 'SVG Vectorize',
    width: 280,
    height: 260,
    color: '#22c55e', // green
    icon: 'pen-tool',
    category: 'ai',
    ports: [
      { name: 'Image', dataType: 'image', direction: 'input' },
      { name: 'SVG', dataType: 'text', direction: 'output' },
    ],
    defaultData: {},
  },

  // ── Transform Nodes ──────────────────────────────────────────
  'image-transform': {
    title: 'Image Transform',
    width: 280,
    height: 300,
    color: '#d946ef', // fuchsia
    icon: 'transform',
    category: 'transform',
    ports: [
      { name: 'Image', dataType: 'image', direction: 'input' },
      { name: 'Image', dataType: 'image', direction: 'output' },
    ],
    defaultData: {
      mode: 'resize',
      width: 512,
      height: 512,
      filter: 'none',
      brightness: 100,
      contrast: 100,
      saturation: 100,
    },
  },
  'text-template': {
    title: 'Text Template',
    width: 280,
    height: 240,
    color: '#7c3aed', // violet
    icon: 'template',
    category: 'transform',
    ports: [
      { name: 'Var 1', dataType: 'text', direction: 'input' },
      { name: 'Var 2', dataType: 'text', direction: 'input' },
      { name: 'Var 3', dataType: 'text', direction: 'input' },
      { name: 'Text', dataType: 'text', direction: 'output' },
    ],
    defaultData: {
      template: 'Hello {{1}}, welcome to {{2}}!',
    },
  },

  // ── Logic Nodes ──────────────────────────────────────────────
  'condition': {
    title: 'Condition',
    width: 280,
    height: 220,
    color: '#f97316', // orange
    icon: 'condition',
    category: 'logic',
    ports: [
      { name: 'Value', dataType: 'any', direction: 'input' },
      { name: 'Compare', dataType: 'any', direction: 'input' },
      { name: 'True', dataType: 'any', direction: 'output' },
      { name: 'False', dataType: 'any', direction: 'output' },
    ],
    defaultData: {
      operator: 'equals',
    },
  },
  'merge': {
    title: 'Merge',
    width: 280,
    height: 200,
    color: '#14b8a6', // teal
    icon: 'merge',
    category: 'logic',
    ports: [
      { name: 'Input 1', dataType: 'any', direction: 'input' },
      { name: 'Input 2', dataType: 'any', direction: 'input' },
      { name: 'Input 3', dataType: 'any', direction: 'input' },
      { name: 'Merged', dataType: 'any', direction: 'output' },
    ],
    defaultData: {
      mode: 'concat',
    },
  },

  // ── Output Nodes ─────────────────────────────────────────────
  'output': {
    title: 'Output',
    width: 280,
    height: 300,
    color: '#6366f1', // indigo
    icon: 'output',
    category: 'output',
    ports: [
      { name: 'Input', dataType: 'any', direction: 'input' },
    ],
    defaultData: {},
  },
  'export': {
    title: 'Export',
    width: 280,
    height: 200,
    color: '#a855f7', // purple-500
    icon: 'export',
    category: 'output',
    ports: [
      { name: 'Data', dataType: 'any', direction: 'input' },
    ],
    defaultData: {
      format: 'png',
      fileName: 'export',
    },
  },
  'note': {
    title: 'Note',
    width: 240,
    height: 160,
    color: '#eab308', // yellow
    icon: 'note',
    category: 'output',
    ports: [],
    defaultData: {
      content: '',
      color: '#eab308',
    },
  },
}
