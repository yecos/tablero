'use client'

import React from 'react'
import type { WorkflowNode, MergeNodeData } from '@/store/workflow-types'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'

interface MergeNodeProps {
  node: WorkflowNode
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}

const MODE_OPTIONS: { value: MergeNodeData['mode']; label: string; desc: string }[] = [
  { value: 'concat', label: 'Concatenate', desc: 'Join text with newlines' },
  { value: 'array', label: 'Array', desc: 'Combine into array' },
  { value: 'first', label: 'First', desc: 'Take first non-empty' },
  { value: 'last', label: 'Last', desc: 'Take last non-empty' },
]

export function MergeNode({ node, onDataChange }: MergeNodeProps) {
  const mode = (node.data.mode as MergeNodeData['mode']) || 'concat'
  const mergedValue = node.outputs['output_3_any']?.value

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-slate-400">
          Merge Mode
        </Label>
        <Select
          value={mode}
          onValueChange={(v) => onDataChange(node.id, { mode: v as MergeNodeData['mode'] })}
        >
          <SelectTrigger className="h-7 w-full bg-white/5 border-white/10 text-xs text-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-white/10">
            {MODE_OPTIONS.map((m) => (
              <SelectItem key={m.value} value={m.value} className="text-xs text-slate-200 focus:bg-white/10">
                <div className="flex flex-col">
                  <span>{m.label}</span>
                  <span className="text-[9px] text-slate-500">{m.desc}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1 text-[9px] text-slate-500">
        <span className="rounded bg-teal-500/10 px-1 text-teal-400">1</span>
        <span>+</span>
        <span className="rounded bg-teal-500/10 px-1 text-teal-400">2</span>
        <span>+</span>
        <span className="rounded bg-teal-500/10 px-1 text-teal-400">3</span>
        <span>=</span>
        <span className="rounded bg-teal-500/20 px-1 text-teal-300">Merged</span>
      </div>

      {node.status === 'completed' && mergedValue !== undefined && (
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] uppercase tracking-wider text-slate-400">
            Result
          </Label>
          <ScrollArea className="max-h-[60px] rounded-md bg-white/5 p-2">
            <p className="text-xs text-slate-300 whitespace-pre-wrap">
              {typeof mergedValue === 'string' ? mergedValue : JSON.stringify(mergedValue, null, 2)}
            </p>
          </ScrollArea>
        </div>
      )}

      {node.status === 'idle' && (
        <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1.5">
          <span className="text-[10px] text-slate-500">Connect inputs to merge</span>
        </div>
      )}
    </div>
  )
}
