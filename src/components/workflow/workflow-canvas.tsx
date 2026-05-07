'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  type WorkflowNodeType,
  type WorkflowConnection,
  type WorkflowNode as WorkflowNodeTypeDef,
  type PortDataType,
  NODE_DEFAULTS,
  isTypeCompatible,
} from '@/store/workflow-types'
import { useWorkflowStore } from '@/store/workflow-store'
import { executeWorkflow, executeSingleNode } from '@/lib/workflow-engine'
import { WorkflowConnections, getPortPosition } from './workflow-connections'
import { AddNodeMenu } from './add-node-menu'
import { TextAINode } from './nodes/text-ai-node'
import { ImageGenNode } from './nodes/image-gen-node'
import { ImageEditNode } from './nodes/image-edit-node'
import { ThreedGenNode } from './nodes/threed-gen-node'
import { BrandKitNode } from './nodes/brand-kit-node'
import { RemoveBgNode } from './nodes/remove-bg-node'
import { StyleTransferNode } from './nodes/style-transfer-node'
import { SvgVectorizeNode } from './nodes/svg-vectorize-node'
import { TextInputNode } from './nodes/text-input-node'
import { ImageInputNode } from './nodes/image-input-node'
import { ColorPickerNode } from './nodes/color-picker-node'
import { NumberInputNode } from './nodes/number-input-node'
import { ImageTransformNode } from './nodes/image-transform-node'
import { TextTemplateNode } from './nodes/text-template-node'
import { ConditionNode } from './nodes/condition-node'
import { MergeNode } from './nodes/merge-node'
import { NoteNode } from './nodes/note-node'
import { ExportNode } from './nodes/export-node'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Play,
  Trash2,
  Undo2,
  Redo2,
  Plus,
  Loader2,
  Monitor,
  AlertCircle,
  CheckCircle2,
  Type,
  ImageIcon,
  Pencil,
  Box,
  Palette,
  ZoomIn,
  ZoomOut,
  Maximize,
  Upload,
  Pipette,
  Hash,
  Wand2,
  FileCode,
  GitBranch,
  Merge,
  StickyNote,
  Download,
  Save,
  FolderOpen,
  Scissors,
  Paintbrush,
  PenTool,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Data-type colors for ports
// ---------------------------------------------------------------------------
const PORT_COLORS: Record<PortDataType, string> = {
  text: '#8b5cf6',
  image: '#ec4899',
  model3d: '#06b6d4',
  brandKit: '#10b981',
  imageLayers: '#f59e0b',
  color: '#f43f5e',
  number: '#0ea5e9',
  any: '#6366f1',
}

// ---------------------------------------------------------------------------
// Output Node (inline because there's no separate file)
// ---------------------------------------------------------------------------
function OutputNodeContent({
  node,
}: {
  node: WorkflowNodeTypeDef
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}) {
  const inputValue = node.outputs['input_0_any'] ?? Object.values(node.outputs)[0]
  const value = inputValue?.value

  return (
    <div className="flex flex-col gap-2">
      {node.status === 'completed' && value !== undefined && (
        <div className="rounded-md bg-white/5 p-2">
          {typeof value === 'string' && (value.startsWith('http') || value.startsWith('data:image')) ? (
            <img
              src={value}
              alt="Output preview"
              className="w-full max-h-[140px] object-contain rounded"
            />
          ) : typeof value === 'string' ? (
            <p className="text-xs text-slate-300 whitespace-pre-wrap line-clamp-6">{value}</p>
          ) : (
            <pre className="text-[10px] text-slate-400 whitespace-pre-wrap overflow-auto max-h-[120px]">
              {JSON.stringify(value, null, 2)}
            </pre>
          )}
        </div>
      )}
      {node.status === 'idle' && (
        <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-2">
          <Monitor className="h-3.5 w-3.5 text-indigo-500/40" />
          <span className="text-[10px] text-slate-500">Connect an output to preview</span>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Node icon by type
// ---------------------------------------------------------------------------
function getNodeIcon(type: WorkflowNodeType) {
  switch (type) {
    case 'text-ai':
      return <Wand2 size={12} />
    case 'image-gen':
      return <ImageIcon size={12} />
    case 'image-edit':
      return <Pencil size={12} />
    case '3d-gen':
      return <Box size={12} />
    case 'brand-kit':
      return <Palette size={12} />
    case 'remove-bg':
      return <Scissors size={12} />
    case 'style-transfer':
      return <Paintbrush size={12} />
    case 'svg-vectorize':
      return <PenTool size={12} />
    case 'output':
      return <Monitor size={12} />
    case 'text-input':
      return <Type size={12} />
    case 'image-input':
      return <Upload size={12} />
    case 'color-picker':
      return <Pipette size={12} />
    case 'number-input':
      return <Hash size={12} />
    case 'image-transform':
      return <ImageIcon size={12} />
    case 'text-template':
      return <FileCode size={12} />
    case 'condition':
      return <GitBranch size={12} />
    case 'merge':
      return <Merge size={12} />
    case 'note':
      return <StickyNote size={12} />
    case 'export':
      return <Download size={12} />
  }
}

// ---------------------------------------------------------------------------
// Single Workflow Node rendered on canvas
// ---------------------------------------------------------------------------
function WorkflowNodeComponent({
  node,
  isSelected,
  isExecuting,
  onSelect,
  onStartDrag,
  onStartConnection,
  onEndConnection,
  onDataChange,
  onRunNode,
}: {
  node: WorkflowNodeTypeDef
  isSelected: boolean
  isExecuting: boolean
  onSelect: () => void
  onStartDrag: (e: React.MouseEvent) => void
  onStartConnection: (portId: string, direction: 'input' | 'output', e: React.MouseEvent) => void
  onEndConnection: (portId: string, direction: 'input' | 'output') => void
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
  onRunNode: () => void
}) {
  const defaults = NODE_DEFAULTS[node.type]
  const inputPorts = node.ports.filter((p) => p.direction === 'input')
  const outputPorts = node.ports.filter((p) => p.direction === 'output')
  const isNote = node.type === 'note'

  const statusIndicator = () => {
    switch (node.status) {
      case 'running':
        return <Loader2 size={12} className="animate-spin text-yellow-400" />
      case 'completed':
        return <CheckCircle2 size={12} className="text-emerald-400" />
      case 'error':
        return <AlertCircle size={12} className="text-red-400" />
      default:
        return null
    }
  }

  const renderNodeContent = () => {
    switch (node.type) {
      case 'text-ai':
        return <TextAINode node={node} onDataChange={onDataChange} />
      case 'image-gen':
        return <ImageGenNode node={node} onDataChange={onDataChange} />
      case 'image-edit':
        return <ImageEditNode node={node} onDataChange={onDataChange} />
      case '3d-gen':
        return <ThreedGenNode node={node} onDataChange={onDataChange} />
      case 'brand-kit':
        return <BrandKitNode node={node} onDataChange={onDataChange} />
      case 'remove-bg':
        return <RemoveBgNode node={node} isSelected={false} onUpdate={onDataChange} />
      case 'style-transfer':
        return <StyleTransferNode node={node} isSelected={false} onUpdate={onDataChange} />
      case 'svg-vectorize':
        return <SvgVectorizeNode node={node} isSelected={false} onUpdate={onDataChange} />
      case 'output':
        return <OutputNodeContent node={node} onDataChange={onDataChange} />
      case 'text-input':
        return <TextInputNode node={node} onDataChange={onDataChange} />
      case 'image-input':
        return <ImageInputNode node={node} onDataChange={onDataChange} />
      case 'color-picker':
        return <ColorPickerNode node={node} onDataChange={onDataChange} />
      case 'number-input':
        return <NumberInputNode node={node} onDataChange={onDataChange} />
      case 'image-transform':
        return <ImageTransformNode node={node} onDataChange={onDataChange} />
      case 'text-template':
        return <TextTemplateNode node={node} onDataChange={onDataChange} />
      case 'condition':
        return <ConditionNode node={node} onDataChange={onDataChange} />
      case 'merge':
        return <MergeNode node={node} onDataChange={onDataChange} />
      case 'note':
        return <NoteNode node={node} onDataChange={onDataChange} />
      case 'export':
        return <ExportNode node={node} onDataChange={onDataChange} />
      default:
        return null
    }
  }

  // Note nodes have a special style
  const noteColor = (node.data.color as string) || defaults.color

  return (
    <div
      className={cn(
        'absolute select-none rounded-xl border shadow-lg transition-shadow duration-200',
        isNote
          ? 'bg-[#1a1a1f]/95 border-dashed'
          : 'bg-[#12121a] border-white/[0.07] shadow-black/40',
        isSelected && !isNote
          ? 'border-white/20 shadow-xl shadow-white/5'
          : isSelected && isNote
            ? 'border-white/30 shadow-xl shadow-white/5'
            : null,
        isExecuting && 'ring-1 ring-yellow-400/30'
      )}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        minHeight: node.height,
        zIndex: isSelected ? 20 : 10,
        ...(isNote ? { borderColor: `${noteColor}40` } : {}),
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-2 rounded-t-xl px-3 py-2 cursor-grab active:cursor-grabbing border-b',
          isNote ? 'border-dashed' : 'border-white/[0.06]'
        )}
        style={{
          background: `linear-gradient(135deg, ${isNote ? noteColor : defaults.color}15, ${isNote ? noteColor : defaults.color}08)`,
          borderBottomColor: isNote ? `${noteColor}20` : undefined,
        }}
        onMouseDown={(e) => {
          if (e.button === 0) onStartDrag(e)
        }}
      >
        <span
          className="flex h-5 w-5 items-center justify-center rounded-md"
          style={{ backgroundColor: (isNote ? noteColor : defaults.color) + '25', color: isNote ? noteColor : defaults.color }}
        >
          {getNodeIcon(node.type)}
        </span>
        <span className="text-xs font-medium text-white/80 flex-1 truncate">
          {node.title}
        </span>
        {statusIndicator()}
        {/* Run single node button - hidden for note and input-only nodes */}
        {!isNote && node.type !== 'note' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRunNode()
            }}
            className="flex h-5 w-5 items-center justify-center rounded-md hover:bg-white/10 transition-colors"
            title="Run this node"
          >
            <Play size={10} className="text-white/50" />
          </button>
        )}
      </div>

      {/* Ports + Content */}
      <div className="relative px-3 py-2">
        {/* Input ports on left */}
        {inputPorts.length > 0 && (
          <div className="absolute left-0 top-2 flex flex-col gap-[28px]">
            {inputPorts.map((port, i) => (
              <div
                key={port.id}
                className="absolute flex items-center gap-1"
                style={{
                  top: `${12 + i * 28}px`,
                  left: '-6px',
                }}
              >
                <div
                  className="h-3 w-3 rounded-full border-2 cursor-crosshair transition-transform hover:scale-125"
                  style={{
                    borderColor: PORT_COLORS[port.dataType],
                    backgroundColor: PORT_COLORS[port.dataType] + '33',
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    onStartConnection(port.id, 'input', e)
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation()
                    onEndConnection(port.id, 'input')
                  }}
                  title={`${port.name} (${port.dataType})`}
                />
                <span className="text-[9px] text-white/40 ml-0.5">{port.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Output ports on right */}
        {outputPorts.length > 0 && (
          <div className="absolute right-0 top-2 flex flex-col gap-[28px]">
            {outputPorts.map((port, i) => (
              <div
                key={port.id}
                className="absolute flex items-center gap-1"
                style={{
                  top: `${12 + i * 28}px`,
                  right: '-6px',
                }}
              >
                <span className="text-[9px] text-white/40 mr-0.5">{port.name}</span>
                <div
                  className="h-3 w-3 rounded-full border-2 cursor-crosshair transition-transform hover:scale-125"
                  style={{
                    borderColor: PORT_COLORS[port.dataType],
                    backgroundColor: PORT_COLORS[port.dataType] + '33',
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    onStartConnection(port.id, 'output', e)
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation()
                    onEndConnection(port.id, 'output')
                  }}
                  title={`${port.name} (${port.dataType})`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Node body */}
        <div className="min-h-[60px]">{renderNodeContent()}</div>
      </div>

      {/* Error message */}
      {node.status === 'error' && node.errorMessage && (
        <div className="px-3 pb-2">
          <p className="text-[10px] text-red-400 truncate" title={node.errorMessage}>
            {node.errorMessage}
          </p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Minimap
// ---------------------------------------------------------------------------
function Minimap() {
  const nodes = useWorkflowStore((s) => s.nodes)
  const zoom = useWorkflowStore((s) => s.zoom)
  const panX = useWorkflowStore((s) => s.panX)
  const panY = useWorkflowStore((s) => s.panY)

  if (nodes.length === 0) return null

  // Compute bounds
  const xs = nodes.map((n) => n.x)
  const ys = nodes.map((n) => n.y)
  const minX = Math.min(...xs) - 50
  const minY = Math.min(...ys) - 50
  const maxX = Math.max(...xs.map((x, i) => x + nodes[i].width)) + 50
  const maxY = Math.max(...ys.map((y, i) => y + nodes[i].height)) + 50

  const worldW = maxX - minX || 1
  const worldH = maxY - minY || 1
  const mapW = 140
  const mapH = 90
  const scale = Math.min(mapW / worldW, mapH / worldH)

  return (
    <div className="absolute bottom-4 left-4 z-30 rounded-lg border border-white/10 bg-[#12121a]/90 backdrop-blur p-1.5 shadow-lg">
      <svg width={mapW} height={mapH} className="rounded">
        <rect width={mapW} height={mapH} fill="#0a0a0f" rx="4" />
        {/* Viewport rect */}
        <rect
          x={((-panX / zoom - minX) * scale)}
          y={((-panY / zoom - minY) * scale)}
          width={(800 / zoom) * scale}
          height={(600 / zoom) * scale}
          fill="rgba(139,92,246,0.08)"
          stroke="rgba(139,92,246,0.3)"
          strokeWidth={1}
          rx={2}
        />
        {/* Node rects */}
        {nodes.map((n) => (
          <rect
            key={n.id}
            x={(n.x - minX) * scale}
            y={(n.y - minY) * scale}
            width={n.width * scale}
            height={n.height * scale}
            rx={1}
            fill={NODE_DEFAULTS[n.type].color + '66'}
            stroke={NODE_DEFAULTS[n.type].color}
            strokeWidth={0.5}
          />
        ))}
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Workflow Canvas
// ---------------------------------------------------------------------------
export function WorkflowCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Store state
  const nodes = useWorkflowStore((s) => s.nodes)
  const connections = useWorkflowStore((s) => s.connections)
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)
  const isExecuting = useWorkflowStore((s) => s.isExecuting)
  const zoom = useWorkflowStore((s) => s.zoom)
  const panX = useWorkflowStore((s) => s.panX)
  const panY = useWorkflowStore((s) => s.panY)
  const connectingFrom = useWorkflowStore((s) => s.connectingFrom)
  const canUndo = useWorkflowStore((s) => s.canUndo)
  const canRedo = useWorkflowStore((s) => s.canRedo)

  // Store actions
  const addNode = useWorkflowStore((s) => s.addNode)
  const removeNode = useWorkflowStore((s) => s.removeNode)
  const updateNode = useWorkflowStore((s) => s.updateNode)
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData)
  const selectNode = useWorkflowStore((s) => s.selectNode)
  const addConnection = useWorkflowStore((s) => s.addConnection)
  const removeConnection = useWorkflowStore((s) => s.removeConnection)
  const setConnectingFrom = useWorkflowStore((s) => s.setConnectingFrom)
  const setZoom = useWorkflowStore((s) => s.setZoom)
  const setPan = useWorkflowStore((s) => s.setPan)
  const setCenteredPan = useWorkflowStore((s) => s.setCenteredPan)
  const clearWorkflow = useWorkflowStore((s) => s.clearWorkflow)
  const undo = useWorkflowStore((s) => s.undo)
  const redo = useWorkflowStore((s) => s.redo)
  const setIsExecuting = useWorkflowStore((s) => s.setIsExecuting)

  // Local state
  const [addMenuPosition, setAddMenuPosition] = useState<{
    x: number
    y: number
    canvasX: number
    canvasY: number
  } | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0, panX: 0, panY: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragInfo, setDragInfo] = useState<{
    nodeId: string
    offsetX: number
    offsetY: number
  } | null>(null)

  // ---------------------------------------------------------------------------
  // Initialize centered pan
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setCenteredPan(rect.width, rect.height)
    }
  }, [setCenteredPan])

  // ---------------------------------------------------------------------------
  // Convert screen coords to canvas coords
  // ---------------------------------------------------------------------------
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 }
      const rect = containerRef.current.getBoundingClientRect()
      return {
        x: (screenX - rect.left - panX) / zoom,
        y: (screenY - rect.top - panY) / zoom,
      }
    },
    [panX, panY, zoom]
  )

  // ---------------------------------------------------------------------------
  // Wheel: zoom with ctrl, pan without
  // ---------------------------------------------------------------------------
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const delta = -e.deltaY * 0.001
        const newZoom = Math.max(0.15, Math.min(3, zoom + delta * zoom))
        // Zoom towards mouse
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          const mx = e.clientX - rect.left
          const my = e.clientY - rect.top
          const factor = newZoom / zoom
          const newPanX = mx - (mx - panX) * factor
          const newPanY = my - (my - panY) * factor
          setZoom(newZoom)
          setPan(newPanX, newPanY)
        }
      } else {
        // Pan
        setPan(panX - e.deltaX, panY - e.deltaY)
      }
    },
    [zoom, panX, panY, setZoom, setPan]
  )

  // ---------------------------------------------------------------------------
  // Canvas mouse-down: start panning or deselect
  // ---------------------------------------------------------------------------
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target !== containerRef.current && e.target !== canvasRef.current) return
      if (e.button !== 0) return

      // If connecting, cancel
      if (connectingFrom) {
        setConnectingFrom(null)
        setMousePosition(null)
        return
      }

      // Close add menu
      setAddMenuPosition(null)

      // Deselect
      selectNode(null)

      // Start panning
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY, panX, panY })
    },
    [connectingFrom, panX, panY, selectNode, setConnectingFrom]
  )

  // ---------------------------------------------------------------------------
  // Global mouse move
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      // Panning
      if (isPanning) {
        const dx = e.clientX - panStart.x
        const dy = e.clientY - panStart.y
        setPan(panStart.panX + dx, panStart.panY + dy)
        return
      }

      // Dragging node
      if (isDragging && dragInfo) {
        const canvasPos = screenToCanvas(e.clientX, e.clientY)
        updateNode(dragInfo.nodeId, {
          x: Math.round(canvasPos.x - dragInfo.offsetX),
          y: Math.round(canvasPos.y - dragInfo.offsetY),
        })
        return
      }

      // Connecting line
      if (connectingFrom) {
        const canvasPos = screenToCanvas(e.clientX, e.clientY)
        setMousePosition(canvasPos)
      }
    }

    const handleUp = () => {
      if (isPanning) setIsPanning(false)
      if (isDragging) {
        setIsDragging(false)
        setDragInfo(null)
        // Push to history after drag
        useWorkflowStore.getState().pushHistory()
      }
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [
    isPanning,
    isDragging,
    dragInfo,
    connectingFrom,
    panStart,
    screenToCanvas,
    updateNode,
    setPan,
  ])

  // ---------------------------------------------------------------------------
  // Double-click to add node
  // ---------------------------------------------------------------------------
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target !== containerRef.current && e.target !== canvasRef.current) return
      const canvasPos = screenToCanvas(e.clientX, e.clientY)
      setAddMenuPosition({
        x: e.clientX - (containerRef.current?.getBoundingClientRect().left ?? 0),
        y: e.clientY - (containerRef.current?.getBoundingClientRect().top ?? 0),
        canvasX: canvasPos.x,
        canvasY: canvasPos.y,
      })
    },
    [screenToCanvas]
  )

  // ---------------------------------------------------------------------------
  // Add node from toolbar or menu
  // ---------------------------------------------------------------------------
  const handleAddNode = useCallback(
    (type: WorkflowNodeType) => {
      const pos = addMenuPosition
        ? { x: addMenuPosition.canvasX, y: addMenuPosition.canvasY }
        : screenToCanvas(
            (containerRef.current?.getBoundingClientRect().left ?? 0) + 400,
            (containerRef.current?.getBoundingClientRect().top ?? 0) + 200
          )
      // Offset to center the node
      const defaults = NODE_DEFAULTS[type]
      addNode(type, pos.x - defaults.width / 2, pos.y - defaults.height / 2)
      setAddMenuPosition(null)
    },
    [addMenuPosition, addNode, screenToCanvas]
  )

  // ---------------------------------------------------------------------------
  // Node dragging
  // ---------------------------------------------------------------------------
  const handleNodeDragStart = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      const canvasPos = screenToCanvas(e.clientX, e.clientY)
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return
      setIsDragging(true)
      setDragInfo({
        nodeId,
        offsetX: canvasPos.x - node.x,
        offsetY: canvasPos.y - node.y,
      })
      selectNode(nodeId)
    },
    [nodes, screenToCanvas, selectNode]
  )

  // ---------------------------------------------------------------------------
  // Connection creation
  // ---------------------------------------------------------------------------
  const handleStartConnection = useCallback(
    (
      nodeId: string,
      portId: string,
      direction: 'input' | 'output',
      e: React.MouseEvent
    ) => {
      e.stopPropagation()
      setConnectingFrom({ nodeId, portId, direction })
      const canvasPos = screenToCanvas(e.clientX, e.clientY)
      setMousePosition(canvasPos)
    },
    [screenToCanvas, setConnectingFrom]
  )

  const handleEndConnection = useCallback(
    (nodeId: string, portId: string, direction: 'input' | 'output') => {
      const from = connectingFrom
      if (!from) return

      // Can't connect to self
      if (from.nodeId === nodeId) {
        setConnectingFrom(null)
        setMousePosition(null)
        return
      }

      // Determine source and target
      let sourceNodeId: string
      let sourcePortId: string
      let targetNodeId: string
      let targetPortId: string

      if (from.direction === 'output' && direction === 'input') {
        sourceNodeId = from.nodeId
        sourcePortId = from.portId
        targetNodeId = nodeId
        targetPortId = portId
      } else if (from.direction === 'input' && direction === 'output') {
        sourceNodeId = nodeId
        sourcePortId = portId
        targetNodeId = from.nodeId
        targetPortId = from.portId
      } else {
        // Same direction – not allowed
        toast.error('Cannot connect ports with the same direction')
        setConnectingFrom(null)
        setMousePosition(null)
        return
      }

      // Type compatibility check
      const sourceNode = useWorkflowStore.getState().nodes.find((n) => n.id === sourceNodeId)
      const targetNode = useWorkflowStore.getState().nodes.find((n) => n.id === targetNodeId)
      if (sourceNode && targetNode) {
        const sourcePort = sourceNode.ports.find((p) => p.id === sourcePortId)
        const targetPort = targetNode.ports.find((p) => p.id === targetPortId)
        if (sourcePort && targetPort && !isTypeCompatible(sourcePort.dataType, targetPort.dataType)) {
          toast.error(
            `Incompatible types: ${sourcePort.dataType} → ${targetPort.dataType}`
          )
          setConnectingFrom(null)
          setMousePosition(null)
          return
        }
      }

      // Create connection
      const connection: WorkflowConnection = {
        id: `conn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        sourceNodeId,
        sourcePortId,
        targetNodeId,
        targetPortId,
      }
      addConnection(connection)
      setConnectingFrom(null)
      setMousePosition(null)
    },
    [connectingFrom, addConnection, setConnectingFrom]
  )

  // ---------------------------------------------------------------------------
  // Delete connection
  // ---------------------------------------------------------------------------
  const handleDeleteConnection = useCallback(
    (connectionId: string) => {
      removeConnection(connectionId)
    },
    [removeConnection]
  )

  // ---------------------------------------------------------------------------
  // Run workflow
  // ---------------------------------------------------------------------------
  const handleRunWorkflow = useCallback(async () => {
    if (isExecuting) return
    try {
      await executeWorkflow(useWorkflowStore.getState())
      toast.success('Workflow completed')
    } catch (err) {
      toast.error('Workflow execution failed')
    }
  }, [isExecuting])

  // ---------------------------------------------------------------------------
  // Run single node
  // ---------------------------------------------------------------------------
  const handleRunNode = useCallback(
    async (nodeId: string) => {
      if (isExecuting) return
      try {
        await executeSingleNode(nodeId)
      } catch {
        toast.error('Node execution failed')
      }
    },
    [isExecuting]
  )

  // ---------------------------------------------------------------------------
  // Keyboard shortcuts
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Delete selected node
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
        removeNode(selectedNodeId)
      }
      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      // Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
      // Escape
      if (e.key === 'Escape') {
        setConnectingFrom(null)
        setMousePosition(null)
        setAddMenuPosition(null)
        selectNode(null)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedNodeId, removeNode, undo, redo, selectNode, setConnectingFrom])

  // ---------------------------------------------------------------------------
  // Zoom controls
  // ---------------------------------------------------------------------------
  const handleZoomIn = useCallback(() => {
    setZoom(zoom * 1.2)
  }, [zoom, setZoom])

  const handleZoomOut = useCallback(() => {
    setZoom(zoom / 1.2)
  }, [zoom, setZoom])

  const handleZoomReset = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setZoom(0.9)
      setCenteredPan(rect.width, rect.height)
    }
  }, [setZoom, setCenteredPan])

  // ---------------------------------------------------------------------------
  // Save/Load workflow to localStorage
  // ---------------------------------------------------------------------------
  const handleSaveWorkflow = useCallback(() => {
    const store = useWorkflowStore.getState()
    const data = {
      nodes: store.nodes,
      connections: store.connections,
    }
    localStorage.setItem('tablero-workflow', JSON.stringify(data))
    toast.success('Workflow saved')
  }, [])

  const handleLoadWorkflow = useCallback(() => {
    try {
      const saved = localStorage.getItem('tablero-workflow')
      if (!saved) {
        toast.error('No saved workflow found')
        return
      }
      const data = JSON.parse(saved)
      const store = useWorkflowStore.getState()
      // Clear and load
      store.clearWorkflow()
      for (const node of data.nodes || []) {
        // Add each node
        const newNode = store.addNode(node.type, node.x, node.y)
        // Update with saved data
        store.updateNode(newNode, {
          title: node.title,
          data: node.data,
          outputs: node.outputs,
          status: 'idle',
        })
      }
      // Re-add connections (node IDs may have changed, skip for now)
      toast.success('Workflow loaded')
    } catch {
      toast.error('Failed to load workflow')
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-[#0a0a0f]"
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onDoubleClick={handleDoubleClick}
      style={{
        cursor: isPanning ? 'grabbing' : connectingFrom ? 'crosshair' : 'default',
      }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${panX}px ${panY}px`,
        }}
      />

      {/* Canvas transform */}
      <div
        ref={canvasRef}
        className="absolute origin-top-left"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          width: '10000px',
          height: '10000px',
        }}
      >
        {/* Connections SVG */}
        <WorkflowConnections
          connections={connections}
          nodes={nodes}
          connectingFrom={connectingFrom}
          mousePosition={mousePosition}
          onDeleteConnection={handleDeleteConnection}
        />

        {/* Nodes */}
        {nodes.map((node) => (
          <WorkflowNodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            isExecuting={isExecuting && useWorkflowStore.getState().executingNodeId === node.id}
            onSelect={() => selectNode(node.id)}
            onStartDrag={(e) => handleNodeDragStart(node.id, e)}
            onStartConnection={(portId, direction, e) =>
              handleStartConnection(node.id, portId, direction, e)
            }
            onEndConnection={(portId, direction) =>
              handleEndConnection(node.id, portId, direction)
            }
            onDataChange={(nodeId, data) => updateNodeData(nodeId, data)}
            onRunNode={() => handleRunNode(node.id)}
          />
        ))}
      </div>

      {/* Minimap */}
      <Minimap />

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 z-30 flex items-center gap-1 rounded-lg border border-white/10 bg-[#12121a]/90 backdrop-blur px-2 py-1 shadow-lg">
        <button
          onClick={handleZoomOut}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-white/10 transition-colors"
          title="Zoom out"
        >
          <ZoomOut size={14} className="text-white/60" />
        </button>
        <span className="text-[11px] font-mono text-white/50 w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-white/10 transition-colors"
          title="Zoom in"
        >
          <ZoomIn size={14} className="text-white/60" />
        </button>
        <div className="w-px h-4 bg-white/10 mx-0.5" />
        <button
          onClick={handleZoomReset}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-white/10 transition-colors"
          title="Reset view"
        >
          <Maximize size={12} className="text-white/60" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#12121a]/90 backdrop-blur-md px-3 py-1.5 shadow-2xl">
        {/* Add Node dropdown trigger */}
        <div className="relative">
          <button
            onClick={() => {
              const pos = screenToCanvas(
                (containerRef.current?.getBoundingClientRect().left ?? 0) +
                  (containerRef.current?.getBoundingClientRect().width ?? 800) / 2,
                (containerRef.current?.getBoundingClientRect().top ?? 0) + 120
              )
              setAddMenuPosition({
                x: 0,
                y: 44,
                canvasX: pos.x,
                canvasY: pos.y,
              })
            }}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 transition-colors"
          >
            <Plus size={14} />
            Add Node
          </button>
        </div>

        <div className="w-px h-5 bg-white/10" />

        {/* Run Workflow */}
        <button
          onClick={handleRunWorkflow}
          disabled={isExecuting || nodes.length === 0}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            isExecuting
              ? 'text-yellow-400/60 cursor-not-allowed'
              : 'text-emerald-400 hover:bg-emerald-500/10'
          )}
        >
          {isExecuting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Play size={14} />
          )}
          {isExecuting ? 'Running...' : 'Run'}
        </button>

        <div className="w-px h-5 bg-white/10" />

        {/* Save */}
        <button
          onClick={handleSaveWorkflow}
          disabled={nodes.length === 0}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Save workflow"
        >
          <Save size={13} />
        </button>

        {/* Load */}
        <button
          onClick={handleLoadWorkflow}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors"
          title="Load workflow"
        >
          <FolderOpen size={13} />
        </button>

        <div className="w-px h-5 bg-white/10" />

        {/* Clear */}
        <button
          onClick={() => {
            clearWorkflow()
            toast.success('Workflow cleared')
          }}
          disabled={nodes.length === 0}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Trash2 size={14} />
          Clear
        </button>

        <div className="w-px h-5 bg-white/10" />

        {/* Undo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={14} />
        </button>

        {/* Redo */}
        <button
          onClick={redo}
          disabled={!canRedo}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 size={14} />
        </button>
      </div>

      {/* Add Node Menu */}
      {addMenuPosition && (
        <AddNodeMenu
          x={addMenuPosition.x}
          y={addMenuPosition.y}
          onAddNode={handleAddNode}
          onClose={() => setAddMenuPosition(null)}
        />
      )}

      {/* Empty state hint */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <Plus size={24} className="text-white/20" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/40">No nodes yet</p>
              <p className="text-xs text-white/25 mt-1">
                Double-click to add a node, or use the toolbar
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
