'use client'

import { useState, useCallback, useRef } from 'react'
import { CanvasNode, NODE_DEFINITIONS, NodeConnection } from './types'
import { Play, X, MoreHorizontal, Loader2, Check, AlertCircle, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AINodeProps {
  node: CanvasNode
  connections: NodeConnection[]
  isSelected: boolean
  isConnecting: boolean
  connectingFrom: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onMove: (id: string, x: number, y: number) => void
  onConfigChange: (id: string, config: Record<string, any>) => void
  onExecute: (id: string) => void
  onPortClick: (nodeId: string, portId: string, portType: 'input' | 'output') => void
  onConnectionComplete: (targetNodeId: string, targetPortId: string) => void
}

export function AINode({
  node,
  connections,
  isSelected,
  isConnecting,
  connectingFrom,
  onSelect,
  onDelete,
  onMove,
  onConfigChange,
  onExecute,
  onPortClick,
  onConnectionComplete,
}: AINodeProps) {
  const def = NODE_DEFINITIONS[node.type]
  const [isDragging, setIsDragging] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.port-handle') || (e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('textarea')) return
    e.stopPropagation()
    onSelect(node.id)
    setIsDragging(true)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }

    const handleMouseMove = (moveE: MouseEvent) => {
      const canvas = document.getElementById('ai-canvas-content')
      if (!canvas) return
      const canvasRect = canvas.getBoundingClientRect()
      const scale = parseFloat(canvas.style.transform?.match(/scale\(([^)]+)\)/)?.[1] || '1')
      const x = (moveE.clientX - canvasRect.left - dragOffset.current.x) / scale
      const y = (moveE.clientY - canvasRect.top - dragOffset.current.y) / scale
      onMove(node.id, Math.round(x), Math.round(y))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [node.id, onSelect, onMove])

  const isImageGen = node.type === 'image-generator'
  const isVideoGen = node.type === 'video-generator'
  const isChat = node.type === 'chat' || node.type === 'assistant'
  const hasPrompt = isImageGen || isVideoGen || isChat || node.type === 'audio-generator' || node.type === 'brand-kit'

  return (
    <div
      className={cn(
        'absolute min-w-[280px] max-w-[320px] rounded-xl border bg-[#1a1a2e]/95 backdrop-blur-sm shadow-2xl transition-shadow duration-200',
        isSelected ? 'border-blue-500/50 shadow-blue-500/10 shadow-lg' : 'border-white/10',
        isDragging && 'cursor-grabbing',
        node.status === 'running' && 'ring-1 ring-blue-500/30',
      )}
      style={{ left: node.position.x, top: node.position.y }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-white/5 rounded-t-xl"
        style={{ backgroundColor: def.color + '15' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{def.icon}</span>
          <span className="text-xs font-medium text-white/80 truncate max-w-[160px]">{node.title}</span>
          {node.status === 'running' && <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />}
          {node.status === 'completed' && <Check className="w-3 h-3 text-emerald-400" />}
          {node.status === 'error' && <AlertCircle className="w-3 h-3 text-red-400" />}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings) }}
            className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(node.id) }}
            className="p-1 rounded hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Input ports */}
      {def.inputs.length > 0 && (
        <div className="px-3 pt-2 space-y-1.5">
          {def.inputs.map((input, i) => {
            const portId = `input-${i}`
            const isConnected = connections.some(c => c.targetNodeId === node.id && c.targetPortId === portId)
            return (
              <div key={portId} className="flex items-center gap-2">
                <div
                  className={cn(
                    'port-handle w-3 h-3 rounded-full border-2 cursor-pointer transition-all z-10 -ml-[22px]',
                    isConnected
                      ? 'bg-blue-400 border-blue-400'
                      : 'bg-transparent border-white/30 hover:border-blue-400 hover:bg-blue-400/30',
                    isConnecting && !isConnected && 'border-blue-400 animate-pulse'
                  )}
                  onMouseUp={() => isConnecting && onConnectionComplete(node.id, portId)}
                  onClick={(e) => { e.stopPropagation(); onPortClick(node.id, portId, 'input') }}
                />
                <span className="text-[10px] text-white/40 uppercase tracking-wider">{input.name}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Body - Prompt/Config area */}
      <div className="px-3 py-2 space-y-2">
        {hasPrompt && (
          <textarea
            value={node.config.prompt || ''}
            onChange={(e) => { onConfigChange(node.id, { ...node.config, prompt: e.target.value }) }}
            placeholder={isImageGen ? 'Imagen que quieres generar...' : isVideoGen ? 'Describe el video que quieres generar...' : 'Escribe tu mensaje...'}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 resize-none h-16"
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {node.type === 'text' && (
          <textarea
            value={node.config.text || ''}
            onChange={(e) => onConfigChange(node.id, { ...node.config, text: e.target.value })}
            placeholder="Escribe texto..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 resize-none h-16"
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Aspect ratio / extra controls */}
        {isImageGen && (
          <div className="flex items-center gap-1.5">
            {['Auto', '1:1', '16:9', '9:16', '4:3'].map(aspect => (
              <button
                key={aspect}
                onClick={(e) => { e.stopPropagation(); onConfigChange(node.id, { ...node.config, aspect }) }}
                className={cn(
                  'px-2 py-0.5 text-[10px] rounded transition-colors',
                  node.config.aspect === aspect
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-white/30 hover:text-white/60 border border-transparent'
                )}
              >
                {aspect}
              </button>
            ))}
          </div>
        )}

        {/* Execute button */}
        {hasPrompt && (
          <button
            onClick={(e) => { e.stopPropagation(); onExecute(node.id) }}
            disabled={node.status === 'running' || (!node.config.prompt && node.type !== 'text')}
            className="w-full flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white/70 hover:text-white text-xs font-medium py-1.5 rounded-lg border border-white/5 hover:border-white/15 transition-all disabled:cursor-not-allowed"
          >
            {node.status === 'running' ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Generando...</>
            ) : (
              <><Play className="w-3 h-3" /> Generar</>
            )}
          </button>
        )}

        {/* Error message */}
        {node.status === 'error' && node.error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-[10px] text-red-400 leading-relaxed">
            {node.error}
          </div>
        )}

        {/* Result preview */}
        {node.result && (
          <div className="rounded-lg overflow-hidden border border-white/10">
            {node.result.url && (
              <img src={node.result.url} alt="Result" className="w-full h-auto max-h-[200px] object-cover" />
            )}
            {node.result.text && (
              <div className="p-2 text-[11px] text-white/60 bg-white/5 max-h-[120px] overflow-y-auto">
                {node.result.text}
              </div>
            )}
          </div>
        )}

        {/* Settings panel */}
        {showSettings && (
          <div className="border border-white/5 rounded-lg p-2 space-y-1.5 bg-white/[0.02]">
            <div className="text-[10px] text-white/30 uppercase tracking-wider">Configuración</div>
            {(node.type === 'image-generator' || node.type === 'upscale') && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40">Ancho</span>
                  <input
                    type="number"
                    value={node.config.width || 1024}
                    onChange={(e) => onConfigChange(node.id, { ...node.config, width: parseInt(e.target.value) || 1024 })}
                    className="w-16 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white text-right"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40">Alto</span>
                  <input
                    type="number"
                    value={node.config.height || 1024}
                    onChange={(e) => onConfigChange(node.id, { ...node.config, height: parseInt(e.target.value) || 1024 })}
                    className="w-16 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white text-right"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </>
            )}
            {(isImageGen) && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40">Steps</span>
                <input
                  type="number"
                  value={node.config.steps || 30}
                  onChange={(e) => onConfigChange(node.id, { ...node.config, steps: parseInt(e.target.value) || 30 })}
                  className="w-16 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white text-right"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            {node.type === 'upscale' && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40">Scale</span>
                <select
                  value={node.config.scale || 2}
                  onChange={(e) => onConfigChange(node.id, { ...node.config, scale: parseInt(e.target.value) })}
                  className="w-16 bg-white/5 border border-white/10 rounded px-1 py-0.5 text-[10px] text-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value={2}>2x</option>
                  <option value={4}>4x</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Output ports */}
      {def.outputs.length > 0 && (
        <div className="px-3 pb-2 space-y-1.5">
          {def.outputs.map((output, i) => {
            const portId = `output-${i}`
            const isConnected = connections.some(c => c.sourceNodeId === node.id && c.sourcePortId === portId)
            return (
              <div key={portId} className="flex items-center justify-end gap-2">
                <span className="text-[10px] text-white/40 uppercase tracking-wider">{output.name}</span>
                <div
                  className={cn(
                    'port-handle w-3 h-3 rounded-full border-2 cursor-pointer transition-all z-10 -mr-[22px]',
                    isConnected
                      ? 'bg-blue-400 border-blue-400'
                      : 'bg-transparent border-white/30 hover:border-blue-400 hover:bg-blue-400/30',
                    connectingFrom === portId && 'border-blue-400 bg-blue-400 animate-pulse'
                  )}
                  onClick={(e) => { e.stopPropagation(); onPortClick(node.id, portId, 'output') }}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
