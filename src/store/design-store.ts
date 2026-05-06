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
}

export const useDesignStore = create<DesignState>((set) => ({
  elements: [],
  layers: [{ id: 'default', name: 'Layer 1', visible: true, locked: false, elements: [] }],
  selectedElementId: null,
  zoom: 0.8,
  panX: typeof window !== 'undefined' ? -((5000 * 0.8) - window.innerWidth / 2) : -3500,
  panY: typeof window !== 'undefined' ? -((5000 * 0.8) - window.innerHeight / 2) : -2500,
  projectName: 'Untitled Design',
  activeTool: 'select',
  leftPanelTab: 'layers',
  leftPanelOpen: true,
  chatSidebarOpen: true,

  addElement: (element) =>
    set((state) => {
      const newLayers = state.layers.map((layer, i) =>
        i === 0 ? { ...layer, elements: [...layer.elements, element.id] } : layer
      )
      return { elements: [...state.elements, element], layers: newLayers }
    }),

  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((e) => e.id !== id),
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
      layers: state.layers.map((layer) => ({
        ...layer,
        elements: layer.elements.filter((eid) => eid !== id),
      })),
    })),

  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),

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
}))
