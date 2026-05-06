'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useDesignStore, type ConnectionPoint, type NodeEdge, type DesignElement } from '@/store/design-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { DynamicModelViewer3D } from './model-viewer-3d-dynamic'

// Utility: Compress an image file to a data URL with max dimensions and JPEG compression
function compressImageFile(file: File, maxDim: number = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (!dataUrl) { reject(new Error('No data URL')); return }

      const img = new Image()
      img.onerror = () => {
        console.warn('Image load failed, using original data URL')
        resolve(dataUrl)
      }
      img.onload = () => {
        try {
          const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1)
          const w = Math.round(img.width * ratio)
          const h = Math.round(img.height * ratio)
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')
          if (!ctx) { resolve(dataUrl); return }
          ctx.drawImage(img, 0, 0, w, h)
          const compressed = canvas.toDataURL('image/jpeg', 0.85)
          resolve(compressed)
        } catch {
          console.warn('Canvas compression failed, using original')
          resolve(dataUrl)
        }
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  })
}

// Default connection points for a node (top, right, bottom, left)
function getDefaultConnectionPoints(w: number, h: number): ConnectionPoint[] {
  return [
    { id: 'top', x: 0, y: -h / 2, label: 'Top' },
    { id: 'right', x: w / 2, y: 0, label: 'Right' },
    { id: 'bottom', x: 0, y: h / 2, label: 'Bottom' },
    { id: 'left', x: -w / 2, y: 0, label: 'Left' },
  ]
}

// Get absolute position of a connection point on the canvas
function getConnectionPointPosition(element: DesignElement, pointId: string): { x: number; y: number } | null {
  const points = element.connectionPoints || getDefaultConnectionPoints(element.width, element.height)
  const point = points.find(p => p.id === pointId)
  if (!point) return null
  return {
    x: element.x + element.width / 2 + point.x,
    y: element.y + element.height / 2 + point.y,
  }
}

// Calculate bezier curve path between two points
function getEdgePath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = Math.abs(x2 - x1)
  const dy = Math.abs(y2 - y1)
  const curvature = Math.min(Math.max(dx, dy) * 0.4, 150)

  // Determine control points based on relative positions
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2

  // If primarily horizontal
  if (dx > dy) {
    return `M ${x1} ${y1} C ${x1 + curvature} ${y1}, ${x2 - curvature} ${y2}, ${x2} ${y2}`
  }
  // If primarily vertical
  return `M ${x1} ${y1} C ${x1} ${y1 + curvature}, ${x2} ${y2 - curvature}, ${x2} ${y2}`
}

export function CanvasArea() {
  const {
    elements, zoom, panX, panY, setPan, setZoom, selectedElementId, selectElement,
    updateElement, activeTool, addElement, setCenteredPan, edges, addEdge,
    setConnectingFrom, connectingFrom, setIsGenerating3D, removeEdge
  } = useDesignStore()
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileInput3DRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [panStart, setPanStart] = useState({ x: 0, y: 0, panXStart: 0, panYStart: 0 })
  const [isDragOver, setIsDragOver] = useState(false)
  const [tempEdgeEnd, setTempEdgeEnd] = useState<{ x: number; y: number } | null>(null)
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null)
  const [converting3DId, setConverting3DId] = useState<string | null>(null)
  const hasCentered = useRef(false)

  // Center canvas on mount based on actual container size
  useEffect(() => {
    if (canvasRef.current && !hasCentered.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      setCenteredPan(rect.width, rect.height)
      hasCentered.current = true
    }
  }, [setCenteredPan])

  // Non-passive wheel event listener for proper preventDefault
  useEffect(() => {
    const container = canvasRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY > 0 ? -0.05 : 0.05
        const currentZoom = useDesignStore.getState().zoom
        setZoom(currentZoom + delta)
      } else {
        const currentPanX = useDesignStore.getState().panX
        const currentPanY = useDesignStore.getState().panY
        setPan(currentPanX - e.deltaX, currentPanY - e.deltaY)
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [setZoom, setPan])

  // Handle canvas click to deselect
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.canvas === 'true') {
      // If we're in connecting mode, cancel it
      if (connectingFrom) {
        setConnectingFrom(null)
        setTempEdgeEnd(null)
        return
      }
      selectElement(null)
    }
  }, [selectElement, connectingFrom, setConnectingFrom])

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

  // Handle double click for text/shape tools
  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'text') {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = (e.clientX - rect.left - panX) / zoom
      const y = (e.clientY - rect.top - panY) / zoom
      addElement({
        id: `text_${Date.now()}`,
        type: 'text',
        x, y,
        width: 200, height: 40, rotation: 0,
        content: 'Double click to edit',
        fontSize: 16, fontFamily: 'Inter', color: '#ffffff',
        selected: false, locked: false, visible: true, opacity: 1,
      })
    } else if (activeTool === 'shape') {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = (e.clientX - rect.left - panX) / zoom
      const y = (e.clientY - rect.top - panY) / zoom
      addElement({
        id: `shape_${Date.now()}`,
        type: 'shape',
        x, y,
        width: 150, height: 150, rotation: 0,
        content: 'rectangle', color: '#8b5cf6',
        selected: false, locked: false, visible: true, opacity: 1,
      })
    }
  }, [activeTool, panX, panY, zoom, addElement])

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
      // Track mouse for temp edge
      if (connectingFrom) {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect) {
          const x = (e.clientX - rect.left - panX) / zoom
          const y = (e.clientY - rect.top - panY) / zoom
          setTempEdgeEnd({ x, y })
        }
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
  }, [isDragging, isPanning, dragStart, dragOffset, panStart, selectedElementId, zoom, updateElement, setPan, connectingFrom, panX, panY])

  // Handle connection point click
  const handleConnectionPointClick = useCallback((e: React.MouseEvent, elementId: string, pointId: string) => {
    e.stopPropagation()
    e.preventDefault()

    if (!connectingFrom) {
      // Start a new connection
      setConnectingFrom({ elementId, pointId })
      setTempEdgeEnd(null)
    } else {
      // Complete the connection
      if (connectingFrom.elementId === elementId) {
        // Can't connect to self
        toast.error('Cannot connect a node to itself')
        setConnectingFrom(null)
        setTempEdgeEnd(null)
        return
      }

      // Check for duplicate edge
      const isDuplicate = edges.some(
        (edge) =>
          (edge.sourceId === connectingFrom.elementId && edge.sourcePointId === connectingFrom.pointId &&
           edge.targetId === elementId && edge.targetPointId === pointId) ||
          (edge.sourceId === elementId && edge.sourcePointId === pointId &&
           edge.targetId === connectingFrom.elementId && edge.targetPointId === connectingFrom.pointId)
      )

      if (isDuplicate) {
        toast.error('Connection already exists')
        setConnectingFrom(null)
        setTempEdgeEnd(null)
        return
      }

      const newEdge: NodeEdge = {
        id: `edge_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        sourceId: connectingFrom.elementId,
        sourcePointId: connectingFrom.pointId,
        targetId: elementId,
        targetPointId: pointId,
        color: '#8b5cf6',
      }

      addEdge(newEdge)
      toast.success('Connection created')
      setConnectingFrom(null)
      setTempEdgeEnd(null)
    }
  }, [connectingFrom, edges, addEdge, setConnectingFrom])

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
      toast.error('Failed to generate 3D model. Try again.', { id: 'gen-3d' })
      updateElement(elementId, { isGenerating3D: false })
    } finally {
      setConverting3DId(null)
      setIsGenerating3D(false)
    }
  }, [elements, updateElement, addElement, addEdge, setIsGenerating3D])

  // Helper: add an image file to the canvas with compression
  const addImageFileToCanvas = useCallback(async (file: File, dropX?: number, dropY?: number, as3D: boolean = false) => {
    if (!file.type.startsWith('image/')) {
      toast.error(`${file.name} is not an image file`)
      return
    }

    try {
      const compressedSrc = await compressImageFile(file, 1024)

      const img = new Image()
      img.onload = () => {
        const maxDim = 500
        const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1)
        const width = img.width * ratio
        const height = img.height * ratio

        const x = dropX !== undefined ? dropX - width / 2 : 5000 - width / 2 + Math.random() * 100 - 50
        const y = dropY !== undefined ? dropY - height / 2 : 5000 - height / 2 + Math.random() * 100 - 50

        if (as3D) {
          // Create as a 3D node directly
          const nodeWidth = 280
          const nodeHeight = 320
          const newElement: DesignElement = {
            id: `3d_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            type: '3d',
            x: dropX !== undefined ? dropX - nodeWidth / 2 : 4900,
            y: dropY !== undefined ? dropY - nodeHeight / 2 : 4900,
            width: nodeWidth,
            height: nodeHeight,
            rotation: 0,
            content: file.name,
            src: compressedSrc,
            selected: false,
            locked: false,
            visible: true,
            opacity: 1,
            isGenerating3D: true,
            connectionPoints: getDefaultConnectionPoints(nodeWidth, nodeHeight),
          }
          addElement(newElement)
          toast.info('Converting image to 3D...', { id: 'gen-3d' })

          // Trigger 3D conversion
          fetch('/api/image-to-3d', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: compressedSrc }),
          })
            .then(res => res.json())
            .then(data => {
              if (data.modelData) {
                updateElement(newElement.id, {
                  modelData: data.modelData,
                  isGenerating3D: false,
                })
                if (data.fallback) {
                  toast.info('Using placeholder 3D model', { id: 'gen-3d' })
                } else {
                  toast.success('3D model generated!', { id: 'gen-3d' })
                }
              }
            })
            .catch(() => {
              updateElement(newElement.id, { isGenerating3D: false })
              toast.error('3D generation failed', { id: 'gen-3d' })
            })
        } else {
          addElement({
            id: `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            type: 'image',
            x, y, width, height, rotation: 0,
            content: file.name,
            src: compressedSrc,
            selected: false, locked: false, visible: true, opacity: 1,
          })
          toast.success(`${file.name} added to canvas`)
        }
      }
      img.onerror = () => {
        addElement({
          id: `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          type: 'image',
          x: dropX !== undefined ? dropX - 200 : 4800,
          y: dropY !== undefined ? dropY - 150 : 4850,
          width: 400, height: 300, rotation: 0,
          content: file.name,
          src: compressedSrc,
          selected: false, locked: false, visible: true, opacity: 1,
        })
        toast.success(`${file.name} added to canvas`)
      }
      img.src = compressedSrc
    } catch (err) {
      console.error('Failed to process image:', err)
      toast.error(`Failed to process ${file.name}`)
    }
  }, [addElement, updateElement])

  // Image upload handler
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    Array.from(files).forEach((file) => {
      addImageFileToCanvas(file)
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [addImageFileToCanvas])

  // 3D upload handler
  const handle3DUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    Array.from(files).forEach((file) => {
      addImageFileToCanvas(file, undefined, undefined, true)
    })
    if (fileInput3DRef.current) {
      fileInput3DRef.current.value = ''
    }
  }, [addImageFileToCanvas])

  // Handle toolbar Image tool click
  useEffect(() => {
    if (activeTool === 'image' && fileInputRef.current) {
      fileInputRef.current.click()
      useDesignStore.getState().setActiveTool('select')
    }
    if (activeTool === '3d' && fileInput3DRef.current) {
      fileInput3DRef.current.click()
      useDesignStore.getState().setActiveTool('select')
    }
  }, [activeTool])

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
  }, [panX, panY, zoom, addImageFileToCanvas, activeTool])

  // Handle Edit Elements click
  const handleEditElements = useCallback(() => {
    if (!selectedElementId) return
    const element = elements.find(e => e.id === selectedElementId)
    if (!element || element.type !== 'image' || !element.src) {
      toast.error('Select an image to edit elements')
      return
    }

    const { setImageSplit } = useDesignStore.getState()
    setImageSplit({
      showSplitPanel: true,
      originalImageId: element.id,
      isAnalyzing: false,
      isSplitting: false,
      analysis: null,
      splitLayers: [],
    })
  }, [selectedElementId, elements])

  // Get selected element for context menu
  const selectedElement = elements.find(e => e.id === selectedElementId)

  // Compute all visible connection points and edges
  const allConnectionPoints = elements
    .filter(e => e.visible && (e.type === '3d' || e.connectionPoints?.length))
    .flatMap(element => {
      const points = element.connectionPoints || getDefaultConnectionPoints(element.width, element.height)
      return points.map(point => ({
        elementId: element.id,
        point,
        absoluteX: element.x + element.width / 2 + point.x,
        absoluteY: element.y + element.height / 2 + point.y,
        isConnected: edges.some(
          edge =>
            (edge.sourceId === element.id && edge.sourcePointId === point.id) ||
            (edge.targetId === element.id && edge.targetPointId === point.id)
        ),
      }))
    })

  return (
    <div
      ref={canvasRef}
      className={cn(
        'flex-1 overflow-hidden relative cursor-crosshair transition-colors',
        isDragOver ? 'bg-purple-500/5' : '',
        connectingFrom ? 'cursor-cell' : ''
      )}
      style={{
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
        backgroundColor: isDragOver ? '#0f0a1a' : '#0a0a0f',
      }}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleCanvasDoubleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-canvas="true"
    >
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageUpload}
      />
      <input
        ref={fileInput3DRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handle3DUpload}
      />

      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="px-8 py-6 rounded-2xl border-2 border-dashed border-purple-500/50 bg-purple-500/10 backdrop-blur-sm">
            <p className="text-sm text-purple-300 font-medium">Drop images here</p>
            <p className="text-xs text-slate-500 mt-1">
              {activeTool === '3d' ? 'Images will be converted to 3D' : 'Images will be added to the canvas'}
            </p>
          </div>
        </div>
      )}

      {/* Connection mode indicator */}
      {connectingFrom && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/90 to-cyan-500/90 backdrop-blur-sm text-white text-xs font-medium shadow-lg">
          Click another connection point to complete the link • Click empty space to cancel
        </div>
      )}

      {/* Canvas content with transform */}
      <div
        className="absolute origin-top-left"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          width: '10000px',
          height: '10000px',
        }}
        data-canvas="true"
      >
        {/* Center reference cross */}
        <div className="absolute" style={{ left: '5000px', top: '5000px' }}>
          <div className="absolute -top-[5000px] left-0 w-px h-[10000px] bg-white/[0.02]" />
          <div className="absolute top-0 -left-[5000px] h-px w-[10000px] bg-white/[0.02]" />
        </div>

        {/* Render edges (SVG layer) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <defs>
            <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="edgeGradient3d" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.9" />
            </linearGradient>
            <filter id="edgeGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Rendered edges */}
          {edges.map((edge) => {
            const sourceElement = elements.find(e => e.id === edge.sourceId)
            const targetElement = elements.find(e => e.id === edge.targetId)
            if (!sourceElement || !targetElement) return null

            const sourcePos = getConnectionPointPosition(sourceElement, edge.sourcePointId)
            const targetPos = getConnectionPointPosition(targetElement, edge.targetPointId)
            if (!sourcePos || !targetPos) return null

            const path = getEdgePath(sourcePos.x, sourcePos.y, targetPos.x, targetPos.y)
            const is3dEdge = edge.label === '3D' || edge.color === '#22d3ee'

            return (
              <g key={edge.id}>
                {/* Glow background */}
                <path
                  d={path}
                  fill="none"
                  stroke={is3dEdge ? 'url(#edgeGradient3d)' : 'url(#edgeGradient)'}
                  strokeWidth={4}
                  strokeLinecap="round"
                  filter="url(#edgeGlow)"
                  opacity={0.4}
                />
                {/* Main line */}
                <path
                  d={path}
                  fill="none"
                  stroke={is3dEdge ? 'url(#edgeGradient3d)' : 'url(#edgeGradient)'}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                {/* Flow dot animation */}
                <circle r="3" fill={is3dEdge ? '#22d3ee' : '#8b5cf6'}>
                  <animateMotion
                    dur="3s"
                    repeatCount="indefinite"
                    path={path}
                  />
                </circle>
                {/* Second flow dot offset */}
                <circle r="2" fill={is3dEdge ? '#8b5cf6' : '#22d3ee'} opacity={0.6}>
                  <animateMotion
                    dur="3s"
                    repeatCount="indefinite"
                    path={path}
                    begin="1.5s"
                  />
                </circle>
                {/* Edge label */}
                {edge.label && (
                  <text
                    x={(sourcePos.x + targetPos.x) / 2}
                    y={(sourcePos.y + targetPos.y) / 2 - 8}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="Inter"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            )
          })}

          {/* Temporary edge while connecting */}
          {connectingFrom && tempEdgeEnd && (() => {
            const sourceElement = elements.find(e => e.id === connectingFrom.elementId)
            if (!sourceElement) return null
            const sourcePos = getConnectionPointPosition(sourceElement, connectingFrom.pointId)
            if (!sourcePos) return null

            const path = getEdgePath(sourcePos.x, sourcePos.y, tempEdgeEnd.x, tempEdgeEnd.y)
            return (
              <path
                d={path}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="8 4"
                opacity={0.6}
              />
            )
          })()}
        </svg>

        {/* Connection points layer */}
        {allConnectionPoints.map(({ elementId, point, absoluteX, absoluteY, isConnected }) => {
          const pointKey = `${elementId}-${point.id}`
          const isHovered = hoveredPoint === pointKey
          const isConnectingSource = connectingFrom?.elementId === elementId && connectingFrom?.pointId === point.id

          return (
            <div
              key={pointKey}
              className={cn(
                'absolute w-2 h-2 rounded-full cursor-pointer transition-all duration-150 z-10',
                'border border-white/20',
                isConnectingSource
                  ? 'bg-cyan-400 scale-150 shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                  : isConnected
                    ? 'bg-purple-500'
                    : 'bg-slate-600 hover:bg-cyan-400',
                isHovered && !isConnectingSource
                  ? 'scale-150 shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                  : ''
              )}
              style={{
                left: absoluteX - 4,
                top: absoluteY - 4,
              }}
              onMouseDown={(e) => handleConnectionPointClick(e, elementId, point.id)}
              onMouseEnter={() => setHoveredPoint(pointKey)}
              onMouseLeave={() => setHoveredPoint(null)}
              title={`${point.label || point.id} ${isConnected ? '(connected)' : ''}`}
            />
          )
        })}

        {/* Render design elements */}
        {elements.map((element) => (
          <div
            key={element.id}
            className={cn(
              'absolute group',
              element.visible ? '' : 'hidden',
              selectedElementId === element.id ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-[#0a0a0f]' : '',
              isDragging && selectedElementId === element.id ? 'cursor-grabbing' : 'cursor-grab',
              element.isEditableLayer ? 'ring-1 ring-cyan-500/20 ring-offset-1 ring-offset-[#0a0a0f]' : ''
            )}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              transform: `rotate(${element.rotation}deg)`,
              opacity: element.opacity,
              zIndex: element.type === '3d' ? 5 : 2,
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element.id)}
          >
            {/* 3D Element */}
            {element.type === '3d' && (
              <div className="w-full h-full rounded-xl border border-white/10 bg-[#12121a]/80 backdrop-blur-sm overflow-hidden flex flex-col shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                {/* 3D Viewer area */}
                <div className="flex-1 relative min-h-0">
                  {element.isGenerating3D ? (
                    <div className="w-full h-full flex items-center justify-center bg-[#1a1a2e]">
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                          <div className="absolute inset-0 w-12 h-12 border-2 border-cyan-400 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                        </div>
                        <span className="text-xs text-slate-400">Generating 3D...</span>
                      </div>
                    </div>
                  ) : element.modelData ? (
                    <DynamicModelViewer3D
                      modelData={element.modelData}
                      modelUrl={element.modelUrl}
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#1a1a2e]">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                          </svg>
                        </div>
                        <span className="text-[10px] text-slate-500">3D Model</span>
                      </div>
                    </div>
                  )}

                  {/* 3D badge */}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-purple-600/80 to-cyan-500/80 backdrop-blur-sm">
                    <span className="text-[8px] text-white font-bold">3D</span>
                  </div>
                </div>

                {/* Label */}
                <div className="px-3 py-2 border-t border-white/5 bg-[#0a0a0f]/50">
                  <p className="text-[10px] text-slate-400 truncate">{element.content}</p>
                </div>
              </div>
            )}

            {/* Image Element */}
            {element.type === 'image' && element.src && (
              <img
                src={element.src}
                alt={element.content}
                className="w-full h-full object-cover rounded-lg"
                draggable={false}
              />
            )}

            {/* Text Element */}
            {element.type === 'text' && (
              <div
                className="w-full h-full flex items-center"
                style={{
                  fontSize: element.fontSize || 16,
                  fontFamily: element.fontFamily || 'Inter',
                  color: element.color || '#ffffff',
                }}
              >
                {element.content}
              </div>
            )}

            {/* Shape Element */}
            {element.type === 'shape' && (
              <div
                className="w-full h-full rounded-lg"
                style={{ backgroundColor: element.color || '#8b5cf6' }}
              />
            )}

            {/* Editable layer badge */}
            {element.isEditableLayer && (
              <div className="absolute -top-2 left-2 px-1.5 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-500/30">
                <span className="text-[8px] text-cyan-300 font-medium">{element.layerName || 'Layer'}</span>
              </div>
            )}

            {/* Selection handles */}
            {selectedElementId === element.id && (
              <>
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white rounded-full border border-purple-500 cursor-nw-resize" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full border border-purple-500 cursor-ne-resize" />
                <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white rounded-full border border-purple-500 cursor-sw-resize" />
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white rounded-full border border-purple-500 cursor-se-resize" />

                {/* Edit Elements button for images */}
                {element.type === 'image' && !element.isEditableLayer && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditElements()
                    }}
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-[10px] font-medium flex items-center gap-1.5 hover:from-purple-500 hover:to-cyan-400 transition-colors shadow-lg whitespace-nowrap"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Edit Elements
                  </button>
                )}

                {/* Convert to 3D button for images */}
                {element.type === 'image' && !element.isEditableLayer && element.src && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleConvertTo3D(element.id)
                    }}
                    disabled={converting3DId === element.id}
                    className="absolute -bottom-8 right-0 px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-500 text-white text-[10px] font-medium flex items-center gap-1.5 hover:from-cyan-500 hover:to-purple-400 transition-colors shadow-lg whitespace-nowrap disabled:opacity-50"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                    {converting3DId === element.id ? 'Converting...' : 'Convert to 3D'}
                  </button>
                )}

                {/* Delete edge button for 3D nodes */}
                {element.type === '3d' && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
                    {/* Show connected edges */}
                    {edges
                      .filter(e => e.sourceId === element.id || e.targetId === element.id)
                      .slice(0, 3)
                      .map(edge => (
                        <button
                          key={edge.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            removeEdge(edge.id)
                            toast.success('Connection removed')
                          }}
                          className="px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-medium hover:bg-red-500/30 transition-colors whitespace-nowrap"
                        >
                          ✕ {edge.label || 'Link'}
                        </button>
                      ))
                    }
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Minimap */}
      <div className="absolute bottom-4 left-4 w-32 h-24 bg-[#12121a]/90 backdrop-blur-sm border border-white/5 rounded-lg overflow-hidden">
        <div className="w-full h-full relative">
          <div className="absolute inset-2 border border-white/10 rounded-sm" />
          {elements.map((el) => (
            <div
              key={el.id}
              className={cn(
                'absolute rounded-sm',
                el.type === '3d'
                  ? 'bg-cyan-500/40'
                  : el.isEditableLayer
                    ? 'bg-cyan-500/30'
                    : 'bg-purple-500/30'
              )}
              style={{
                left: `${(el.x / 10000) * 100}%`,
                top: `${(el.y / 10000) * 100}%`,
                width: `${Math.max(2, (el.width / 10000) * 100)}%`,
                height: `${Math.max(2, (el.height / 10000) * 100)}%`,
              }}
            />
          ))}
          {/* Mini edges on minimap */}
          <svg className="absolute inset-0 w-full h-full">
            {edges.map((edge) => {
              const sourceElement = elements.find(e => e.id === edge.sourceId)
              const targetElement = elements.find(e => e.id === edge.targetId)
              if (!sourceElement || !targetElement) return null
              const sx = ((sourceElement.x + sourceElement.width / 2) / 10000) * 100
              const sy = ((sourceElement.y + sourceElement.height / 2) / 10000) * 100
              const tx = ((targetElement.x + targetElement.width / 2) / 10000) * 100
              const ty = ((targetElement.y + targetElement.height / 2) / 10000) * 100
              return (
                <line
                  key={edge.id}
                  x1={`${sx}%`}
                  y1={`${sy}%`}
                  x2={`${tx}%`}
                  y2={`${ty}%`}
                  stroke={edge.label === '3D' ? '#22d3ee' : '#8b5cf6'}
                  strokeWidth="1"
                  opacity="0.5"
                />
              )
            })}
          </svg>
        </div>
      </div>

      {/* Selected element info */}
      {selectedElement && (
        <div className="absolute bottom-4 left-40 px-3 py-2 rounded-lg bg-[#12121a]/90 backdrop-blur-sm border border-white/5">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              selectedElement.type === '3d'
                ? 'bg-cyan-400'
                : selectedElement.isEditableLayer
                  ? 'bg-cyan-400'
                  : 'bg-purple-400'
            )} />
            <span className="text-[10px] text-slate-400">
              {selectedElement.type === '3d'
                ? `${selectedElement.content} • 3D Model • Drag connection points to link`
                : selectedElement.isEditableLayer
                  ? `${selectedElement.layerName || 'Editable Layer'}`
                  : selectedElement.type === 'image'
                    ? `${selectedElement.content || 'Image'} • Click "Convert to 3D" to generate 3D model`
                    : `${selectedElement.content || selectedElement.type}`
              }
            </span>
          </div>
        </div>
      )}

      {/* Edge count indicator */}
      {edges.length > 0 && (
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-[#12121a]/90 backdrop-blur-sm border border-white/5">
          <span className="text-[10px] text-slate-400">
            {edges.length} connection{edges.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
}
