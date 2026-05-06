import { create } from 'zustand'
import { StateCreator } from 'zustand'
import { createCanvasSlice, CanvasSlice } from './canvas-slice'
import { createHistorySlice, HistorySlice } from './history-slice'
import { createImageSplitSlice, ImageSplitSlice } from './image-split-slice'
import { createConnectionSlice, ConnectionSlice } from './connection-slice'
// Re-export types from types.ts
export * from './types'

export type DesignState = CanvasSlice & HistorySlice & ImageSplitSlice & ConnectionSlice

export const useDesignStore = create<DesignState>()((...a) => ({
  ...createCanvasSlice(...a),
  ...createHistorySlice(...a),
  ...createImageSplitSlice(...a),
  ...createConnectionSlice(...a),
}))
