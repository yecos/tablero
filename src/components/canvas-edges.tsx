'use client'

import React from 'react'
import type { DesignElement, NodeEdge } from '@/store/design-store'
import { getConnectionPointPosition } from '@/hooks/use-canvas-connections'

// Calculate bezier curve path between two points
export function getEdgePath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = Math.abs(x2 - x1)
  const dy = Math.abs(y2 - y1)
  const curvature = Math.min(Math.max(dx, dy) * 0.4, 150)

  // If primarily horizontal
  if (dx > dy) {
    return `M ${x1} ${y1} C ${x1 + curvature} ${y1}, ${x2 - curvature} ${y2}, ${x2} ${y2}`
  }
  // If primarily vertical
  return `M ${x1} ${y1} C ${x1} ${y1 + curvature}, ${x2} ${y2 - curvature}, ${x2} ${y2}`
}

export interface CanvasEdgesProps {
  edges: NodeEdge[]
  elements: DesignElement[]
  connectingFrom: { elementId: string; pointId: string } | null
  tempEdgeEnd: { x: number; y: number } | null
}

export function CanvasEdges({
  edges,
  elements,
  connectingFrom,
  tempEdgeEnd,
}: CanvasEdgesProps) {
  return (
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
  )
}
