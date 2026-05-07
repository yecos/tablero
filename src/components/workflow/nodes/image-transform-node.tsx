'use client'

import React from 'react'
import type { WorkflowNode, ImageTransformNodeData } from '@/store/workflow-types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ImageTransformNodeProps {
  node: WorkflowNode
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}

const MODE_OPTIONS: ImageTransformNodeData['mode'][] = ['resize', 'filter', 'adjust']
const FILTER_OPTIONS: ImageTransformNodeData['filter'][] = ['none', 'grayscale', 'sepia', 'invert', 'blur', 'sharpen']

export function ImageTransformNode({ node, onDataChange }: ImageTransformNodeProps) {
  const mode = (node.data.mode as ImageTransformNodeData['mode']) || 'resize'
  const width = (node.data.width as number) || 512
  const height = (node.data.height as number) || 512
  const filter = (node.data.filter as ImageTransformNodeData['filter']) || 'none'
  const brightness = (node.data.brightness as number) ?? 100
  const contrast = (node.data.contrast as number) ?? 100
  const saturation = (node.data.saturation as number) ?? 100

  const outputImage = node.outputs['output_1_image']?.value as string | undefined

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-slate-400">
          Mode
        </Label>
        <Select
          value={mode}
          onValueChange={(v) => onDataChange(node.id, { mode: v as ImageTransformNodeData['mode'] })}
        >
          <SelectTrigger className="h-7 w-full bg-white/5 border-white/10 text-xs text-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-white/10">
            {MODE_OPTIONS.map((m) => (
              <SelectItem key={m} value={m} className="text-xs text-slate-200 focus:bg-white/10 capitalize">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {mode === 'resize' && (
        <div className="flex items-center gap-2">
          <div className="flex-1 flex flex-col gap-0.5">
            <Label className="text-[9px] text-slate-500">Width</Label>
            <Input
              type="number"
              value={width}
              min={1}
              max={4096}
              onChange={(e) => {
                const v = parseInt(e.target.value)
                if (!isNaN(v)) onDataChange(node.id, { width: v })
              }}
              className="h-6 rounded bg-white/5 border-white/10 text-[10px] text-slate-300 px-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
          <span className="text-slate-500 mt-3">×</span>
          <div className="flex-1 flex flex-col gap-0.5">
            <Label className="text-[9px] text-slate-500">Height</Label>
            <Input
              type="number"
              value={height}
              min={1}
              max={4096}
              onChange={(e) => {
                const v = parseInt(e.target.value)
                if (!isNaN(v)) onDataChange(node.id, { height: v })
              }}
              className="h-6 rounded bg-white/5 border-white/10 text-[10px] text-slate-300 px-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>
      )}

      {mode === 'filter' && (
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] uppercase tracking-wider text-slate-400">
            Filter
          </Label>
          <Select
            value={filter}
            onValueChange={(v) => onDataChange(node.id, { filter: v as ImageTransformNodeData['filter'] })}
          >
            <SelectTrigger className="h-7 w-full bg-white/5 border-white/10 text-xs text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a2e] border-white/10">
              {FILTER_OPTIONS.map((f) => (
                <SelectItem key={f} value={f} className="text-xs text-slate-200 focus:bg-white/10 capitalize">
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {mode === 'adjust' && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <Label className="text-[9px] text-slate-500">Brightness</Label>
              <span className="text-[9px] font-mono text-slate-400">{brightness}%</span>
            </div>
            <Slider
              value={[brightness]}
              min={0}
              max={200}
              step={1}
              onValueChange={([v]) => onDataChange(node.id, { brightness: v })}
              className="py-0.5 [&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-fuchsia-500 [&_[data-slot=slider-thumb]]:border-fuchsia-500 [&_[data-slot=slider-thumb]]:bg-[#12121a]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <Label className="text-[9px] text-slate-500">Contrast</Label>
              <span className="text-[9px] font-mono text-slate-400">{contrast}%</span>
            </div>
            <Slider
              value={[contrast]}
              min={0}
              max={200}
              step={1}
              onValueChange={([v]) => onDataChange(node.id, { contrast: v })}
              className="py-0.5 [&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-fuchsia-500 [&_[data-slot=slider-thumb]]:border-fuchsia-500 [&_[data-slot=slider-thumb]]:bg-[#12121a]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <Label className="text-[9px] text-slate-500">Saturation</Label>
              <span className="text-[9px] font-mono text-slate-400">{saturation}%</span>
            </div>
            <Slider
              value={[saturation]}
              min={0}
              max={200}
              step={1}
              onValueChange={([v]) => onDataChange(node.id, { saturation: v })}
              className="py-0.5 [&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-fuchsia-500 [&_[data-slot=slider-thumb]]:border-fuchsia-500 [&_[data-slot=slider-thumb]]:bg-[#12121a]"
            />
          </div>
        </div>
      )}

      {node.status === 'completed' && outputImage && (
        <div className="overflow-hidden rounded-md border border-white/10">
          <img
            src={outputImage}
            alt="Transformed"
            className="w-full h-auto max-h-[80px] object-contain bg-black/20"
          />
        </div>
      )}

      {node.status === 'idle' && (
        <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1.5">
          <span className="text-[10px] text-slate-500">Connect an image to transform</span>
        </div>
      )}
    </div>
  )
}
