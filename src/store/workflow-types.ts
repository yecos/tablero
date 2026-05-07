// Workflow Node Types and Interfaces

export type PortDataType = 'text' | 'image' | 'model3d' | 'brandKit' | 'imageLayers' | 'any'

export interface WorkflowPort {
  id: string
  name: string
  dataType: PortDataType
  direction: 'input' | 'output'
}

export type WorkflowNodeType =
  | 'text-ai'        // AI text generation / prompt
  | 'image-gen'      // AI image generation from prompt
  | 'image-edit'     // Edit/decompose image layers
  | '3d-gen'         // Image to 3D conversion
  | 'brand-kit'      // Brand kit generation
  | 'output'         // Preview/display node

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

// ---- Default Node Configurations ----

export const NODE_DEFAULTS: Record<WorkflowNodeType, {
  title: string
  width: number
  height: number
  color: string
  icon: string
  ports: Omit<WorkflowPort, 'id'>[]
  defaultData: Record<string, unknown>
}> = {
  'text-ai': {
    title: 'AI Text',
    width: 280,
    height: 220,
    color: '#8b5cf6', // purple
    icon: 'text',
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
    ports: [
      { name: 'Prompt', dataType: 'text', direction: 'input' },
      { name: 'Brand Kit', dataType: 'brandKit', direction: 'output' },
    ],
    defaultData: {
      prompt: '',
      industry: '',
    },
  },
  'output': {
    title: 'Output',
    width: 280,
    height: 300,
    color: '#6366f1', // indigo
    icon: 'output',
    ports: [
      { name: 'Input', dataType: 'any', direction: 'input' },
    ],
    defaultData: {},
  },
}
