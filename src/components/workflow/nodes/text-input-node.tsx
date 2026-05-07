'use client'

import React from 'react'
import type { WorkflowNode } from '@/store/workflow-types'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface TextInputNodeProps {
  node: WorkflowNode
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}

export function TextInputNode({ node, onDataChange }: TextInputNodeProps) {
  const text = (node.data.text as string) || ''

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-slate-400">
          Text Content
        </Label>
        <Textarea
          value={text}
          onChange={(e) => onDataChange(node.id, { text: e.target.value })}
          placeholder="Type your text here..."
          className="min-h-[80px] resize-y bg-white/5 border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus-visible:border-slate-400/50 focus-visible:ring-slate-400/20"
          rows={4}
        />
      </div>

      {text && (
        <div className="flex items-center gap-1.5 rounded-md bg-slate-500/10 px-2 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          <span className="text-[10px] text-slate-400">
            {text.length} chars
          </span>
        </div>
      )}
    </div>
  )
}
