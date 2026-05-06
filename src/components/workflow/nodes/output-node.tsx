'use client'

import React from 'react'
import type { WorkflowNode, PortDataType, PortDataValue } from '@/store/workflow-types'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { LucideIcon } from 'lucide-react'
import {
  FileText,
  ImageIcon,
  Box,
  Palette,
  Layers,
  Inbox,
} from 'lucide-react'

interface OutputNodeProps {
  node: WorkflowNode
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}

const dataTypeConfig: Record<
  PortDataType,
  { icon: LucideIcon; label: string; color: string }
> = {
  text: { icon: FileText, label: 'Text', color: '#8b5cf6' },
  image: { icon: ImageIcon, label: 'Image', color: '#ec4899' },
  model3d: { icon: Box, label: '3D Model', color: '#06b6d4' },
  brandKit: { icon: Palette, label: 'Brand Kit', color: '#10b981' },
  imageLayers: { icon: Layers, label: 'Image Layers', color: '#f59e0b' },
  any: { icon: Inbox, label: 'Any', color: '#6366f1' },
}

function renderOutputContent(portValue: PortDataValue) {
  const { dataType, value } = portValue

  switch (dataType) {
    case 'text':
      return (
        <div className="rounded-md bg-white/5 border border-white/10 p-2">
          <p className="text-xs text-slate-300 whitespace-pre-wrap">
            {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          </p>
        </div>
      )

    case 'image':
      return (
        <div className="overflow-hidden rounded-md border border-white/10">
          {typeof value === 'string' && (value.startsWith('http') || value.startsWith('data:')) ? (
            <img
              src={value}
              alt="Output"
              className="w-full h-auto max-h-[160px] object-contain bg-black/20"
            />
          ) : (
            <div className="flex items-center justify-center p-4">
              <ImageIcon className="h-8 w-8 text-pink-500/40" />
            </div>
          )}
        </div>
      )

    case 'model3d':
      return (
        <div className="relative overflow-hidden rounded-md border border-white/10 bg-gradient-to-br from-cyan-500/10 to-transparent aspect-video flex items-center justify-center">
          <div className="flex flex-col items-center gap-1">
            <Box className="h-8 w-8 text-cyan-400/80" />
            <span className="text-[10px] text-cyan-400/80">3D Model</span>
          </div>
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />
          </div>
        </div>
      )

    case 'brandKit': {
      const bk = value as Record<string, unknown> | null | undefined
      return (
        <div className="rounded-md bg-white/5 border border-white/10 p-2 space-y-2">
          {Array.isArray(bk?.colors) && (bk.colors as string[]).length > 0 ? (
            <div>
              <span className="text-[10px] text-emerald-400/70">Colors</span>
              <div className="flex gap-1 mt-0.5">
                {(bk!.colors as string[]).map((c, i) => (
                  <div
                    key={i}
                    className="h-5 w-5 rounded border border-white/10"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          ) : null}
          {Array.isArray(bk?.fonts) && (bk.fonts as string[]).length > 0 ? (
            <div>
              <span className="text-[10px] text-emerald-400/70">Fonts</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {(bk!.fonts as string[]).map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex rounded bg-emerald-500/10 px-1 py-0.5 text-[9px] text-emerald-300"
                  >
                    {String(f)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {bk?.tagline ? (
            <div>
              <span className="text-[10px] text-emerald-400/70">Tagline</span>
              <p className="text-[10px] text-slate-300 italic mt-0.5">
                &ldquo;{String(bk.tagline)}&rdquo;
              </p>
            </div>
          ) : null}
          {(!bk || Object.keys(bk).length === 0) && (
            <span className="text-[10px] text-slate-500">No brand kit data</span>
          )}
        </div>
      )
    }

    case 'imageLayers': {
      const layers = value as Array<{ name: string; type: string }> | null | undefined
      return (
        <div className="rounded-md bg-white/5 border border-white/10 p-2">
          {layers && layers.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {layers.map((layer, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-white/5"
                >
                  <div className="h-2 w-2 rounded-sm bg-amber-500/60" />
                  <span className="text-[10px] text-slate-300">{layer.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-[10px] text-slate-500">No layer data</span>
          )}
        </div>
      )
    }

    default:
      return (
        <div className="rounded-md bg-white/5 border border-white/10 p-2">
          <p className="text-xs text-slate-400">
            {value !== undefined && value !== null
              ? String(value)
              : 'No data'}
          </p>
        </div>
      )
  }
}

export function OutputNode({ node }: OutputNodeProps) {
  // Find the input port and its connected value
  const inputPort = node.ports.find((p) => p.direction === 'input')
  const inputPortId = inputPort?.id
  const inputValue = inputPortId
    ? (node.outputs[inputPortId] as PortDataValue | undefined)
    : undefined

  // Detect the data type from the port or the value
  const detectedType: PortDataType = inputValue?.dataType || inputPort?.dataType || 'any'
  const config = dataTypeConfig[detectedType]
  const Icon = config.icon

  return (
    <div className="flex flex-col gap-2">
      {/* Data type indicator */}
      <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 border border-white/10">
        <Icon className="h-3 w-3" style={{ color: config.color }} />
        <span className="text-[10px] text-slate-400">
          {inputValue ? `Receiving: ${config.label}` : 'Waiting for input...'}
        </span>
        {inputValue && (
          <div
            className="ml-auto h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: config.color }}
          />
        )}
      </div>

      {/* Output content */}
      {inputValue ? (
        <ScrollArea className="max-h-[180px]">
          {renderOutputContent(inputValue)}
        </ScrollArea>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-white/10 bg-white/[0.02] py-6">
          <Inbox className="h-6 w-6 text-slate-600" />
          <span className="text-[10px] text-slate-500">
            Connect a node to preview output
          </span>
        </div>
      )}
    </div>
  )
}
