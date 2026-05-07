'use client'

import React from 'react'
import type { WorkflowNode } from '@/store/workflow-types'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Palette, Type, Quote } from 'lucide-react'
import { ProviderSelector } from '@/components/ui/provider-selector'

interface BrandKitNodeProps {
  node: WorkflowNode
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}

interface BrandKitResult {
  colors?: string[]
  fonts?: string[]
  tagline?: string
  [key: string]: unknown
}

export function BrandKitNode({ node, onDataChange }: BrandKitNodeProps) {
  const prompt = (node.data.prompt as string) || ''
  const industry = (node.data.industry as string) || ''
  const brandKitData = node.outputs['output_1_brandKit']?.value as
    | BrandKitResult
    | undefined

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-slate-400">
          Prompt
        </Label>
        <Textarea
          value={prompt}
          onChange={(e) => onDataChange(node.id, { prompt: e.target.value })}
          placeholder="Describe the brand..."
          className="min-h-[40px] resize-none bg-white/5 border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
          rows={2}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-slate-400">
          Industry
        </Label>
        <Input
          value={industry}
          onChange={(e) => onDataChange(node.id, { industry: e.target.value })}
          placeholder="e.g. Tech, Fashion, Food..."
          className="h-7 bg-white/5 border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
        />
      </div>

      {/* Brand kit results */}
      {node.status === 'completed' && brandKitData && (
        <ScrollArea className="max-h-[120px]">
          <div className="flex flex-col gap-2">
            {/* Color swatches */}
            {brandKitData.colors && brandKitData.colors.length > 0 && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Palette className="h-3 w-3 text-emerald-500/60" />
                  <Label className="text-[10px] uppercase tracking-wider text-slate-400">
                    Colors
                  </Label>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {brandKitData.colors.map((color, i) => (
                    <div key={i} className="group relative">
                      <div
                        className="h-6 w-6 rounded-md border border-white/10 transition-transform hover:scale-110 cursor-pointer"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fonts */}
            {brandKitData.fonts && brandKitData.fonts.length > 0 && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Type className="h-3 w-3 text-emerald-500/60" />
                  <Label className="text-[10px] uppercase tracking-wider text-slate-400">
                    Fonts
                  </Label>
                </div>
                <div className="flex flex-wrap gap-1">
                  {brandKitData.fonts.map((font, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-300"
                    >
                      {font}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tagline */}
            {brandKitData.tagline && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Quote className="h-3 w-3 text-emerald-500/60" />
                  <Label className="text-[10px] uppercase tracking-wider text-slate-400">
                    Tagline
                  </Label>
                </div>
                <p className="text-xs text-slate-300 italic">
                  &ldquo;{brandKitData.tagline}&rdquo;
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      {node.status === 'completed' && !brandKitData && (
        <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-emerald-400">Brand kit generated</span>
        </div>
      )}

      <ProviderSelector category="text" compact />
    </div>
  )
}
