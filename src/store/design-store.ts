import { create } from 'zustand'

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

export interface DesignState {
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

  // Undo/Redo
  history: DesignElement[][]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean

  // Image Split State
  imageSplit: ImageSplitState

  // Node Edges / Connections
  edges: NodeEdge[]
  isGenerating3D: boolean

  // Connection creation state
  connectingFrom: { elementId: string; pointId: string } | null

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
  // Image Split actions
  setImageSplit: (updates: Partial<ImageSplitState>) => void
  startImageAnalysis: (imageId: string) => void
  completeImageAnalysis: (analysis: ImageAnalysis) => void
  startImageSplit: () => void
  completeImageSplit: (layers: SplitLayer[]) => void
  closeSplitPanel: () => void
  addSplitLayersToCanvas: (layers: SplitLayer[], originalImageId: string, originalX: number, originalY: number, originalWidth: number, originalHeight: number) => void
  // Edge / Connection actions
  addEdge: (edge: NodeEdge) => void
  removeEdge: (id: string) => void
  updateEdge: (id: string, updates: Partial<NodeEdge>) => void
  setConnectingFrom: (from: { elementId: string; pointId: string } | null) => void
  setIsGenerating3D: (generating: boolean) => void
  addConnectionPoint: (elementId: string, point: ConnectionPoint) => void
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

  // Image Split initial state
  imageSplit: {
    isAnalyzing: false,
    isSplitting: false,
    originalImageId: null,
    analysis: null,
    splitLayers: [],
    showSplitPanel: false,
  },

  // 3D / Edge state
  edges: [],
  isGenerating3D: false,
  connectingFrom: null,

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

  // Image Split actions
  setImageSplit: (updates) =>
    set((state) => ({
      imageSplit: { ...state.imageSplit, ...updates }
    })),

  startImageAnalysis: (imageId) =>
    set((state) => ({
      imageSplit: {
        ...state.imageSplit,
        isAnalyzing: true,
        originalImageId: imageId,
        showSplitPanel: true,
        analysis: null,
        splitLayers: [],
      }
    })),

  completeImageAnalysis: (analysis) =>
    set((state) => ({
      imageSplit: {
        ...state.imageSplit,
        isAnalyzing: false,
        analysis,
      }
    })),

  startImageSplit: () =>
    set((state) => ({
      imageSplit: {
        ...state.imageSplit,
        isSplitting: true,
      }
    })),

  completeImageSplit: (layers) =>
    set((state) => ({
      imageSplit: {
        ...state.imageSplit,
        isSplitting: false,
        splitLayers: layers,
      }
    })),

  closeSplitPanel: () =>
    set((state) => ({
      imageSplit: {
        ...state.imageSplit,
        showSplitPanel: false,
        isAnalyzing: false,
        isSplitting: false,
      }
    })),

  addSplitLayersToCanvas: (layers, originalImageId, originalX, originalY, originalWidth, originalHeight) =>
    set((state) => {
      const newElements = [...state.elements]
      const newLayersState = [...state.layers]

      // Place each split layer as an editable element on the canvas
      // Position them side by side to the right of the original image
      layers.forEach((layer, index) => {
        if (!layer.imageUrl && !layer.base64) return

        const imgSrc = layer.base64 ? `data:image/png;base64,${layer.base64}` : layer.imageUrl

        const elementId = `split_${layer.id}_${Date.now()}_${index}`
        const offsetX = originalX + originalWidth + 40 // Place to the right of original
        const offsetY = originalY + index * (originalHeight / layers.length)

        newElements.push({
          id: elementId,
          type: 'image',
          x: offsetX,
          y: offsetY,
          width: originalWidth,
          height: originalHeight / layers.length,
          rotation: 0,
          content: layer.name,
          src: imgSrc || undefined,
          selected: false,
          locked: false,
          visible: true,
          opacity: 1,
          isEditableLayer: true,
          parentImageId: originalImageId,
          layerType: layer.type as DesignElement['layerType'],
          layerName: layer.name,
        })

        // Add to layers
        newLayersState.push({
          id: elementId,
          name: `${layer.name} (${layer.type})`,
          visible: true,
          locked: false,
          elements: [elementId],
        })
      })

      // Push to history
      const snapshot = newElements.map(e => ({ ...e }))
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(snapshot)
      if (newHistory.length > MAX_HISTORY) newHistory.shift()
      const newIndex = newHistory.length - 1

      return {
        elements: newElements,
        layers: newLayersState,
        history: newHistory,
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: false,
        imageSplit: {
          ...state.imageSplit,
          showSplitPanel: false,
          isAnalyzing: false,
          isSplitting: false,
        }
      }
    }),

  // Edge / Connection actions
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
}))
