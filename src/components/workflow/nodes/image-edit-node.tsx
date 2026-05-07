'use client'

import React from 'react'
import type { WorkflowNode, ImageEditNodeData } from '@/store/workflow-types'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Layers, ScanSearch } from 'lucide-react'

interface ImageEditNodeProps {
  node: WorkflowNode
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}

const MODE_OPTIONS: ImageEditNodeData['mode'][] = ['analyze', 'split']

export function ImageEditNode({ node, onDataChange }: ImageEditNodeProps) {
  const mode = (node.data.mode as ImageEditNodeData['mode']) || 'analyze'
  const outputValue = node.outputs['output_1_imageLayers']?.value
  const layers = Array.isArray(outputValue)
    ? (outputValue as Array<{ name: string; type: string }>)
    : undefined
  const analysisResult = (typeof outputValue === 'object' && outputValue !== null && !Array.isArray(outputValue))
    ? (outputValue as Record<string, unknown>)
    : undefined

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-slate-400">
          Mode
        </Label>
        <Select
          value={mode}
          onValueChange={(v) =>
            onDataChange(node.id, { mode: v as ImageEditNodeData['mode'] })
          }
        >
          <SelectTrigger className="h-7 w-full bg-white/5 border-white/10 text-xs text-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-white/10">
            {MODE_OPTIONS.map((m) => (
              <SelectItem key={m} value={m} className="text-xs text-slate-200 focus:bg-white/10 focus:text-slate-100 capitalize">
                <div className="flex items-center gap-1.5">
                  {m === 'analyze' ? (
                    <ScanSearch className="h-3 w-3" />
                  ) : (
                    <Layers className="h-3 w-3" />
                  )}
                  {m}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {mode === 'analyze' && node.status === 'completed' && (analysisResult || layers) && (
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] uppercase tracking-wider text-slate-400">
            Analysis
          </Label>
          <ScrollArea className="max-h-[80px] rounded-md bg-white/5 p-2">
            <div className="text-xs text-slate-300 space-y-1">
              {analysisResult && typeof analysisResult === 'object' ? (
                Object.entries(analysisResult).map(([key, value]) => (
                  <div key={key} className="flex gap-1">
                    <span className="text-amber-400/80">{key}:</span>
                    <span className="text-slate-400">{String(value)}</span>
                  </div>
                ))
              ) : layers && layers.length > 0 ? (
                layers.map((layer, i) => (
                  <div key={i} className="flex gap-1">
                    <span className="text-amber-400/80">{layer.name}:</span>
                    <span className="text-slate-400">{layer.type}</span>
                  </div>
                ))
              ) : (
                <span className="text-slate-500">No analysis data</span>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {mode === 'split' && node.status === 'completed' && layers && layers.length > 0 && (
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] uppercase tracking-wider text-slate-400">
            Detected Layers
          </Label>
          <ScrollArea className="max-h-[80px] rounded-md bg-white/5">
            <div className="flex flex-col gap-0.5 p-1.5">
              {layers.map((layer, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded px-1.5 py-0.5 hover:bg-white/5"
                >
                  <div className="h-2 w-2 rounded-sm bg-amber-500/60" />
                  <span className="text-[10px] text-slate-300">{layer.name}</span>
                  {layer.type && (
                    <span className="text-[9px] text-slate-500 ml-auto">{layer.type}</span>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {node.status === 'idle' && (
        <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1.5">
          {mode === 'analyze' ? (
            <ScanSearch className="h-3 w-3 text-amber-500/60" />
          ) : (
            <Layers className="h-3 w-3 text-amber-500/60" />
          )}
          <span className="text-[10px] text-slate-500">
            {mode === 'analyze'
              ? 'Connect an image to analyze'
              : 'Connect an image to split into layers'}
          </span>
        </div>
      )}
    </div>
  )
}
