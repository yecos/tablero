import { StateCreator } from 'zustand'
import type { DesignState } from './design-store'
import type { DesignElement, Layer, BrandKitData } from './types'
import { MAX_HISTORY } from './history-slice'

export interface CanvasSlice {
  // state
  elements: DesignElement[]
  layers: Layer[]
  selectedElementId: string | null
  zoom: number
  panX: number
  panY: number
  projectName: string
  activeTool: 'select' | 'text' | 'shape' | 'image' | 'draw' | '3d'
  leftPanelTab: 'layers' | 'assets' | 'templates' | 'brandkit'
  leftPanelOpen: boolean
  chatSidebarOpen: boolean
  brandKit: BrandKitData | null
  // actions
  addElement: (element: DesignElement) => void
  removeElement: (id: string) => void
  updateElement: (id: string, updates: Partial<DesignElement>) => void
  selectElement: (id: string | null) => void
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  setProjectName: (name: string) => void
  setActiveTool: (tool: CanvasSlice['activeTool']) => void
  setLeftPanelTab: (tab: CanvasSlice['leftPanelTab']) => void
  setLeftPanelOpen: (open: boolean) => void
  setChatSidebarOpen: (open: boolean) => void
  clearCanvas: () => void
  setBrandKit: (kit: BrandKitData) => void
  setCenteredPan: (containerWidth: number, containerHeight: number) => void
}

export const createCanvasSlice: StateCreator<DesignState, [], [], CanvasSlice> = (set, get) => ({
  elements: [],
  layers: [{ id: 'default', name: 'Layer 1', visible: true, locked: false, elements: [] }],
  selectedElementId: null,
  zoom: 0.8,
  panX: 0,
  panY: 0,
  projectName: 'Untitled Design',
  activeTool: 'select',
  leftPanelTab: 'layers',
  leftPanelOpen: true,
  chatSidebarOpen: true,
  brandKit: null,

  addElement: (element) =>
    set((state) => {
      const newLayers = state.layers.map((layer, i) =>
        i === 0 ? { ...layer, elements: [...layer.elements, element.id] } : layer
      )
      const newElements = [...state.elements, element]
      // Push to history
      const snapshot = { elements: newElements.map(e => ({ ...e })), layers: state.layers.map(l => ({ ...l })) }
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(snapshot)
      if (newHistory.length > MAX_HISTORY) newHistory.shift()
      const newIndex = newHistory.length - 1
      return {
        elements: newElements,
        layers: newLayers,
        history: newHistory,
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: false,
      }
    }),

  removeElement: (id) =>
    set((state) => {
      const newElements = state.elements.filter((e) => e.id !== id)
      const snapshot = { elements: newElements.map(e => ({ ...e })), layers: state.layers.map(l => ({ ...l })) }
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(snapshot)
      if (newHistory.length > MAX_HISTORY) newHistory.shift()
      const newIndex = newHistory.length - 1
      return {
        elements: newElements,
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
        layers: state.layers.map((layer) => ({
          ...layer,
          elements: layer.elements.filter((eid) => eid !== id),
        })),
        history: newHistory,
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: false,
      }
    }),

  updateElement: (id, updates) =>
    set((state) => {
      const newElements = state.elements.map((e) => (e.id === id ? { ...e, ...updates } : e))
      // Push to history for significant updates (not selection changes)
      const isSignificant = Object.keys(updates).some(k => k !== 'selected')
      if (isSignificant) {
        const snapshot = { elements: newElements.map(e => ({ ...e })), layers: state.layers.map(l => ({ ...l })) }
        const newHistory = state.history.slice(0, state.historyIndex + 1)
        newHistory.push(snapshot)
        if (newHistory.length > MAX_HISTORY) newHistory.shift()
        const newIndex = newHistory.length - 1
        return {
          elements: newElements,
          history: newHistory,
          historyIndex: newIndex,
          canUndo: newIndex > 0,
          canRedo: false,
        }
      }
      return { elements: newElements }
    }),

  selectElement: (id) => set({ selectedElementId: id }),

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  setPan: (x, y) => set({ panX: x, panY: y }),
  setProjectName: (name) => set({ projectName: name }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setLeftPanelTab: (tab) => set({ leftPanelTab: tab }),
  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),
  setChatSidebarOpen: (open) => set({ chatSidebarOpen: open }),
  clearCanvas: () =>
    set({
      elements: [],
      layers: [{ id: 'default', name: 'Layer 1', visible: true, locked: false, elements: [] }],
      selectedElementId: null,
    }),
  setBrandKit: (kit) => set({ brandKit: kit }),

  setCenteredPan: (containerWidth: number, containerHeight: number) => {
    const { zoom } = get()
    const panX = -(5000 * zoom) + containerWidth / 2
    const panY = -(5000 * zoom) + containerHeight / 2
    set({ panX, panY })
  },
})
