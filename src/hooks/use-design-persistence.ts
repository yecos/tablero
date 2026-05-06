'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useDesignStore } from '@/store/design-store'

const AUTO_SAVE_INTERVAL = 30000 // 30 seconds
const STORAGE_KEY = 'tablero_current_design'

/**
 * Hook that provides design persistence functionality:
 * - Auto-saves to localStorage every 30 seconds
 * - Saves to database when explicitly called
 * - Loads the last design on mount
 */
export function useDesignPersistence() {
  const { elements, edges, brandKit, projectName } = useDesignStore()
  const lastSavedRef = useRef<string>('')
  const designIdRef = useRef<string | null>(null)

  // Load design from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.elements && Array.isArray(data.elements)) {
          const store = useDesignStore.getState()
          // Only restore if canvas is empty
          if (store.elements.length === 0) {
            data.elements.forEach((element: unknown) => {
              store.addElement(element as Parameters<typeof store.addElement>[0])
            })
            if (data.edges) {
              data.edges.forEach((edge: unknown) => {
                store.addEdge(edge as Parameters<typeof store.addEdge>[0])
              })
            }
            if (data.brandKit) {
              store.setBrandKit(data.brandKit)
            }
            if (data.projectName) {
              store.setProjectName(data.projectName)
            }
            if (data.designId) {
              designIdRef.current = data.designId
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load design from localStorage:', error)
    }
  }, [])

  // Auto-save to localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const data = {
          elements,
          edges,
          brandKit,
          projectName,
          designId: designIdRef.current,
          savedAt: Date.now(),
        }
        const serialized = JSON.stringify(data)
        if (serialized !== lastSavedRef.current) {
          localStorage.setItem(STORAGE_KEY, serialized)
          lastSavedRef.current = serialized
        }
      } catch (error) {
        console.warn('Failed to auto-save design:', error)
      }
    }, AUTO_SAVE_INTERVAL)

    return () => clearInterval(interval)
  }, [elements, edges, brandKit, projectName])

  // Save to database
  const saveToDatabase = useCallback(async () => {
    try {
      const currentElements = useDesignStore.getState().elements
      const currentEdges = useDesignStore.getState().edges
      const currentBrandKit = useDesignStore.getState().brandKit
      const currentName = useDesignStore.getState().projectName

      // Strip base64 data from elements to reduce payload size
      const slimElements = currentElements.map(el => ({
        ...el,
        src: el.src ? '[saved_separately]' : undefined,
        modelData: el.modelData ? '[saved_separately]' : undefined,
      }))

      const designId = designIdRef.current || `design_${Date.now()}`
      designIdRef.current = designId

      const response = await fetch('/api/designs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: designId,
          name: currentName,
          elements: slimElements,
          edges: currentEdges,
          brandKit: currentBrandKit,
        }),
      })

      if (!response.ok) throw new Error('Save failed')

      // Also save full data to localStorage
      const data = {
        elements: currentElements,
        edges: currentEdges,
        brandKit: currentBrandKit,
        projectName: currentName,
        designId,
        savedAt: Date.now(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      lastSavedRef.current = JSON.stringify(data)

      return { success: true, designId }
    } catch (error) {
      console.error('Failed to save design to database:', error)
      return { success: false, error: 'Failed to save' }
    }
  }, [])

  // Load from database
  const loadFromDatabase = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/designs/${id}`)
      if (!response.ok) throw new Error('Load failed')

      const { design } = await response.json()
      const store = useDesignStore.getState()
      store.clearCanvas()

      design.elements.forEach((element: unknown) => {
        store.addElement(element as Parameters<typeof store.addElement>[0])
      })
      design.edges.forEach((edge: unknown) => {
        store.addEdge(edge as Parameters<typeof store.addEdge>[0])
      })
      if (design.brandKit) {
        store.setBrandKit(design.brandKit)
      }
      if (design.name) {
        store.setProjectName(design.name)
      }
      designIdRef.current = design.id

      // Also save to localStorage
      const data = {
        elements: design.elements,
        edges: design.edges,
        brandKit: design.brandKit,
        projectName: design.name,
        designId: design.id,
        savedAt: Date.now(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

      return { success: true }
    } catch (error) {
      console.error('Failed to load design from database:', error)
      return { success: false, error: 'Failed to load' }
    }
  }, [])

  // List designs from database
  const listDesigns = useCallback(async () => {
    try {
      const response = await fetch('/api/designs')
      if (!response.ok) throw new Error('Failed to list designs')
      const { designs } = await response.json()
      return { success: true, designs }
    } catch (error) {
      console.error('Failed to list designs:', error)
      return { success: false, designs: [], error: 'Failed to list designs' }
    }
  }, [])

  return {
    saveToDatabase,
    loadFromDatabase,
    listDesigns,
    designId: designIdRef.current,
  }
}
