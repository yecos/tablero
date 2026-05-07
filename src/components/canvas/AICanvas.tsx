'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { CanvasNode, NodeConnection, NodeType, NODE_DEFINITIONS } from './types'
import { AINode } from './AINode'
import { CanvasConnections } from './CanvasConnections'
import { ToolSidebar } from './ToolSidebar'
import { CanvasHeader } from './CanvasHeader'
import { MessageSquare } from 'lucide-react'

interface AICanvasProps {
  spaceId: string
  spaceName: string
  initialNodes?: CanvasNode[]
  initialConnections?: NodeConnection[]
  onNodesChange?: (nodes: CanvasNode[]) => void
}

let nodeIdCounter = 0
function generateNodeId() {
  return `node-${Date.now()}-${++nodeIdCounter}`
}

export function AICanvas({ spaceId, spaceName, initialNodes, initialConnections, onNodesChange }: AICanvasProps) {
  const [nodes, setNodes] = useState<CanvasNode[]>(initialNodes || [])
  const [connections, setConnections] = useState<NodeConnection[]>(initialConnections || [])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; portId: string } | null>(null)
  const [tempMousePos, setTempMousePos] = useState<{ x: number; y: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Add a new node to the canvas
  const handleAddNode = useCallback((type: NodeType) => {
    const def = NODE_DEFINITIONS[type]
    const newNode: CanvasNode = {
      id: generateNodeId(),
      type,
      title: def.title,
      position: {
        x: 300 + Math.random() * 200 - panOffset.x / zoom,
        y: 150 + Math.random() * 150 - panOffset.y / zoom,
      },
      inputs: def.inputs.map((p, i) => ({ ...p, id: `input-${i}` })),
      outputs: def.outputs.map((p, i) => ({ ...p, id: `output-${i}` })),
      config: { ...def.defaultConfig },
      status: 'idle',
    }
    setNodes(prev => {
      const updated = [...prev, newNode]
      onNodesChange?.(updated)
      return updated
    })
    setSelectedNodeId(newNode.id)
  }, [panOffset, zoom, onNodesChange])

  // Move a node
  const handleMoveNode = useCallback((id: string, x: number, y: number) => {
    setNodes(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, position: { x, y } } : n)
      onNodesChange?.(updated)
      return updated
    })
  }, [onNodesChange])

  // Delete a node and its connections
  const handleDeleteNode = useCallback((id: string) => {
    setNodes(prev => {
      const updated = prev.filter(n => n.id !== id)
      onNodesChange?.(updated)
      return updated
    })
    setConnections(prev => prev.filter(c => c.sourceNodeId !== id && c.targetNodeId !== id))
    if (selectedNodeId === id) setSelectedNodeId(null)
  }, [selectedNodeId, onNodesChange])

  // Update node config
  const handleConfigChange = useCallback((id: string, config: Record<string, any>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, config } : n))
  }, [])

  // Execute a node
  const handleExecute = useCallback(async (id: string) => {
    const node = nodes.find(n => n.id === id)
    if (!node) return

    setNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'running' as const } : n))

    try {
      const modeMap: Record<NodeType, string> = {
        'image-generator': 'image',
        'video-generator': 'video',
        'chat': 'chat',
        'audio-generator': 'audio',
        'upscale': 'upscale',
        'image-to-3d': 'image-to-3d',
        'brand-kit': 'brand-kit',
        'text': 'chat',
        'upload': 'image',
        'assistant': 'chat',
      }

      // Find connected input data
      const inputConnections = connections.filter(c => c.targetNodeId === id)
      let inputImage: string | undefined
      let inputText: string | undefined

      for (const conn of inputConnections) {
        const sourceNode = nodes.find(n => n.id === conn.sourceNodeId)
        if (sourceNode?.result?.url) inputImage = sourceNode.result.url
        if (sourceNode?.result?.text) inputText = sourceNode.result.text
      }

      const prompt = node.config.prompt || node.config.text || inputText || ''
      if (!prompt && !inputImage) {
        setNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'error' as const, error: 'Escribe un prompt primero' } : n))
        return
      }

      const endpointMap: Record<string, string> = {
        image: '/api/generate-image',
        video: '/api/generate-video',
        chat: '/api/chat',
        audio: '/api/generate-audio',
        upscale: '/api/upscale',
        'image-to-3d': '/api/image-to-3d',
        'brand-kit': '/api/brand-kit',
      }

      const mode = modeMap[node.type]
      const endpoint = endpointMap[mode]

      if (!endpoint) {
        setNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'error' as const, error: 'Tipo de nodo no soportado' } : n))
        return
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          mode,
          width: node.config.width,
          height: node.config.height,
          steps: node.config.steps,
          image: inputImage,
          scale: node.config.scale,
          spaceId,
        }),
      })

      const data = await response.json()

      if (data.success && data.data) {
        setNodes(prev => prev.map(n => n.id === id ? {
          ...n,
          status: 'completed' as const,
          result: {
            url: data.data.url,
            text: data.data.text,
          },
          error: undefined,
        } : n))
      } else {
        const errorMsg = data.error || 'Error al generar. Verifica que las API keys estén configuradas en Vercel.'
        setNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'error' as const, error: errorMsg } : n))
      }
    } catch (error) {
      console.error('Node execution error:', error)
      setNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'error' as const, error: 'Error de conexión con el servidor' } : n))
    }
  }, [nodes, connections, spaceId])

  // Port click - start or complete connection
  const handlePortClick = useCallback((nodeId: string, portId: string, portType: 'input' | 'output') => {
    if (portType === 'output') {
      setConnectingFrom({ nodeId, portId })
    }
  }, [])

  const handleConnectionComplete = useCallback((targetNodeId: string, targetPortId: string) => {
    if (!connectingFrom) return
    if (connectingFrom.nodeId === targetNodeId) return

    // Check if connection already exists
    const exists = connections.some(
      c => c.sourceNodeId === connectingFrom.nodeId && c.targetNodeId === targetNodeId
    )
    if (exists) {
      setConnectingFrom(null)
      return
    }

    const newConnection: NodeConnection = {
      id: `conn-${Date.now()}`,
      sourceNodeId: connectingFrom.nodeId,
      sourcePortId: connectingFrom.portId,
      targetNodeId,
      targetPortId,
    }

    setConnections(prev => [...prev, newConnection])
    setConnectingFrom(null)
  }, [connectingFrom, connections])

  // Canvas panning
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'ai-canvas-content') {
      if (connectingFrom) {
        setConnectingFrom(null)
        return
      }
      setSelectedNodeId(null)
      setIsPanning(true)
    }
  }, [connectingFrom])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (connectingFrom && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      setTempMousePos({
        x: (e.clientX - rect.left - panOffset.x) / zoom,
        y: (e.clientY - rect.top - panOffset.y) / zoom,
      })
    }

    if (isPanning) {
      setPanOffset(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }))
    }
  }, [isPanning, connectingFrom, zoom, panOffset])

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Zoom with scroll
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.05 : 0.05
    setZoom(prev => Math.max(0.25, Math.min(2, prev + delta)))
  }, [])

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(2, prev + 0.1))
  const handleZoomOut = () => setZoom(prev => Math.max(0.25, prev - 0.1))
  const handleZoomReset = () => { setZoom(1); setPanOffset({ x: 0, y: 0 }) }

  // Delete selected node with keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId && !(e.target as HTMLElement).closest('input, textarea')) {
          handleDeleteNode(selectedNodeId)
        }
      }
      if (e.key === 'Escape') {
        setConnectingFrom(null)
        setSelectedNodeId(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNodeId, handleDeleteNode])

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f]">
      <CanvasHeader
        spaceName={spaceName}
        spaceId={spaceId}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <ToolSidebar onAddNode={handleAddNode} />

        {/* Canvas area */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onWheel={handleWheel}
        >
          {/* Dot grid background */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
              backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
            }}
          />

          {/* Transformed canvas content */}
          <div
            id="ai-canvas-content"
            className="absolute inset-0"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {/* Connections layer */}
            <CanvasConnections
              connections={connections}
              nodes={nodes}
              tempConnection={connectingFrom && tempMousePos ? {
                sourceNodeId: connectingFrom.nodeId,
                sourcePortId: connectingFrom.portId,
                mouseX: tempMousePos.x,
                mouseY: tempMousePos.y,
              } : null}
            />

            {/* Nodes layer */}
            {nodes.map(node => (
              <AINode
                key={node.id}
                node={node}
                connections={connections}
                isSelected={selectedNodeId === node.id}
                isConnecting={!!connectingFrom}
                connectingFrom={connectingFrom?.nodeId === node.id ? connectingFrom.portId : null}
                onSelect={setSelectedNodeId}
                onDelete={handleDeleteNode}
                onMove={handleMoveNode}
                onConfigChange={handleConfigChange}
                onExecute={handleExecute}
                onPortClick={handlePortClick}
                onConnectionComplete={handleConnectionComplete}
              />
            ))}
          </div>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-7 h-7 text-white/20" />
                </div>
                <p className="text-sm text-white/30 mb-1">Arrastra herramientas del panel izquierdo</p>
                <p className="text-xs text-white/15">o haz clic en una herramienta para agregarla</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="h-8 bg-[#0e0e16] border-t border-white/5 flex items-center justify-between px-4">
        <button className="text-[10px] text-white/20 hover:text-white/40 transition-colors">
          Dar feedback
        </button>
        <span className="text-[10px] text-white/20">{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  )
}
