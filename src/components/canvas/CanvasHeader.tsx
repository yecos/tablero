'use client'

import { Share, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CanvasHeaderProps {
  spaceName: string
  spaceId: string
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
}

export function CanvasHeader({ spaceName, spaceId, zoom, onZoomIn, onZoomOut, onZoomReset }: CanvasHeaderProps) {
  return (
    <div className="h-11 bg-[#0e0e16]/95 border-b border-white/5 flex items-center justify-between px-4">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs">
        <a href="/spaces" className="text-white/30 hover:text-white/60 transition-colors">
          Mi espacio personal
        </a>
        <ChevronRight className="w-3 h-3 text-white/15" />
        <span className="text-white/70 font-medium">{spaceName}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-[11px] text-white/40 hover:text-white/70 h-7 px-3 bg-white/5 hover:bg-white/10 border border-white/10"
        >
          <Share className="w-3 h-3 mr-1.5" />
          Compartir
        </Button>

        {/* Zoom controls */}
        <div className="flex items-center gap-0.5 bg-white/5 rounded-lg border border-white/10 px-1 py-0.5">
          <button onClick={onZoomOut} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button onClick={onZoomReset} className="px-2 py-0.5 text-[10px] text-white/50 hover:text-white/70 transition-colors min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </button>
          <button onClick={onZoomIn} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
