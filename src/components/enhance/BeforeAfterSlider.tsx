'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  className?: string
}

export default function BeforeAfterSlider({ beforeImage, afterImage, className }: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [hoverZoom, setHoverZoom] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  })
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [imagesLoaded, setImagesLoaded] = useState({ before: false, after: false })

  // Track container dimensions via ResizeObserver
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100))
      setSliderPosition(percent)
    },
    []
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      handleMove(e.clientX)
    },
    [handleMove]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX)
      }
      // Magnifying glass zoom - compute position from event
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setHoverZoom({ x, y, visible: true })
      }
    },
    [isDragging, handleMove]
  )

  const handleMouseLeave = useCallback(() => {
    setHoverZoom((prev) => ({ ...prev, visible: false }))
  }, [])

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX)
      }
    }
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove)
      window.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, handleMove])

  // Touch support
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true)
      handleMove(e.touches[0].clientX)
    },
    [handleMove]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isDragging) {
        handleMove(e.touches[0].clientX)
      }
    },
    [isDragging, handleMove]
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleImageLoad = useCallback((type: 'before' | 'after') => {
    setImagesLoaded((prev) => ({ ...prev, [type]: true }))
  }, [])

  // Compute magnifying glass styles from state (not ref)
  const zoomBgWidth = containerSize.width * 2.5
  const zoomBgHeight = containerSize.height * 2.5
  const zoomBgPosX = containerSize.width > 0 ? -(hoverZoom.x * 2.5 - 56) : 0
  const zoomBgPosY = containerSize.height > 0 ? -(hoverZoom.y * 2.5 - 56) : 0

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-hidden rounded-2xl cursor-col-resize select-none',
        'bg-[#12121a]',
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* After image (full, behind) */}
      <div className="absolute inset-0">
        <img
          src={afterImage}
          alt="Después"
          className="w-full h-full object-cover"
          draggable={false}
          onLoad={() => handleImageLoad('after')}
        />
        {/* After label */}
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white/80 text-xs font-medium tracking-wide uppercase">
          Después
        </div>
      </div>

      {/* Before image (clipped) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt="Antes"
          className="w-full h-full object-cover"
          draggable={false}
          onLoad={() => handleImageLoad('before')}
        />
        {/* Before label */}
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white/80 text-xs font-medium tracking-wide uppercase">
          Antes
        </div>
      </div>

      {/* Slider divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.4)] z-10 pointer-events-none"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* Circular handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg shadow-black/40 flex items-center justify-center">
          <div className="flex items-center gap-0.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 3L2 8L5 13" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 3L14 8L11 13" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Magnifying glass on hover */}
      {hoverZoom.visible && !isDragging && containerSize.width > 0 && (
        <div
          className="absolute pointer-events-none z-20 w-28 h-28 rounded-full border-2 border-white/30 overflow-hidden shadow-2xl shadow-black/60"
          style={{
            left: `${hoverZoom.x - 56}px`,
            top: `${hoverZoom.y - 56}px`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${afterImage})`,
              backgroundSize: `${zoomBgWidth}px ${zoomBgHeight}px`,
              backgroundPosition: `${zoomBgPosX}px ${zoomBgPosY}px`,
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
        </div>
      )}

      {/* Loading overlay */}
      {(!imagesLoaded.before || !imagesLoaded.after) && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#12121a]/80 backdrop-blur-sm z-30">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <span className="text-white/50 text-sm">Cargando...</span>
          </div>
        </div>
      )}
    </div>
  )
}
