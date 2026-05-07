import { StateCreator } from 'zustand'
import type { DesignState } from './design-store'
import type { ImageAnalysis, ImageSplitState, SplitLayer, DesignElement } from './types'
import { MAX_HISTORY } from './history-slice'

export interface ImageSplitSlice {
  imageSplit: ImageSplitState
  setImageSplit: (updates: Partial<ImageSplitState>) => void
  startImageAnalysis: (imageId: string) => void
  completeImageAnalysis: (analysis: ImageAnalysis) => void
  startImageSplit: () => void
  completeImageSplit: (layers: SplitLayer[]) => void
  closeSplitPanel: () => void
  addSplitLayersToCanvas: (layers: SplitLayer[], originalImageId: string, originalX: number, originalY: number, originalWidth: number, originalHeight: number) => void
}

export const createImageSplitSlice: StateCreator<DesignState, [], [], ImageSplitSlice> = (set, get) => ({
  imageSplit: {
    isAnalyzing: false,
    isSplitting: false,
    originalImageId: null,
    analysis: null,
    splitLayers: [],
    showSplitPanel: false,
  },

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
      const snapshot = { elements: newElements.map(e => ({ ...e })), layers: newLayersState.map(l => ({ ...l })) }
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
})
