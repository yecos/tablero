'use client'

import { NodeConnection, CanvasNode, NODE_DEFINITIONS } from './types'

interface CanvasConnectionsProps {
  connections: NodeConnection[]
  nodes: CanvasNode[]
  tempConnection?: {
    sourceNodeId: string
    sourcePortId: string
    mouseX: number
    mouseY: number
  } | null
}

function getNodePortPosition(
  node: CanvasNode,
  portId: string,
  portType: 'input' | 'output'
): { x: number; y: number } {
  const def = NODE_DEFINITIONS[node.type]
  const nodeWidth = 280

  if (portType === 'input') {
    const ports = def.inputs
    const index = parseInt(portId.replace('input-', ''))
    return {
      x: node.position.x - 6,
      y: node.position.y + 40 + index * 24 + 12,
    }
  } else {
    const ports = def.outputs
    const index = parseInt(portId.replace('output-', ''))
    // Count header + body height roughly
    const headerHeight = 36
    const hasPrompt = ['image-generator', 'video-generator', 'chat', 'audio-generator', 'brand-kit', 'assistant'].includes(node.type)
    const bodyHeight = hasPrompt ? 100 : 20
    const inputPortsHeight = def.inputs.length * 24
    return {
      x: node.position.x + nodeWidth + 6,
      y: node.position.y + headerHeight + inputPortsHeight + bodyHeight + index * 24 + 8,
    }
  }
}

export function CanvasConnections({ connections, nodes, tempConnection }: CanvasConnectionsProps) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      {/* Existing connections */}
      {connections.map(conn => {
        const sourceNode = nodes.find(n => n.id === conn.sourceNodeId)
        const targetNode = nodes.find(n => n.id === conn.targetNodeId)
        if (!sourceNode || !targetNode) return null

        const from = getNodePortPosition(sourceNode, conn.sourcePortId, 'output')
        const to = getNodePortPosition(targetNode, conn.targetPortId, 'input')

        const dx = Math.abs(to.x - from.x) * 0.5
        const path = `M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`

        return (
          <g key={conn.id}>
            <path
              d={path}
              fill="none"
              stroke="rgba(59, 130, 246, 0.4)"
              strokeWidth="2"
            />
            <path
              d={path}
              fill="none"
              stroke="rgba(59, 130, 246, 0.8)"
              strokeWidth="1"
            />
          </g>
        )
      })}

      {/* Temp connection while dragging */}
      {tempConnection && (() => {
        const sourceNode = nodes.find(n => n.id === tempConnection.sourceNodeId)
        if (!sourceNode) return null

        const from = getNodePortPosition(sourceNode, tempConnection.sourcePortId, 'output')
        const to = { x: tempConnection.mouseX, y: tempConnection.mouseY }

        const dx = Math.abs(to.x - from.x) * 0.5
        const path = `M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`

        return (
          <path
            d={path}
            fill="none"
            stroke="rgba(59, 130, 246, 0.5)"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
        )
      })()}
    </svg>
  )
}
