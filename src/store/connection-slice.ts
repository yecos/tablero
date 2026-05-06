import { StateCreator } from 'zustand'
import type { DesignState } from './design-store'
import type { ConnectionPoint, NodeEdge } from './types'

export interface ConnectionSlice {
  edges: NodeEdge[]
  isGenerating3D: boolean
  connectingFrom: { elementId: string; pointId: string } | null
  addEdge: (edge: NodeEdge) => void
  removeEdge: (id: string) => void
  updateEdge: (id: string, updates: Partial<NodeEdge>) => void
  setConnectingFrom: (from: { elementId: string; pointId: string } | null) => void
  setIsGenerating3D: (generating: boolean) => void
  addConnectionPoint: (elementId: string, point: ConnectionPoint) => void
}

export const createConnectionSlice: StateCreator<DesignState, [], [], ConnectionSlice> = (set, _get) => ({
  edges: [],
  isGenerating3D: false,
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

  addConnectionPoint: (elementId, point) =>
    set((state) => ({
      elements: state.elements.map((e) =>
        e.id === elementId
          ? { ...e, connectionPoints: [...(e.connectionPoints || []), point] }
          : e
      ),
    })),
})
