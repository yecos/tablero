'use client'

import { useRef, useCallback, useEffect } from 'react'
import { useDesignStore } from '@/store/design-store'
import { cn } from '@/lib/utils'
import { useCanvasInteraction } from '@/hooks/use-canvas-interaction'
import { useCanvasConnections } from '@/hooks/use-canvas-connections'
import { useCanvas3D } from '@/hooks/use-canvas-3d'
import { useImageUpload } from '@/hooks/use-image-upload'
import { CanvasElement } from './canvas-elements'
import { CanvasEdges } from './canvas-edges'
import { CanvasConnectionPoints } from './canvas-connection-points'

export function CanvasArea() {
  const {
    elements, zoom, panX, panY, setPan, setZoom, selectedElementId, selectElement,
    updateElement, activeTool, addElement, setCenteredPan, edges, addEdge,
    setConnectingFrom, connectingFrom, setIsGenerating3D, removeEdge, setImageSplit
  } = useDesignStore()

  const canvasRef = useRef<HTMLDivElement>(null)
  const hasCentered = useRef(false)

  // Image upload hook
  const {
    fileInputRef,
    fileInput3DRef,
    addImageFileToCanvas,
    handleImageUpload,
    handle3DUpload,
  } = useImageUpload({
    canvasRef,
    activeTool,
    panX,
    panY,
    zoom,
    addElement,
    updateElement,
    setActiveTool: useDesignStore.getState().setActiveTool as (tool: string) => void,
  })

  // 3D conversion hook
  const { converting3DId, handleConvertTo3D } = useCanvas3D({
    elements,
    updateElement,
    addElement,
    addEdge,
    setIsGenerating3D,
  })

  // Connections hook
  const {
    tempEdgeEnd,
    setTempEdgeEnd,
    hoveredPoint,
    setHoveredPoint,
    handleConnectionPointClick,
    allConnectionPoints,
  } = useCanvasConnections({
    elements,
    edges,
    connectingFrom,
    addEdge,
    setConnectingFrom,
  })

  // Canvas interaction hook
  const {
    isDragging,
    isDragOver,
    handleCanvasClick,
    handleElementMouseDown,
    handleMouseDown,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useCanvasInteraction({
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
  })

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

  // Track mouse for temp edge while connecting
  useEffect(() => {
    if (!connectingFrom) return

    const handleMouseMove = (e: MouseEvent) => {
      if (connectingFrom) {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect) {
          const currentPanX = useDesignStore.getState().panX
          const currentPanY = useDesignStore.getState().panY
          const currentZoom = useDesignStore.getState().zoom
          const x = (e.clientX - rect.left - currentPanX) / currentZoom
          const y = (e.clientY - rect.top - currentPanY) / currentZoom
          setTempEdgeEnd({ x, y })
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [connectingFrom, setTempEdgeEnd])

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

  // Handle Edit Elements click
  const handleEditElements = useCallback(() => {
    if (!selectedElementId) return
    const element = elements.find(e => e.id === selectedElementId)
    if (!element || element.type !== 'image' || !element.src) {
      return
    }

    setImageSplit({
      showSplitPanel: true,
      originalImageId: element.id,
      isAnalyzing: false,
      isSplitting: false,
      analysis: null,
      splitLayers: [],
    })
  }, [selectedElementId, elements, setImageSplit])

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
        <CanvasEdges
          edges={edges}
          elements={elements}
          connectingFrom={connectingFrom}
          tempEdgeEnd={tempEdgeEnd}
        />

        {/* Connection points layer */}
        <CanvasConnectionPoints
          allConnectionPoints={allConnectionPoints}
          hoveredPoint={hoveredPoint}
          connectingFrom={connectingFrom}
          onConnectionPointClick={handleConnectionPointClick}
          onHoveredPointChange={setHoveredPoint}
        />

        {/* Render design elements */}
        {elements.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={selectedElementId === element.id}
            isDragging={isDragging}
            converting3DId={converting3DId}
            edges={edges}
            onMouseDown={handleElementMouseDown}
            onEditElements={handleEditElements}
            onConvertTo3D={handleConvertTo3D}
            onRemoveEdge={removeEdge}
          />
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
                width: `${Math.max((el.width / 10000) * 100, 1)}%`,
                height: `${Math.max((el.height / 10000) * 100, 1)}%`,
              }}
            />
          ))}
          {/* Viewport indicator */}
          <div
            className="absolute border border-purple-500/40 bg-purple-500/5 rounded-sm"
            style={{
              left: `${((-panX / zoom) / 10000) * 100}%`,
              top: `${((-panY / zoom) / 10000) * 100}%`,
              width: `${(typeof window !== 'undefined' ? window.innerWidth / zoom : 1000) / 10000 * 100}%`,
              height: `${(typeof window !== 'undefined' ? window.innerHeight / zoom : 600) / 10000 * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 px-2 py-1 rounded-md bg-[#12121a]/90 backdrop-blur-sm border border-white/5 text-[10px] text-slate-500 font-mono">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  )
}
