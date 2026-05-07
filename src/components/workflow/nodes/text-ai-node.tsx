'use client'

import React from 'react'
import type { WorkflowNode } from '@/store/workflow-types'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ProviderSelector } from '@/components/ui/provider-selector'

interface TextAINodeProps {
  node: WorkflowNode
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}

export function TextAINode({ node, onDataChange }: TextAINodeProps) {
  const prompt = (node.data.prompt as string) || ''
  const systemPrompt = (node.data.systemPrompt as string) || ''
  const temperature = (node.data.temperature as number) ?? 0.7
  const outputText = node.outputs['output_1_text']?.value as string | undefined

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-slate-400">
          Prompt
        </Label>
        <Textarea
          value={prompt}
          onChange={(e) => onDataChange(node.id, { prompt: e.target.value })}
          placeholder="Enter your prompt..."
          className="min-h-[48px] resize-none bg-white/5 border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus-visible:border-purple-500/50 focus-visible:ring-purple-500/20"
          rows={2}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-slate-400">
          System Prompt
        </Label>
        <Textarea
          value={systemPrompt}
          onChange={(e) => onDataChange(node.id, { systemPrompt: e.target.value })}
          placeholder="System instructions..."
          className="min-h-[32px] resize-none bg-white/5 border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus-visible:border-purple-500/50 focus-visible:ring-purple-500/20"
          rows={1}
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] uppercase tracking-wider text-slate-400">
            Temperature
          </Label>
          <span className="text-[10px] font-mono text-slate-400">
            {temperature.toFixed(2)}
          </span>
        </div>
        <Slider
          value={[temperature]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={([v]) => onDataChange(node.id, { temperature: v })}
          className="py-1 [&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-purple-500 [&_[data-slot=slider-thumb]]:border-purple-500 [&_[data-slot=slider-thumb]]:bg-[#12121a]"
        />
      </div>

      {node.status === 'completed' && outputText && (
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] uppercase tracking-wider text-slate-400">
            Output
          </Label>
          <ScrollArea className="max-h-[80px] rounded-md bg-white/5 p-2">
            <p className="text-xs text-slate-300 whitespace-pre-wrap">{outputText}</p>
          </ScrollArea>
        </div>
      )}

      {node.status === 'completed' && !outputText && (
        <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-emerald-400">Completed</span>
        </div>
      )}

      <ProviderSelector category="text" compact />
    </div>
  )
}
