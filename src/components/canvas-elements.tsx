'use client'

import React from 'react'
import type { DesignElement, NodeEdge } from '@/store/design-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { DynamicModelViewer3D } from './model-viewer-3d-dynamic'

export interface CanvasElementProps {
  element: DesignElement
  isSelected: boolean
  isDragging: boolean
  converting3DId: string | null
  edges: NodeEdge[]
  onMouseDown: (e: React.MouseEvent, elementId: string) => void
  onEditElements: () => void
  onConvertTo3D: (elementId: string) => void
  onRemoveEdge: (edgeId: string) => void
}

export function CanvasElement({
  element,
  isSelected,
  isDragging,
  converting3DId,
  edges,
  onMouseDown,
  onEditElements,
  onConvertTo3D,
  onRemoveEdge,
}: CanvasElementProps) {
  return (
    <div
      className={cn(
        'absolute group',
        element.visible ? '' : 'hidden',
        isSelected ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-[#0a0a0f]' : '',
        isDragging && isSelected ? 'cursor-grabbing' : 'cursor-grab',
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
      onMouseDown={(e) => onMouseDown(e, element.id)}
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
      {isSelected && (
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
                onEditElements()
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
                onConvertTo3D(element.id)
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
                      onRemoveEdge(edge.id)
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
  )
}
