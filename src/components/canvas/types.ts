export type NodeType =
  | 'image-generator'
  | 'video-generator'
  | 'chat'
  | 'audio-generator'
  | 'upscale'
  | 'image-to-3d'
  | 'brand-kit'
  | 'text'
  | 'upload'
  | 'assistant'

export interface CanvasNode {
  id: string
  type: NodeType
  title: string
  position: { x: number; y: number }
  inputs: NodePort[]
  outputs: NodePort[]
  config: Record<string, any>
  result?: any
  error?: string
  status: 'idle' | 'running' | 'completed' | 'error'
}

export interface NodePort {
  id: string
  name: string
  type: 'image' | 'text' | 'video' | 'audio' | 'any'
}

export interface NodeConnection {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
}

export const NODE_DEFINITIONS: Record<NodeType, {
  title: string
  icon: string
  category: 'basic' | 'content'
  color: string
  inputs: Omit<NodePort, 'id'>[]
  outputs: Omit<NodePort, 'id'>[]
  defaultConfig: Record<string, any>
}> = {
  'image-generator': {
    title: 'Generador de Imágenes',
    icon: '🖼️',
    category: 'basic',
    color: '#a855f7',
    inputs: [{ name: 'Prompt', type: 'text' }],
    outputs: [{ name: 'Imagen', type: 'image' }],
    defaultConfig: { prompt: '', aspect: '1:1', width: 1024, height: 1024 },
  },
  'video-generator': {
    title: 'Generador de Video',
    icon: '🎬',
    category: 'basic',
    color: '#06b6d4',
    inputs: [{ name: 'Prompt', type: 'text' }, { name: 'Imagen', type: 'image' }],
    outputs: [{ name: 'Video', type: 'video' }],
    defaultConfig: { prompt: '', duration: 5 },
  },
  'chat': {
    title: 'Chat IA',
    icon: '💬',
    category: 'basic',
    color: '#22c55e',
    inputs: [{ name: 'Mensaje', type: 'text' }],
    outputs: [{ name: 'Respuesta', type: 'text' }],
    defaultConfig: { prompt: '', messages: [] },
  },
  'audio-generator': {
    title: 'Generador de Audio',
    icon: '🎵',
    category: 'basic',
    color: '#f97316',
    inputs: [{ name: 'Prompt', type: 'text' }],
    outputs: [{ name: 'Audio', type: 'audio' }],
    defaultConfig: { prompt: '' },
  },
  'upscale': {
    title: 'Mejorar Imagen',
    icon: '🔍',
    category: 'basic',
    color: '#8b5cf6',
    inputs: [{ name: 'Imagen', type: 'image' }],
    outputs: [{ name: 'Imagen HD', type: 'image' }],
    defaultConfig: { scale: 2 },
  },
  'image-to-3d': {
    title: 'Convertir a 3D',
    icon: '🧊',
    category: 'basic',
    color: '#3b82f6',
    inputs: [{ name: 'Imagen', type: 'image' }],
    outputs: [{ name: 'Modelo 3D', type: 'any' }],
    defaultConfig: {},
  },
  'brand-kit': {
    title: 'Kit de Marca',
    icon: '🏷️',
    category: 'basic',
    color: '#ec4899',
    inputs: [{ name: 'Prompt', type: 'text' }],
    outputs: [{ name: 'Marca', type: 'any' }],
    defaultConfig: { prompt: '' },
  },
  'text': {
    title: 'Texto',
    icon: '📝',
    category: 'basic',
    color: '#94a3b8',
    inputs: [],
    outputs: [{ name: 'Texto', type: 'text' }],
    defaultConfig: { text: '' },
  },
  'upload': {
    title: 'Subir',
    icon: '📤',
    category: 'content',
    color: '#64748b',
    inputs: [],
    outputs: [{ name: 'Imagen', type: 'image' }],
    defaultConfig: { file: null },
  },
  'assistant': {
    title: 'Asistente',
    icon: '🤖',
    category: 'basic',
    color: '#10b981',
    inputs: [{ name: 'Mensaje', type: 'text' }],
    outputs: [{ name: 'Respuesta', type: 'text' }],
    defaultConfig: { prompt: '' },
  },
}
