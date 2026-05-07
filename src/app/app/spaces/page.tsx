'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Sparkles,
  ImagePlus,
  PenTool,
  Box,
  Download,
  Play,
  Plus,
  Trash2,
  Move,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Circle,
  Workflow,
  GripVertical,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

type NodeStatus = 'idle' | 'running' | 'completed' | 'error'

interface WorkflowNode {
  id: string
  type: 'text-ai' | 'image-gen' | 'image-edit' | '3d-gen' | 'output'
  x: number
  y: number
  label: string
  status: NodeStatus
  config: Record<string, string>
  outputs: string[]
}

interface Connection {
  id: string
  fromNodeId: string
  fromPort: string
  toNodeId: string
  toPort: string
}

const nodeTypes = [
  { type: 'text-ai' as const, label: 'Texto IA', icon: Sparkles, color: '#8b5cf6', desc: 'Genera texto con IA' },
  { type: 'image-gen' as const, label: 'Imagen Gen', icon: ImagePlus, color: '#06b6d4', desc: 'Genera imágenes con IA' },
  { type: 'image-edit' as const, label: 'Editar Imagen', icon: PenTool, color: '#f59e0b', desc: 'Edita imágenes con IA' },
  { type: '3d-gen' as const, label: '3D Gen', icon: Box, color: '#10b981', desc: 'Convierte a 3D' },
  { type: 'output' as const, label: 'Salida', icon: Download, color: '#6366f1', desc: 'Resultado final' },
]

function getStatusIcon(status: NodeStatus) {
  switch (status) {
    case 'idle': return <Circle className="h-3 w-3 text-white/30" />
    case 'running': return <Loader2 className="h-3 w-3 text-[#06b6d4] animate-spin" />
    case 'completed': return <CheckCircle2 className="h-3 w-3 text-green-500" />
    case 'error': return <AlertCircle className="h-3 w-3 text-red-500" />
  }
}

function getStatusLabel(status: NodeStatus) {
  switch (status) {
    case 'idle': return 'En espera'
    case 'running': return 'Ejecutando'
    case 'completed': return 'Completado'
    case 'error': return 'Error'
  }
}

export default function SpacesPage() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; port: string } | null>(null)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const addNode = useCallback((type: WorkflowNode['type'], x?: number, y?: number) => {
    const nodeType = nodeTypes.find((n) => n.type === type)
    if (!nodeType) return

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      x: x || 100 + Math.random() * 300,
      y: y || 100 + Math.random() * 200,
      label: nodeType.label,
      status: 'idle',
      config: {},
      outputs: ['output'],
    }
    setNodes((prev) => [...prev, newNode])
  }, [])

  const removeNode = useCallback((nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId))
    setConnections((prev) => prev.filter((c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId))
    if (selectedNodeId === nodeId) setSelectedNodeId(null)
  }, [selectedNodeId])

  const runWorkflow = useCallback(async () => {
    // Simulate workflow execution
    const idleNodes = nodes.filter((n) => n.status !== 'completed')
    for (const node of idleNodes) {
      setNodes((prev) =>
        prev.map((n) => (n.id === node.id ? { ...n, status: 'running' as NodeStatus } : n))
      )
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setNodes((prev) =>
        prev.map((n) => (n.id === node.id ? { ...n, status: 'completed' as NodeStatus } : n))
      )
    }
    toast({ title: '¡Flujo completado!', description: 'Todos los nodos se han ejecutado correctamente.' })
  }, [nodes, toast])

  // Node drag handlers
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return

    setDraggingNodeId(nodeId)
    setSelectedNodeId(nodeId)
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    })
  }, [nodes])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingNodeId) {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      setNodes((prev) =>
        prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
      )
    }
    if (isPanning) {
      const dx = e.clientX - panStart.x
      const dy = e.clientY - panStart.y
      setCanvasOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }, [draggingNodeId, dragOffset, isPanning, panStart])

  const handleMouseUp = useCallback(() => {
    setDraggingNodeId(null)
    setIsPanning(false)
  }, [])

  // Canvas click to deselect
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.canvas === 'true') {
      setSelectedNodeId(null)
    }
  }, [])

  // Connection drawing
  const handlePortClick = useCallback((nodeId: string, port: string, isOutput: boolean) => {
    if (isOutput) {
      setConnectingFrom({ nodeId, port })
    } else if (connectingFrom) {
      // Create connection
      if (connectingFrom.nodeId !== nodeId) {
        const newConn: Connection = {
          id: `conn-${Date.now()}`,
          fromNodeId: connectingFrom.nodeId,
          fromPort: connectingFrom.port,
          toNodeId: nodeId,
          toPort: port,
        }
        setConnections((prev) => [...prev, newConn])
      }
      setConnectingFrom(null)
    }
  }, [connectingFrom])

  const selectedNode = nodes.find((n) => n.id === selectedNodeId)

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Toolbar */}
      <div className="h-12 border-b border-white/10 bg-[#0d0d14]/60 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-[#8b5cf6]" />
          <span className="text-sm font-medium text-white/60">Flujo de Trabajo</span>
          <Badge variant="secondary" className="text-[10px] bg-white/5 text-white/40">
            {nodes.length} nodos
          </Badge>
          <Badge variant="secondary" className="text-[10px] bg-white/5 text-white/40">
            {connections.length} conexiones
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => { setNodes([]); setConnections([]) }}
            variant="ghost"
            size="sm"
            className="text-white/40 hover:text-white hover:bg-white/5 text-xs"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Limpiar
          </Button>
          <Button
            onClick={runWorkflow}
            disabled={nodes.length === 0 || nodes.some((n) => n.status === 'running')}
            size="sm"
            className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white hover:opacity-90 text-xs"
          >
            {nodes.some((n) => n.status === 'running') ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 mr-1" />
            )}
            Ejecutar flujo
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Node palette */}
        <div className="w-[220px] border-r border-white/10 bg-[#0d0d14]/50 backdrop-blur-sm p-3 space-y-2 shrink-0 overflow-y-auto">
          <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase mb-2">Nodos</p>
          {nodeTypes.map((nt) => {
            const Icon = nt.icon
            return (
              <button
                key={nt.type}
                onClick={() => addNode(nt.type)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/15 transition-all text-left group"
              >
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${nt.color}20` }}
                >
                  <Icon className="h-4 w-4" style={{ color: nt.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white/70 group-hover:text-white/90 truncate">{nt.label}</p>
                  <p className="text-[10px] text-white/30 truncate">{nt.desc}</p>
                </div>
              </button>
            )
          })}

          {/* Selected node info */}
          {selectedNode && (
            <div className="mt-4 space-y-2">
              <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">Nodo seleccionado</p>
              <div className="bg-white/5 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">{selectedNode.label}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                    onClick={() => removeNode(selectedNode.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(selectedNode.status)}
                  <span className="text-[10px] text-white/40">{getStatusLabel(selectedNode.status)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          data-canvas="true"
          className="flex-1 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseDown={(e) => {
            if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.canvas === 'true') {
              setIsPanning(true)
              setPanStart({ x: e.clientX, y: e.clientY })
            }
          }}
        >
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {connections.map((conn) => {
              const fromNode = nodes.find((n) => n.id === conn.fromNodeId)
              const toNode = nodes.find((n) => n.id === conn.toNodeId)
              if (!fromNode || !toNode) return null

              const fromX = fromNode.x + 180
              const fromY = fromNode.y + 30
              const toX = toNode.x
              const toY = toNode.y + 30

              const midX = (fromX + toX) / 2

              return (
                <path
                  key={conn.id}
                  d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
                  stroke="url(#connection-gradient)"
                  strokeWidth="2"
                  fill="none"
                  opacity={0.6}
                />
              )
            })}
            <defs>
              <linearGradient id="connection-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Nodes */}
          <div style={{ position: 'absolute', left: canvasOffset.x, top: canvasOffset.y, zIndex: 2 }}>
            {nodes.map((node) => {
              const nodeType = nodeTypes.find((nt) => nt.type === node.type)
              if (!nodeType) return null
              const Icon = nodeType.icon

              return (
                <div
                  key={node.id}
                  className={`absolute group cursor-move ${
                    selectedNodeId === node.id ? 'ring-2 ring-[#8b5cf6]/50' : ''
                  }`}
                  style={{
                    left: node.x,
                    top: node.y,
                    width: 180,
                  }}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                >
                  {/* Input port */}
                  <div
                    className="absolute -left-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-[#06b6d4] bg-[#0a0a0f] cursor-pointer hover:bg-[#06b6d4]/30 transition-colors z-10"
                    onClick={(e) => { e.stopPropagation(); handlePortClick(node.id, 'input', false) }}
                  />

                  {/* Output port */}
                  <div
                    className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-[#8b5cf6] bg-[#0a0a0f] cursor-pointer hover:bg-[#8b5cf6]/30 transition-colors z-10"
                    onClick={(e) => { e.stopPropagation(); handlePortClick(node.id, 'output', true) }}
                  />

                  <Card className="bg-[#12121a] border-white/10 overflow-hidden shadow-lg shadow-black/30">
                    {/* Node header */}
                    <div
                      className="flex items-center gap-2 px-3 py-2 border-b border-white/5"
                      style={{ backgroundColor: `${nodeType.color}15` }}
                    >
                      <GripVertical className="h-3 w-3 text-white/20" />
                      <Icon className="h-3.5 w-3.5" style={{ color: nodeType.color }} />
                      <span className="text-xs font-medium text-white/70 flex-1">{node.label}</span>
                      {getStatusIcon(node.status)}
                    </div>
                    {/* Node body */}
                    <div className="px-3 py-2">
                      <p className="text-[10px] text-white/30">
                        {node.status === 'idle' && 'Listo para ejecutar'}
                        {node.status === 'running' && 'Procesando...'}
                        {node.status === 'completed' && 'Completado ✓'}
                        {node.status === 'error' && 'Error ✗'}
                      </p>
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 3 }}>
              <div className="text-center space-y-4">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#06b6d4]/20 flex items-center justify-center mx-auto border border-white/10">
                  <Workflow className="h-10 w-10 text-white/20" />
                </div>
                <h2 className="text-xl font-semibold text-white/40">Crea tu flujo de trabajo</h2>
                <p className="text-sm text-white/25 max-w-sm">
                  Arrastra nodos desde la paleta al canvas y conéctalos para crear flujos de trabajo automatizados.
                </p>
                <Button
                  onClick={() => {
                    addNode('text-ai', 80, 120)
                    addNode('image-gen', 340, 120)
                    addNode('output', 600, 120)
                  }}
                  variant="outline"
                  className="border-white/10 text-white/40 hover:text-white hover:bg-white/5 pointer-events-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear flujo de ejemplo
                </Button>
              </div>
            </div>
          )}

          {/* Connecting indicator */}
          {connectingFrom && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 rounded-lg px-3 py-1.5 text-xs text-[#8b5cf6] z-10">
              Haz clic en un puerto de entrada para conectar
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5 ml-1 text-[#8b5cf6] hover:bg-[#8b5cf6]/20"
                onClick={() => setConnectingFrom(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
