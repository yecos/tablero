import { useState, useCallback } from 'react'
import type { NodeEdge, DesignElement } from '@/store/design-store'
import { getDefaultConnectionPoints } from './use-canvas-connections'
import { toast } from 'sonner'

export interface UseCanvas3DParams {
  elements: DesignElement[]
  updateElement: (id: string, updates: Partial<DesignElement>) => void
  addElement: (element: DesignElement) => void
  addEdge: (edge: NodeEdge) => void
  setIsGenerating3D: (generating: boolean) => void
}

export interface UseCanvas3DReturn {
  converting3DId: string | null
  handleConvertTo3D: (elementId: string) => Promise<void>
}

export function useCanvas3D(params: UseCanvas3DParams): UseCanvas3DReturn {
  const {
    elements,
    updateElement,
    addElement,
    addEdge,
    setIsGenerating3D,
  } = params

  const [converting3DId, setConverting3DId] = useState<string | null>(null)

  // Handle "Convert to 3D" action
  const handleConvertTo3D = useCallback(async (elementId: string) => {
    const element = elements.find(e => e.id === elementId)
    if (!element || element.type !== 'image' || !element.src) {
      toast.error('Select an image to convert to 3D')
      return
    }

    // Mark as generating
    updateElement(elementId, { isGenerating3D: true })
    setConverting3DId(elementId)
    setIsGenerating3D(true)
    toast.loading('Generating 3D model... This may take a minute.', { id: 'gen-3d' })

    try {
      const response = await fetch('/api/image-to-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: element.src }),
      })

      if (!response.ok) throw new Error('Failed to generate 3D model')

      const data = await response.json()

      if (data.modelData) {
        // Create a new 3D element next to the original
        const nodeWidth = 280
        const nodeHeight = 320
        const newElement: DesignElement = {
          id: `3d_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          type: '3d',
          x: element.x + element.width + 40,
          y: element.y,
          width: nodeWidth,
          height: nodeHeight,
          rotation: 0,
          content: element.content || '3D Model',
          src: element.src,
          modelData: data.modelData,
          selected: false,
          locked: false,
          visible: true,
          opacity: 1,
          connectionPoints: getDefaultConnectionPoints(nodeWidth, nodeHeight),
          isGenerating3D: false,
        }

        addElement(newElement)

        // Also add connection points to the original image
        updateElement(elementId, {
          connectionPoints: getDefaultConnectionPoints(element.width, element.height),
          isGenerating3D: false,
        })

        // Create an edge between the original and 3D
        const newEdge: NodeEdge = {
          id: `edge_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          sourceId: elementId,
          sourcePointId: 'right',
          targetId: newElement.id,
          targetPointId: 'left',
          color: '#22d3ee',
          label: '3D',
        }
        addEdge(newEdge)

        if (data.fallback) {
          toast.info('Using placeholder 3D model (API unavailable)', { id: 'gen-3d' })
        } else {
          toast.success('3D model generated!', { id: 'gen-3d' })
        }
      } else {
        throw new Error('No model data returned')
      }
    } catch (error) {
      console.error('3D generation failed:', error)
      const message = error instanceof Error ? error.message : 'Error desconocido'
      toast.error(`Error al generar modelo 3D: ${message}`, { id: 'gen-3d' })
      updateElement(elementId, { isGenerating3D: false })
    } finally {
      setConverting3DId(null)
      setIsGenerating3D(false)
    }
  }, [elements, updateElement, addElement, addEdge, setIsGenerating3D])

  return {
    converting3DId,
    handleConvertTo3D,
  }
}
