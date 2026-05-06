'use client'

import React from 'react'
import type { ConnectionPoint } from '@/store/design-store'
import { cn } from '@/lib/utils'

export interface CanvasConnectionPointsProps {
  allConnectionPoints: Array<{
    elementId: string
    point: ConnectionPoint
    absoluteX: number
    absoluteY: number
    isConnected: boolean
  }>
  hoveredPoint: string | null
  connectingFrom: { elementId: string; pointId: string } | null
  onConnectionPointClick: (e: React.MouseEvent, elementId: string, pointId: string) => void
  onHoveredPointChange: (pointKey: string | null) => void
}

export function CanvasConnectionPoints({
  allConnectionPoints,
  hoveredPoint,
  connectingFrom,
  onConnectionPointClick,
  onHoveredPointChange,
}: CanvasConnectionPointsProps) {
  return (
    <>
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
            onMouseDown={(e) => onConnectionPointClick(e, elementId, point.id)}
            onMouseEnter={() => onHoveredPointChange(pointKey)}
            onMouseLeave={() => onHoveredPointChange(null)}
            title={`${point.label || point.id} ${isConnected ? '(connected)' : ''}`}
          />
        )
      })}
    </>
  )
}
