'use client'

import React, { useMemo } from 'react'
import type {
  WorkflowNode,
  WorkflowConnection,
  PortDataType,
} from '@/store/workflow-types'

// ---------------------------------------------------------------------------
// Port position helper
// ---------------------------------------------------------------------------
const HEADER_HEIGHT = 36
const PORT_ROW_HEIGHT = 28
const PORT_SPACING = 28

export function getPortPosition(
  node: WorkflowNode,
  portId: string
): { x: number; y: number } {
  const port = node.ports.find((p) => p.id === portId)
  if (!port) return { x: node.x, y: node.y }

  // Separate input / output ports to count index within each side
  const inputPorts = node.ports.filter((p) => p.direction === 'input')
  const outputPorts = node.ports.filter((p) => p.direction === 'output')

  if (port.direction === 'input') {
    const idx = inputPorts.indexOf(port)
    return {
      x: node.x,
      y: node.y + HEADER_HEIGHT + 12 + idx * PORT_SPACING,
    }
  } else {
    const idx = outputPorts.indexOf(port)
    return {
      x: node.x + node.width,
      y: node.y + HEADER_HEIGHT + 12 + idx * PORT_SPACING,
    }
  }
}

// ---------------------------------------------------------------------------
// Bezier path
// ---------------------------------------------------------------------------
function getBezierPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): string {
  const dx = Math.abs(x2 - x1)
  const curvature = Math.max(dx * 0.5, 80)
  return `M ${x1} ${y1} C ${x1 + curvature} ${y1}, ${x2 - curvature} ${y2}, ${x2} ${y2}`
}

// ---------------------------------------------------------------------------
// Data-type → color mapping for gradients
// ---------------------------------------------------------------------------
const TYPE_COLORS: Record<PortDataType, { from: string; to: string }> = {
  text: { from: '#8b5cf6', to: '#a78bfa' },
  image: { from: '#ec4899', to: '#f472b6' },
  model3d: { from: '#06b6d4', to: '#22d3ee' },
  brandKit: { from: '#10b981', to: '#34d399' },
  imageLayers: { from: '#f59e0b', to: '#fbbf24' },
  color: { from: '#f43f5e', to: '#fb7185' },
  number: { from: '#0ea5e9', to: '#38bdf8' },
  any: { from: '#8b5cf6', to: '#22d3ee' },
}

function getDataTypeForConnection(
  connection: WorkflowConnection,
  nodes: WorkflowNode[]
): PortDataType {
  const sourceNode = nodes.find((n) => n.id === connection.sourceNodeId)
  if (!sourceNode) return 'any'
  const port = sourceNode.ports.find(
    (p) => p.id === connection.sourcePortId && p.direction === 'output'
  )
  return port?.dataType ?? 'any'
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface WorkflowConnectionsProps {
  connections: WorkflowConnection[]
  nodes: WorkflowNode[]
  connectingFrom: {
    nodeId: string
    portId: string
    direction: 'input' | 'output'
  } | null
  mousePosition: { x: number; y: number } | null
  onDeleteConnection: (connectionId: string) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function WorkflowConnections({
  connections,
  nodes,
  connectingFrom,
  mousePosition,
  onDeleteConnection,
}: WorkflowConnectionsProps) {
  // Build a stable set of gradient IDs so we don't re-create defs per render
  const usedTypes = useMemo(() => {
    const types = new Set<PortDataType>()
    for (const conn of connections) {
      types.add(getDataTypeForConnection(conn, nodes))
    }
    return types
  }, [connections, nodes])

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <defs>
        {/* Glow filter */}
        <filter id="wfEdgeGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Per-type gradient */}
        {Array.from(usedTypes).map((dt) => (
          <linearGradient
            key={dt}
            id={`wfGrad_${dt}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor={TYPE_COLORS[dt].from} stopOpacity={0.9} />
            <stop offset="100%" stopColor={TYPE_COLORS[dt].to} stopOpacity={0.9} />
          </linearGradient>
        ))}
      </defs>

      {/* Rendered connections */}
      {connections.map((conn) => {
        const sourceNode = nodes.find((n) => n.id === conn.sourceNodeId)
        const targetNode = nodes.find((n) => n.id === conn.targetNodeId)
        if (!sourceNode || !targetNode) return null

        const src = getPortPosition(sourceNode, conn.sourcePortId)
        const tgt = getPortPosition(targetNode, conn.targetPortId)
        const path = getBezierPath(src.x, src.y, tgt.x, tgt.y)
        const dt = getDataTypeForConnection(conn, nodes)
        const gradId = `wfGrad_${dt}`
        const dotColor = TYPE_COLORS[dt].from
        const dotColor2 = TYPE_COLORS[dt].to

        return (
          <g key={conn.id} className="pointer-events-auto" style={{ cursor: 'pointer' }}>
            {/* Invisible wider hit area for click */}
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth={14}
              strokeLinecap="round"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteConnection(conn.id)
              }}
            />
            {/* Glow background */}
            <path
              d={path}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={4}
              strokeLinecap="round"
              filter="url(#wfEdgeGlow)"
              opacity={0.35}
            />
            {/* Main line */}
            <path
              d={path}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={2}
              strokeLinecap="round"
            />
            {/* Flow dot 1 */}
            <circle r={3} fill={dotColor}>
              <animateMotion dur="2.5s" repeatCount="indefinite" path={path} />
            </circle>
            {/* Flow dot 2 */}
            <circle r={2} fill={dotColor2} opacity={0.6}>
              <animateMotion
                dur="2.5s"
                repeatCount="indefinite"
                path={path}
                begin="1.25s"
              />
            </circle>
          </g>
        )
      })}

      {/* Temporary connection line while dragging */}
      {connectingFrom && mousePosition && (() => {
        const sourceNode = nodes.find((n) => n.id === connectingFrom.nodeId)
        if (!sourceNode) return null

        const src = getPortPosition(sourceNode, connectingFrom.portId)

        // If dragging from an output port, the curve goes from port → mouse
        // If dragging from an input port, the curve goes from mouse → port
        let path: string
        if (connectingFrom.direction === 'output') {
          path = getBezierPath(src.x, src.y, mousePosition.x, mousePosition.y)
        } else {
          path = getBezierPath(mousePosition.x, mousePosition.y, src.x, src.y)
        }

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
