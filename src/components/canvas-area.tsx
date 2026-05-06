'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useDesignStore } from '@/store/design-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Utility: Resize a base64 image to fit within maxDim
async function resizeBase64Image(dataUrl: string, maxDim: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1)
      const w = Math.round(img.width * ratio)
      const h = Math.round(img.height * ratio)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('No canvas context')); return }
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = dataUrl
  })
}

export function CanvasArea() {
  const { elements, zoom, panX, panY, setPan, setZoom, selectedElementId, selectElement, updateElement, activeTool, addElement, setCenteredPan } = useDesignStore()
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [panStart, setPanStart] = useState({ x: 0, y: 0, panXStart: 0, panYStart: 0 })
  const [isDragOver, setIsDragOver] = useState(false)
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
      selectElement(null)
    }
  }, [selectElement])

  // Handle element drag start
  const handleElementMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation()
    if (activeTool !== 'select') return
    selectElement(elementId)
    const element = elements.find(el => el.id === elementId)
    if (!element || element.locked) return
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDragOffset({ x: element.x, y: element.y })
  }, [activeTool, elements, selectElement])

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
        x,
        y,
        width: 200,
        height: 40,
        rotation: 0,
        content: 'Double click to edit',
        fontSize: 16,
        fontFamily: 'Inter',
        color: '#ffffff',
        selected: false,
        locked: false,
        visible: true,
        opacity: 1,
      })
    } else if (activeTool === 'shape') {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = (e.clientX - rect.left - panX) / zoom
      const y = (e.clientY - rect.top - panY) / zoom
      addElement({
        id: `shape_${Date.now()}`,
        type: 'shape',
        x,
        y,
        width: 150,
        height: 150,
        rotation: 0,
        content: 'rectangle',
        color: '#8b5cf6',
        selected: false,
        locked: false,
        visible: true,
        opacity: 1,
      })
    }
  }, [activeTool, panX, panY, zoom, addElement])

  // Global mouse events for dragging/panning
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

    if (isDragging || isPanning) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isPanning, dragStart, dragOffset, panStart, selectedElementId, zoom, updateElement, setPan])

  // Image upload handler
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const src = event.target?.result as string
        if (!src) return

        // Create a temporary image to get dimensions
        const img = new Image()
        img.onload = () => {
          const maxDim = 500
          const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1)
          const width = img.width * ratio
          const height = img.height * ratio

          addElement({
            id: `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            type: 'image',
            x: 5000 - width / 2 + Math.random() * 100 - 50,
            y: 5000 - height / 2 + Math.random() * 100 - 50,
            width,
            height,
            rotation: 0,
            content: file.name,
            src,
            selected: false,
            locked: false,
            visible: true,
            opacity: 1,
          })
          toast.success(`${file.name} added to canvas`)
        }
        img.src = src
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [addElement])

  // Handle toolbar Image tool click
  useEffect(() => {
    if (activeTool === 'image' && fileInputRef.current) {
      fileInputRef.current.click()
      // Reset to select tool after opening file dialog
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
      if (!file.type.startsWith('image/')) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const src = event.target?.result as string
        if (!src) return

        const img = new Image()
        img.onload = () => {
          const maxDim = 500
          const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1)
          const width = img.width * ratio
          const height = img.height * ratio

          // Calculate position from drop coordinates
          const rect = canvasRef.current?.getBoundingClientRect()
          const x = rect ? (e.clientX - rect.left - panX) / zoom - width / 2 : 5000 - width / 2
          const y = rect ? (e.clientY - rect.top - panY) / zoom - height / 2 : 5000 - height / 2

          addElement({
            id: `drop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            type: 'image',
            x,
            y,
            width,
            height,
            rotation: 0,
            content: file.name,
            src,
            selected: false,
            locked: false,
            visible: true,
            opacity: 1,
          })
          toast.success(`${file.name} added to canvas`)
        }
        img.src = src
      }
      reader.readAsDataURL(file)
    })
  }, [panX, panY, zoom, addElement])

  // Handle Edit Elements click - just opens the panel, analysis triggered by panel
  const handleEditElements = useCallback(() => {
    if (!selectedElementId) return
    const element = elements.find(e => e.id === selectedElementId)
    if (!element || element.type !== 'image' || !element.src) {
      toast.error('Select an image to edit elements')
      return
    }

    // Just open the split panel - the panel will handle the analysis
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

  return (
    <div
      ref={canvasRef}
      className={cn(
        'flex-1 overflow-hidden relative cursor-crosshair transition-colors',
        isDragOver ? 'bg-purple-500/5' : ''
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
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="px-8 py-6 rounded-2xl border-2 border-dashed border-purple-500/50 bg-purple-500/10 backdrop-blur-sm">
            <p className="text-sm text-purple-300 font-medium">Drop images here</p>
            <p className="text-xs text-slate-500 mt-1">Images will be added to the canvas</p>
          </div>
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
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element.id)}
          >
            {element.type === 'image' && element.src && (
              <img
                src={element.src}
                alt={element.content}
                className="w-full h-full object-cover rounded-lg"
                draggable={false}
              />
            )}
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
                el.isEditableLayer ? 'bg-cyan-500/30' : 'bg-purple-500/30'
              )}
              style={{
                left: `${(el.x / 10000) * 100}%`,
                top: `${(el.y / 10000) * 100}%`,
                width: `${Math.max(2, (el.width / 10000) * 100)}%`,
                height: `${Math.max(2, (el.height / 10000) * 100)}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Selected element info */}
      {selectedElement && selectedElement.type === 'image' && (
        <div className="absolute bottom-4 left-40 px-3 py-2 rounded-lg bg-[#12121a]/90 backdrop-blur-sm border border-white/5">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              selectedElement.isEditableLayer ? 'bg-cyan-400' : 'bg-purple-400'
            )} />
            <span className="text-[10px] text-slate-400">
              {selectedElement.isEditableLayer
                ? `${selectedElement.layerName || 'Editable Layer'}`
                : `${selectedElement.content || 'Image'} - Click "Edit Elements" to decompose`
              }
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
