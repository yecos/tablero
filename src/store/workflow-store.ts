import { create } from 'zustand'
import {
  type WorkflowNode,
  type WorkflowConnection,
  type WorkflowNodeType,
  type WorkflowNodeStatus,
  type PortDataValue,
  NODE_DEFAULTS,
} from './workflow-types'

const MAX_WORKFLOW_HISTORY = 30

export interface WorkflowState {
  // Workflow state
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  selectedNodeId: string | null
  isExecuting: boolean
  executingNodeId: string | null

  // History
  history: { nodes: WorkflowNode[]; connections: WorkflowConnection[] }[]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean

  // Connection creation
  connectingFrom: { nodeId: string; portId: string; direction: 'input' | 'output' } | null

  // Canvas
  zoom: number
  panX: number
  panY: number

  // Actions
  addNode: (type: WorkflowNodeType, x: number, y: number) => string
  removeNode: (id: string) => void
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void
  updateNodeData: (id: string, data: Record<string, unknown>) => void
  setNodeOutput: (id: string, portId: string, value: PortDataValue) => void
  setNodeStatus: (id: string, status: WorkflowNodeStatus, errorMessage?: string) => void
  selectNode: (id: string | null) => void

  addConnection: (connection: WorkflowConnection) => void
  removeConnection: (id: string) => void
  setConnectingFrom: (from: { nodeId: string; portId: string; direction: 'input' | 'output' } | null) => void

  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  setCenteredPan: (containerWidth: number, containerHeight: number) => void

  clearWorkflow: () => void

  // Execution
  setIsExecuting: (executing: boolean) => void
  setExecutingNodeId: (id: string | null) => void

  // History
  undo: () => void
  redo: () => void
  pushHistory: () => void
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function createNode(type: WorkflowNodeType, x: number, y: number): WorkflowNode {
  const defaults = NODE_DEFAULTS[type]
  const ports = defaults.ports.map((p, i) => ({
    ...p,
    id: `${p.direction}_${i}_${p.dataType}`,
  }))

  return {
    id: generateId(type),
    type,
    x,
    y,
    width: defaults.width,
    height: defaults.height,
    title: defaults.title,
    status: 'idle',
    ports,
    data: { ...defaults.defaultData },
    outputs: {},
  }
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  connections: [],
  selectedNodeId: null,
  isExecuting: false,
  executingNodeId: null,

  history: [{ nodes: [], connections: [] }],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,

  connectingFrom: null,

  zoom: 0.9,
  panX: 0,
  panY: 0,

  addNode: (type, x, y) => {
    const node = createNode(type, x, y)
    set((state) => {
      const newNodes = [...state.nodes, node]
      const snapshot = { nodes: newNodes.map(n => ({ ...n })), connections: [...state.connections] }
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(snapshot)
      if (newHistory.length > MAX_WORKFLOW_HISTORY) newHistory.shift()
      const newIndex = newHistory.length - 1
      return {
        nodes: newNodes,
        selectedNodeId: node.id,
        history: newHistory,
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: false,
      }
    })
    return node.id
  },

  removeNode: (id) => {
    set((state) => {
      const newNodes = state.nodes.filter(n => n.id !== id)
      const newConnections = state.connections.filter(
        c => c.sourceNodeId !== id && c.targetNodeId !== id
      )
      const snapshot = { nodes: newNodes.map(n => ({ ...n })), connections: newConnections.map(c => ({ ...c })) }
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(snapshot)
      if (newHistory.length > MAX_WORKFLOW_HISTORY) newHistory.shift()
      const newIndex = newHistory.length - 1
      return {
        nodes: newNodes,
        connections: newConnections,
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
        history: newHistory,
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: false,
      }
    })
  },

  updateNode: (id, updates) => {
    set((state) => ({
      nodes: state.nodes.map(n => n.id === id ? { ...n, ...updates } : n),
    }))
  },

  updateNodeData: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map(n =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    }))
  },

  setNodeOutput: (id, portId, value) => {
    set((state) => ({
      nodes: state.nodes.map(n =>
        n.id === id ? { ...n, outputs: { ...n.outputs, [portId]: value } } : n
      ),
    }))
  },

  setNodeStatus: (id, status, errorMessage) => {
    set((state) => ({
      nodes: state.nodes.map(n =>
        n.id === id ? { ...n, status, errorMessage } : n
      ),
    }))
  },

  selectNode: (id) => set({ selectedNodeId: id }),

  addConnection: (connection) => {
    // Check for duplicate
    const state = get()
    const isDuplicate = state.connections.some(
      c =>
        c.sourceNodeId === connection.sourceNodeId &&
        c.sourcePortId === connection.sourcePortId &&
        c.targetNodeId === connection.targetNodeId &&
        c.targetPortId === connection.targetPortId
    )
    if (isDuplicate) return

    // Remove existing connections to the same input port (one input can only have one source)
    const filteredConnections = state.connections.filter(
      c => !(c.targetNodeId === connection.targetNodeId && c.targetPortId === connection.targetPortId)
    )

    const newConnections = [...filteredConnections, connection]
    const snapshot = { nodes: state.nodes.map(n => ({ ...n })), connections: newConnections.map(c => ({ ...c })) }
    const newHistory = state.history.slice(0, state.historyIndex + 1)
    newHistory.push(snapshot)
    if (newHistory.length > MAX_WORKFLOW_HISTORY) newHistory.shift()
    const newIndex = newHistory.length - 1

    set({
      connections: newConnections,
      history: newHistory,
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: false,
    })
  },

  removeConnection: (id) => {
    set((state) => {
      const newConnections = state.connections.filter(c => c.id !== id)
      const snapshot = { nodes: state.nodes.map(n => ({ ...n })), connections: newConnections.map(c => ({ ...c })) }
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(snapshot)
      if (newHistory.length > MAX_WORKFLOW_HISTORY) newHistory.shift()
      const newIndex = newHistory.length - 1
      return {
        connections: newConnections,
        history: newHistory,
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: false,
      }
    })
  },

  setConnectingFrom: (from) => set({ connectingFrom: from }),

  setZoom: (zoom) => set({ zoom: Math.max(0.15, Math.min(3, zoom)) }),
  setPan: (x, y) => set({ panX: x, panY: y }),

  setCenteredPan: (containerWidth, containerHeight) => {
    const { zoom } = get()
    const centerX = 5000
    const centerY = 5000
    const panX = -(centerX * zoom) + containerWidth / 2
    const panY = -(centerY * zoom) + containerHeight / 2
    set({ panX, panY })
  },

  clearWorkflow: () => {
    set((state) => {
      const snapshot = { nodes: [], connections: [] }
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(snapshot)
      if (newHistory.length > MAX_WORKFLOW_HISTORY) newHistory.shift()
      const newIndex = newHistory.length - 1
      return {
        nodes: [],
        connections: [],
        selectedNodeId: null,
        connectingFrom: null,
        history: newHistory,
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: false,
      }
    })
  },

  setIsExecuting: (executing) => set({ isExecuting: executing }),
  setExecutingNodeId: (id) => set({ executingNodeId: id }),

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    const restored = history[newIndex]
    set({
      nodes: restored.nodes.map(n => ({ ...n })),
      connections: restored.connections.map(c => ({ ...c })),
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: newIndex < history.length - 1,
      selectedNodeId: null,
    })
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    const restored = history[newIndex]
    set({
      nodes: restored.nodes.map(n => ({ ...n })),
      connections: restored.connections.map(c => ({ ...c })),
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: newIndex < history.length - 1,
      selectedNodeId: null,
    })
  },

  pushHistory: () => {
    const { nodes, connections, history, historyIndex } = get()
    const snapshot = { nodes: nodes.map(n => ({ ...n })), connections: connections.map(c => ({ ...c })) }
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(snapshot)
    if (newHistory.length > MAX_WORKFLOW_HISTORY) newHistory.shift()
    const newIndex = newHistory.length - 1
    set({
      history: newHistory,
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: false,
    })
  },
}))
