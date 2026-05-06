import { useState, useCallback, useEffect } from 'react'
import type { DesignElement } from '@/store/design-store'

export interface UseCanvasInteractionParams {
  canvasRef: React.RefObject<HTMLDivElement | null>
  elements: DesignElement[]
  selectedElementId: string | null
  activeTool: string
  connectingFrom: { elementId: string; pointId: string } | null
  zoom: number
  panX: number
  panY: number
  selectElement: (id: string | null) => void
  updateElement: (id: string, updates: Partial<DesignElement>) => void
  setPan: (x: number, y: number) => void
  setConnectingFrom: (from: { elementId: string; pointId: string } | null) => void
  addImageFileToCanvas: (file: File, dropX?: number, dropY?: number, as3D?: boolean) => void
}

export interface UseCanvasInteractionReturn {
  isDragging: boolean
  isPanning: boolean
  isDragOver: boolean
  handleCanvasClick: (e: React.MouseEvent) => void
  handleElementMouseDown: (e: React.MouseEvent, elementId: string) => void
  handleMouseDown: (e: React.MouseEvent) => void
  handleDragOver: (e: React.DragEvent) => void
  handleDragLeave: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent) => void
}

export function useCanvasInteraction(params: UseCanvasInteractionParams): UseCanvasInteractionReturn {
  const {
    canvasRef,
    elements,
    selectedElementId,
    activeTool,
    connectingFrom,
    zoom,
    panX,
    panY,
    selectElement,
    updateElement,
    setPan,
    setConnectingFrom,
    addImageFileToCanvas,
  } = params

  const [isDragging, setIsDragging] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [panStart, setPanStart] = useState({ x: 0, y: 0, panXStart: 0, panYStart: 0 })
  const [isDragOver, setIsDragOver] = useState(false)

  // Handle canvas click to deselect
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.canvas === 'true') {
      // If we're in connecting mode, cancel it
      if (connectingFrom) {
        setConnectingFrom(null)
        return
      }
      selectElement(null)
    }
  }, [selectElement, connectingFrom, setConnectingFrom, canvasRef])

  // Handle element drag start
  const handleElementMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation()
    if (activeTool !== 'select' && activeTool !== '3d') return
    if (connectingFrom) return // Don't start dragging while connecting
    selectElement(elementId)
    const element = elements.find(el => el.id === elementId)
    if (!element || element.locked) return
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDragOffset({ x: element.x, y: element.y })
  }, [activeTool, elements, selectElement, connectingFrom])

  // Handle middle mouse / space+click panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY, panXStart: panX, panYStart: panY })
      e.preventDefault()
    }
  }, [panX, panY])

  // Global mouse events for dragging/panning + temp edge tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && selectedElementId) {
        const dx = (e.clientX - dragStart.x) / zoom
        const dy = (e.clientY - dragStart.y) / zoom
        updateElement(selectedElementId, {
          x: dragOffset.x + dx,
          y: dragOffset.y + dy,
        })
      }
      if (isPanning) {
        const dx = e.clientX - panStart.x
        const dy = e.clientY - panStart.y
        setPan(panStart.panXStart + dx, panStart.panYStart + dy)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsPanning(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isPanning, dragStart, dragOffset, panStart, selectedElementId, zoom, updateElement, setPan])

  // Drag and drop support
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      const dropX = rect ? (e.clientX - rect.left - panX) / zoom : undefined
      const dropY = rect ? (e.clientY - rect.top - panY) / zoom : undefined
      addImageFileToCanvas(file, dropX, dropY, activeTool === '3d')
    })
  }, [panX, panY, zoom, addImageFileToCanvas, activeTool, canvasRef])

  return {
    isDragging,
    isPanning,
    isDragOver,
    handleCanvasClick,
    handleElementMouseDown,
    handleMouseDown,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}
