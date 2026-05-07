import { StateCreator } from 'zustand'
import type { DesignState } from './design-store'
import type { DesignElement } from './types'

export const MAX_HISTORY = 50

export interface HistorySlice {
  history: { elements: DesignElement[]; layers: { id: string; name: string; visible: boolean; locked: boolean; elements: string[] }[] }[]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean
  pushHistory: () => void
  undo: () => void
  redo: () => void
}

export const createHistorySlice: StateCreator<DesignState, [], [], HistorySlice> = (set, get) => ({
  history: [{ elements: [], layers: [{ id: 'default', name: 'Layer 1', visible: true, locked: false, elements: [] }] }],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,

  pushHistory: () => {
    const { elements, layers, history, historyIndex } = get()
    const snapshot = { 
      elements: elements.map(e => ({ ...e })),
      layers: layers.map(l => ({ ...l }))
    }
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
    const restored = history[newIndex]
    set({
      elements: restored.elements.map(e => ({ ...e })),
      layers: restored.layers.map(l => ({ ...l })),
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: newIndex < history.length - 1,
      selectedElementId: null,
    })
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    const restored = history[newIndex]
    set({
      elements: restored.elements.map(e => ({ ...e })),
      layers: restored.layers.map(l => ({ ...l })),
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: newIndex < history.length - 1,
      selectedElementId: null,
    })
  },
})
