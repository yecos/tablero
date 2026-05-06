'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useDesignStore } from '@/store/design-store'
import { cn } from '@/lib/utils'

export function CanvasArea() {
  const { elements, zoom, panX, panY, setPan, setZoom, selectedElementId, selectElement, updateElement, activeTool, addElement } = useDesignStore()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [panStart, setPanStart] = useState({ x: 0, y: 0, panXStart: 0, panYStart: 0 })

  // Handle wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY > 0 ? -0.05 : 0.05
      setZoom(zoom + delta)
    } else {
      setPan(panX - e.deltaX, panY - e.deltaY)
    }
  }, [zoom, panX, panY, setZoom, setPan])

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

  // Handle double click for text tool
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

  return (
    <div
      ref={canvasRef}
      className="flex-1 overflow-hidden relative cursor-crosshair"
      style={{
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
        backgroundColor: '#0a0a0f',
      }}
      onWheel={handleWheel}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleCanvasDoubleClick}
      data-canvas="true"
    >
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
              isDragging && selectedElementId === element.id ? 'cursor-grabbing' : 'cursor-grab'
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

            {/* Selection handles */}
            {selectedElementId === element.id && (
              <>
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white rounded-full border border-purple-500 cursor-nw-resize" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full border border-purple-500 cursor-ne-resize" />
                <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white rounded-full border border-purple-500 cursor-sw-resize" />
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white rounded-full border border-purple-500 cursor-se-resize" />
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
              className="absolute bg-purple-500/30 rounded-sm"
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
    </div>
  )
}
