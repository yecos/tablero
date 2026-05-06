import { create } from 'zustand'

export interface DesignElement {
  id: string
  type: 'image' | 'text' | 'shape'
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
}

export interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  elements: string[]
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

export interface DesignState {
  elements: DesignElement[]
  layers: Layer[]
  selectedElementId: string | null
  zoom: number
  panX: number
  panY: number
  projectName: string
  activeTool: 'select' | 'text' | 'shape' | 'image' | 'draw'
  leftPanelTab: 'layers' | 'assets' | 'templates' | 'brandkit'
  leftPanelOpen: boolean
  chatSidebarOpen: boolean
  brandKit: BrandKitData | null

  // Undo/Redo
  history: DesignElement[][]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean

  addElement: (element: DesignElement) => void
  removeElement: (id: string) => void
  updateElement: (id: string, updates: Partial<DesignElement>) => void
  selectElement: (id: string | null) => void
  setZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  setProjectName: (name: string) => void
  setActiveTool: (tool: DesignState['activeTool']) => void
  setLeftPanelTab: (tab: DesignState['leftPanelTab']) => void
  setLeftPanelOpen: (open: boolean) => void
  setChatSidebarOpen: (open: boolean) => void
  clearCanvas: () => void
  setBrandKit: (kit: BrandKitData) => void
  undo: () => void
  redo: () => void
  pushHistory: () => void
  setCenteredPan: (containerWidth: number, containerHeight: number) => void
}

const MAX_HISTORY = 50

export const useDesignStore = create<DesignState>((set, get) => ({
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
  history: [[]],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,

  pushHistory: () => {
    const { elements, history, historyIndex } = get()
    const snapshot = elements.map(e => ({ ...e }))
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(snapshot)
    if (newHistory.length > MAX_HISTORY) newHistory.shift()
    const newIndex = newHistory.length - 1
    set({
      history: newHistory,
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: false,
    })
  },

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    const restoredElements = history[newIndex].map(e => ({ ...e }))
    set({
      elements: restoredElements,
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: newIndex < history.length - 1,
      selectedElementId: null,
      layers: [{ id: 'default', name: 'Layer 1', visible: true, locked: false, elements: restoredElements.map(e => e.id) }],
    })
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    const restoredElements = history[newIndex].map(e => ({ ...e }))
    set({
      elements: restoredElements,
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: newIndex < history.length - 1,
      selectedElementId: null,
      layers: [{ id: 'default', name: 'Layer 1', visible: true, locked: false, elements: restoredElements.map(e => e.id) }],
    })
  },

  setCenteredPan: (containerWidth: number, containerHeight: number) => {
    const { zoom } = get()
    const panX = -(5000 * zoom) + containerWidth / 2
    const panY = -(5000 * zoom) + containerHeight / 2
    set({ panX, panY })
  },

  addElement: (element) =>
    set((state) => {
      const newLayers = state.layers.map((layer, i) =>
        i === 0 ? { ...layer, elements: [...layer.elements, element.id] } : layer
      )
      const newElements = [...state.elements, element]
      // Push to history
      const snapshot = newElements.map(e => ({ ...e }))
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
      const snapshot = newElements.map(e => ({ ...e }))
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
        const snapshot = newElements.map(e => ({ ...e }))
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
}))
