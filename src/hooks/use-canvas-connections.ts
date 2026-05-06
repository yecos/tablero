import { useState, useCallback } from 'react'
import type { ConnectionPoint, NodeEdge, DesignElement } from '@/store/design-store'
import { toast } from 'sonner'

// Default connection points for a node (top, right, bottom, left)
export function getDefaultConnectionPoints(w: number, h: number): ConnectionPoint[] {
  return [
    { id: 'top', x: 0, y: -h / 2, label: 'Top' },
    { id: 'right', x: w / 2, y: 0, label: 'Right' },
    { id: 'bottom', x: 0, y: h / 2, label: 'Bottom' },
    { id: 'left', x: -w / 2, y: 0, label: 'Left' },
  ]
}

// Get absolute position of a connection point on the canvas
export function getConnectionPointPosition(element: DesignElement, pointId: string): { x: number; y: number } | null {
  const points = element.connectionPoints || getDefaultConnectionPoints(element.width, element.height)
  const point = points.find(p => p.id === pointId)
  if (!point) return null
  return {
    x: element.x + element.width / 2 + point.x,
    y: element.y + element.height / 2 + point.y,
  }
}

export interface UseCanvasConnectionsParams {
  elements: DesignElement[]
  edges: NodeEdge[]
  connectingFrom: { elementId: string; pointId: string } | null
  addEdge: (edge: NodeEdge) => void
  setConnectingFrom: (from: { elementId: string; pointId: string } | null) => void
}

export interface UseCanvasConnectionsReturn {
  tempEdgeEnd: { x: number; y: number } | null
  setTempEdgeEnd: (pos: { x: number; y: number } | null) => void
  hoveredPoint: string | null
  setHoveredPoint: (point: string | null) => void
  handleConnectionPointClick: (e: React.MouseEvent, elementId: string, pointId: string) => void
  allConnectionPoints: Array<{
    elementId: string
    point: ConnectionPoint
    absoluteX: number
    absoluteY: number
    isConnected: boolean
  }>
}

export function useCanvasConnections(params: UseCanvasConnectionsParams): UseCanvasConnectionsReturn {
  const {
    elements,
    edges,
    connectingFrom,
    addEdge,
    setConnectingFrom,
  } = params

  const [tempEdgeEnd, setTempEdgeEnd] = useState<{ x: number; y: number } | null>(null)
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null)

  // Handle connection point click
  const handleConnectionPointClick = useCallback((e: React.MouseEvent, elementId: string, pointId: string) => {
    e.stopPropagation()
    e.preventDefault()

    if (!connectingFrom) {
      // Start a new connection
      setConnectingFrom({ elementId, pointId })
      setTempEdgeEnd(null)
    } else {
      // Complete the connection
      if (connectingFrom.elementId === elementId) {
        // Can't connect to self
        toast.error('Cannot connect a node to itself')
        setConnectingFrom(null)
        setTempEdgeEnd(null)
        return
      }

      // Check for duplicate edge
      const isDuplicate = edges.some(
        (edge) =>
          (edge.sourceId === connectingFrom.elementId && edge.sourcePointId === connectingFrom.pointId &&
           edge.targetId === elementId && edge.targetPointId === pointId) ||
          (edge.sourceId === elementId && edge.sourcePointId === pointId &&
           edge.targetId === connectingFrom.elementId && edge.targetPointId === connectingFrom.pointId)
      )

      if (isDuplicate) {
        toast.error('Connection already exists')
        setConnectingFrom(null)
        setTempEdgeEnd(null)
        return
      }

      const newEdge: NodeEdge = {
        id: `edge_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        sourceId: connectingFrom.elementId,
        sourcePointId: connectingFrom.pointId,
        targetId: elementId,
        targetPointId: pointId,
        color: '#8b5cf6',
      }

      addEdge(newEdge)
      toast.success('Connection created')
      setConnectingFrom(null)
      setTempEdgeEnd(null)
    }
  }, [connectingFrom, edges, addEdge, setConnectingFrom])

  // Compute all visible connection points
  const allConnectionPoints = elements
    .filter(e => e.visible && (e.type === '3d' || e.connectionPoints?.length))
    .flatMap(element => {
      const points = element.connectionPoints || getDefaultConnectionPoints(element.width, element.height)
      return points.map(point => ({
        elementId: element.id,
        point,
        absoluteX: element.x + element.width / 2 + point.x,
        absoluteY: element.y + element.height / 2 + point.y,
        isConnected: edges.some(
          edge =>
            (edge.sourceId === element.id && edge.sourcePointId === point.id) ||
            (edge.targetId === element.id && edge.targetPointId === point.id)
        ),
      }))
    })

  return {
    tempEdgeEnd,
    setTempEdgeEnd,
    hoveredPoint,
    setHoveredPoint,
    handleConnectionPointClick,
    allConnectionPoints,
  }
}
