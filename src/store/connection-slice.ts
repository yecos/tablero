import { StateCreator } from 'zustand'
import type { DesignState } from './design-store'
import type { ConnectionPoint, NodeEdge } from './types'

export interface ConnectionSlice {
  edges: NodeEdge[]
  isGenerating3D: boolean
  generating3DIds: Set<string>
  connectingFrom: { elementId: string; pointId: string } | null
  addEdge: (edge: NodeEdge) => void
  removeEdge: (id: string) => void
  updateEdge: (id: string, updates: Partial<NodeEdge>) => void
  setConnectingFrom: (from: { elementId: string; pointId: string } | null) => void
  setIsGenerating3D: (generating: boolean) => void
  startGenerating3D: (elementId: string) => void
  endGenerating3D: (elementId: string) => void
  is3DGenerating: (elementId?: string) => boolean
  addConnectionPoint: (elementId: string, point: ConnectionPoint) => void
}

export const createConnectionSlice: StateCreator<DesignState, [], [], ConnectionSlice> = (set, get) => ({
  edges: [],
  isGenerating3D: false,
  generating3DIds: new Set<string>(),
  connectingFrom: null,

  addEdge: (edge) =>
    set((state) => ({
      edges: [...state.edges, edge],
    })),

  removeEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
    })),

  updateEdge: (id, updates) =>
    set((state) => ({
      edges: state.edges.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),

  setConnectingFrom: (from) => set({ connectingFrom: from }),

  setIsGenerating3D: (generating) => set({ isGenerating3D: generating }),

  startGenerating3D: (elementId) => {
    const ids = new Set(get().generating3DIds)
    ids.add(elementId)
    set({ generating3DIds: ids, isGenerating3D: true })
  },

  endGenerating3D: (elementId) => {
    const ids = new Set(get().generating3DIds)
    ids.delete(elementId)
    set({ generating3DIds: ids, isGenerating3D: ids.size > 0 })
  },

  is3DGenerating: (elementId) => {
    const ids = get().generating3DIds
    if (elementId) return ids.has(elementId)
    return ids.size > 0
  },

  addConnectionPoint: (elementId, point) =>
    set((state) => ({
      elements: state.elements.map((e) =>
        e.id === elementId
          ? { ...e, connectionPoints: [...(e.connectionPoints || []), point] }
          : e
      ),
    })),
})
