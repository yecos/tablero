'use client'

import React, { useCallback } from 'react'
import type {
  WorkflowNode as WorkflowNodeType,
  WorkflowNodeType as WNodeType,
  PortDataType,
} from '@/store/workflow-types'
import { NODE_DEFAULTS } from '@/store/workflow-types'
import { TextAINode } from './text-ai-node'
import { ImageGenNode } from './image-gen-node'
import { ImageEditNode } from './image-edit-node'
import { ThreedGenNode } from './threed-gen-node'
import { BrandKitNode } from './brand-kit-node'
import { OutputNode } from './output-node'
import { TextInputNode } from './text-input-node'
import { ImageInputNode } from './image-input-node'
import { ColorPickerNode } from './color-picker-node'
import { NumberInputNode } from './number-input-node'
import { ImageTransformNode } from './image-transform-node'
import { TextTemplateNode } from './text-template-node'
import { ConditionNode } from './condition-node'
import { MergeNode } from './merge-node'
import { NoteNode } from './note-node'
import { ExportNode } from './export-node'
import {
  FileText,
  ImageIcon,
  Box,
  Palette,
  Pencil,
  Eye,
  X,
  Play,
  Loader2,
  AlertCircle,
  Type,
  Upload,
  Pipette,
  Hash,
  Wand2,
  FileCode,
  GitBranch,
  Merge,
  StickyNote,
  Download,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// --- Port color map ---
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

// --- Node icon map ---
const NODE_ICONS: Record<WNodeType, LucideIcon> = {
  'text-ai': Wand2,
  'image-gen': ImageIcon,
  'image-edit': Pencil,
  '3d-gen': Box,
  'brand-kit': Palette,
  'output': Eye,
  'text-input': Type,
  'image-input': Upload,
  'color-picker': Pipette,
  'number-input': Hash,
  'image-transform': ImageIcon,
  'text-template': FileCode,
  'condition': GitBranch,
  'merge': Merge,
  'note': StickyNote,
  'export': Download,
}

// --- Status config ---
const STATUS_CONFIG = {
  idle: { dotClass: 'bg-slate-500', label: 'Idle' },
  running: {
    dotClass: 'bg-purple-500 animate-pulse',
    label: 'Running',
  },
  completed: { dotClass: 'bg-emerald-500', label: 'Done' },
  error: { dotClass: 'bg-red-500', label: 'Error' },
} as const

// --- Props ---
export interface WorkflowNodeProps {
  node: WorkflowNodeType
  isSelected: boolean
  isConnecting: boolean
  connectingPortId: string | null
  onMouseDown: (e: React.MouseEvent, nodeId: string) => void
  onPortClick: (nodeId: string, portId: string, direction: 'input' | 'output') => void
  onRunNode: (nodeId: string) => void
  onDeleteNode: (nodeId: string) => void
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}

// --- Port component ---
function PortCircle({
  portId,
  portName,
  dataType,
  direction,
  nodeId,
  isConnecting,
  connectingPortId,
  onPortClick,
}: {
  portId: string
  portName: string
  dataType: PortDataType
  direction: 'input' | 'output'
  nodeId: string
  isConnecting: boolean
  connectingPortId: string | null
  onPortClick: (nodeId: string, portId: string, direction: 'input' | 'output') => void
}) {
  const color = PORT_COLORS[dataType]
  const isConnectingFromThis = connectingPortId === portId
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onPortClick(nodeId, portId, direction)
    },
    [nodeId, portId, direction, onPortClick]
  )

  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 group/port z-10 ${
        direction === 'input' ? '-left-[6px] flex-row' : '-right-[6px] flex-row-reverse'
      }`}
    >
      {/* Port circle */}
      <button
        onClick={handleClick}
        className={`
          relative h-3 w-3 rounded-full border-2 transition-all duration-150 cursor-pointer
          ${isConnectingFromThis ? 'scale-150 ring-2 ring-offset-1 ring-offset-[#12121a]' : ''}
          ${isConnecting && !isConnectingFromThis ? 'scale-125 hover:scale-150' : ''}
        `}
        style={{
          borderColor: color,
          backgroundColor: isConnectingFromThis ? color : '#12121a',
          ...(isConnectingFromThis ? { ringColor: color } : {}),
          boxShadow: isConnectingFromThis ? `0 0 8px ${color}60` : undefined,
        }}
        title={`${portName} (${dataType})`}
      >
        {/* Inner dot */}
        <div
          className="absolute inset-[2px] rounded-full"
          style={{
            backgroundColor: isConnectingFromThis ? '#fff' : color,
          }}
        />
      </button>

      {/* Port label */}
      <span
        className={`text-[9px] text-slate-400 whitespace-nowrap pointer-events-none select-none
          ${direction === 'input' ? '' : ''}
          opacity-0 group-hover/port:opacity-100 transition-opacity
        `}
      >
        {portName}
      </span>
    </div>
  )
}

// --- Node inner content renderer ---
function NodeContent({
  node,
  onDataChange,
}: {
  node: WorkflowNodeType
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}) {
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
    case 'output':
      return <OutputNode node={node} onDataChange={onDataChange} />
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

// --- Main component ---
export function WorkflowNodeComponent({
  node,
  isSelected,
  isConnecting,
  connectingPortId,
  onMouseDown,
  onPortClick,
  onRunNode,
  onDeleteNode,
  onDataChange,
}: WorkflowNodeProps) {
  const defaults = NODE_DEFAULTS[node.type]
  const color = defaults.color
  const Icon = NODE_ICONS[node.type]
  const statusConfig = STATUS_CONFIG[node.status]
  const isNote = node.type === 'note'

  const inputPorts = node.ports.filter((p) => p.direction === 'input')
  const outputPorts = node.ports.filter((p) => p.direction === 'output')

  // Evenly space ports along the card height
  const headerHeight = 36 // approximate header height
  const contentPadding = 32 // top/bottom padding for content area
  const footerHeight = isNote ? 0 : 36 // approximate footer height
  const totalPortArea = node.height - headerHeight - footerHeight - contentPadding

  const getPortY = (index: number, total: number) => {
    if (total <= 1) return headerHeight + contentPadding / 2 + totalPortArea / 2
    const step = totalPortArea / (total + 1)
    return headerHeight + contentPadding / 2 + step * (index + 1)
  }

  const noteColor = (node.data.color as string) || color

  return (
    <div
      className="absolute select-none"
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        zIndex: isSelected ? 20 : 10,
      }}
    >
      {/* Port circles (rendered outside the card for edge positioning) */}
      {/* Input ports */}
      {inputPorts.map((port, i) => (
        <div
          key={port.id}
          className="absolute"
          style={{ top: getPortY(i, inputPorts.length), left: 0, right: 0 }}
        >
          <PortCircle
            portId={port.id}
            portName={port.name}
            dataType={port.dataType}
            direction="input"
            nodeId={node.id}
            isConnecting={isConnecting}
            connectingPortId={connectingPortId}
            onPortClick={onPortClick}
          />
        </div>
      ))}

      {/* Output ports */}
      {outputPorts.map((port, i) => (
        <div
          key={port.id}
          className="absolute"
          style={{ top: getPortY(i, outputPorts.length), left: 0, right: 0 }}
        >
          <PortCircle
            portId={port.id}
            portName={port.name}
            dataType={port.dataType}
            direction="output"
            nodeId={node.id}
            isConnecting={isConnecting}
            connectingPortId={connectingPortId}
            onPortClick={onPortClick}
          />
        </div>
      ))}

      {/* Card */}
      <div
        className={`
          relative rounded-xl overflow-hidden
          ${isNote ? 'bg-[#1a1a1f]/95 border-dashed' : 'bg-[#12121a]/90 backdrop-blur-sm'}
          border transition-all duration-200
          ${isSelected ? 'ring-2 border-white/20' : isNote ? 'border-dashed' : 'border-white/10 hover:border-white/15'}
          ${node.status === 'running' ? 'shadow-lg' : 'shadow-md'}
        `}
        style={{
          borderTop: `2px solid ${isNote ? noteColor : color}`,
          borderColor: isNote && !isSelected ? `${noteColor}30` : undefined,
          boxShadow: isSelected
            ? `0 0 20px ${(isNote ? noteColor : color)}20, 0 4px 20px rgba(0,0,0,0.4)`
            : node.status === 'running'
              ? `0 0 30px ${(isNote ? noteColor : color)}15, 0 4px 16px rgba(0,0,0,0.3)`
              : `0 2px 8px rgba(0,0,0,0.3)`,
          ...(isSelected ? { '--tw-ring-color': `${isNote ? noteColor : color}60` } as React.CSSProperties : {}),
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-3 py-2 cursor-grab active:cursor-grabbing border-b border-white/5"
          onMouseDown={(e) => onMouseDown(e, node.id)}
        >
          <Icon
            className="h-3.5 w-3.5 shrink-0"
            style={{ color: isNote ? noteColor : color }}
          />
          <span className="text-xs font-medium text-slate-200 truncate flex-1">
            {node.title}
          </span>

          {/* Status indicator */}
          <div className="flex items-center gap-1 shrink-0">
            <div className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`} />
          </div>

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeleteNode(node.id)
            }}
            className="h-4 w-4 rounded flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            title="Delete node"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        {/* Body */}
        <div className="px-3 py-2">
          <NodeContent node={node} onDataChange={onDataChange} />
        </div>

        {/* Error message */}
        {node.status === 'error' && node.errorMessage && (
          <div className="mx-3 mb-2 flex items-start gap-1.5 rounded-md bg-red-500/10 border border-red-500/20 px-2 py-1.5">
            <AlertCircle className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
            <span className="text-[10px] text-red-300 break-words">{node.errorMessage}</span>
          </div>
        )}

        {/* Footer - Run button (hidden for note nodes) */}
        {!isNote && (
          <div className="px-3 pb-2 pt-1 border-t border-white/5">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRunNode(node.id)
              }}
              disabled={node.status === 'running'}
              className={`
                w-full h-7 rounded-md flex items-center justify-center gap-1.5
                text-[11px] font-medium transition-all duration-150
                ${
                  node.status === 'running'
                    ? 'bg-purple-500/10 text-purple-300 cursor-wait'
                    : node.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }
              `}
              style={
                node.status !== 'running' && node.status !== 'completed'
                  ? { borderColor: `${color}30` }
                  : undefined
              }
            >
              {node.status === 'running' ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Running...
                </>
              ) : node.status === 'completed' ? (
                <>
                  <Play className="h-3 w-3" />
                  Re-run
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" style={{ color }} />
                  Run
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
