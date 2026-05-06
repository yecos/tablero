'use client'

import React from 'react'
import type { WorkflowNode, ImageGenNodeData } from '@/store/workflow-types'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ImageGenNodeProps {
  node: WorkflowNode
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}

const SIZE_OPTIONS: ImageGenNodeData['size'][] = [
  '1024x1024',
  '1344x768',
  '768x1344',
  '1152x864',
  '864x1152',
]

const STYLE_OPTIONS: ImageGenNodeData['style'][] = ['vivid', 'natural']

export function ImageGenNode({ node, onDataChange }: ImageGenNodeProps) {
  const prompt = (node.data.prompt as string) || ''
  const size = (node.data.size as ImageGenNodeData['size']) || '1024x1024'
  const style = (node.data.style as ImageGenNodeData['style']) || 'vivid'
  const imageUrl = node.outputs['output_1_image']?.value as string | undefined

  // Check if there's a connected prompt input
  const hasPromptInput = node.ports.some(
    (p) => p.direction === 'input' && p.dataType === 'text' && p.name === 'Prompt'
  )

  return (
    <div className="flex flex-col gap-2">
      {!hasPromptInput && (
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] uppercase tracking-wider text-slate-400">
            Prompt
          </Label>
          <Textarea
            value={prompt}
            onChange={(e) => onDataChange(node.id, { prompt: e.target.value })}
            placeholder="Describe the image to generate..."
            className="min-h-[48px] resize-none bg-white/5 border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus-visible:border-pink-500/50 focus-visible:ring-pink-500/20"
            rows={2}
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-slate-400">
          Size
        </Label>
        <Select
          value={size}
          onValueChange={(v) =>
            onDataChange(node.id, { size: v as ImageGenNodeData['size'] })
          }
        >
          <SelectTrigger className="h-7 w-full bg-white/5 border-white/10 text-xs text-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-white/10">
            {SIZE_OPTIONS.map((s) => (
              <SelectItem key={s} value={s} className="text-xs text-slate-200 focus:bg-white/10 focus:text-slate-100">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-slate-400">
          Style
        </Label>
        <Select
          value={style}
          onValueChange={(v) =>
            onDataChange(node.id, { style: v as ImageGenNodeData['style'] })
          }
        >
          <SelectTrigger className="h-7 w-full bg-white/5 border-white/10 text-xs text-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-white/10">
            {STYLE_OPTIONS.map((s) => (
              <SelectItem key={s} value={s} className="text-xs text-slate-200 focus:bg-white/10 focus:text-slate-100 capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {node.status === 'completed' && imageUrl && (
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] uppercase tracking-wider text-slate-400">
            Preview
          </Label>
          <div className="overflow-hidden rounded-md border border-white/10">
            <img
              src={imageUrl}
              alt="Generated"
              className="w-full h-auto max-h-[140px] object-contain bg-black/20"
            />
          </div>
        </div>
      )}

      {node.status === 'completed' && !imageUrl && (
        <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-emerald-400">Image generated</span>
        </div>
      )}
    </div>
  )
}
