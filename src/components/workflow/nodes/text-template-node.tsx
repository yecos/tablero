'use client'

import React from 'react'
import type { WorkflowNode } from '@/store/workflow-types'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

interface TextTemplateNodeProps {
  node: WorkflowNode
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}

export function TextTemplateNode({ node, onDataChange }: TextTemplateNodeProps) {
  const template = (node.data.template as string) || ''
  const outputText = node.outputs['output_3_text']?.value as string | undefined

  // Detect variables in template: {{1}}, {{2}}, {{3}}
  const variables: string[] = []
  const varRegex = /\{\{(\d+)\}\}/g
  let match
  while ((match = varRegex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1])
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-slate-400">
          Template
        </Label>
        <Textarea
          value={template}
          onChange={(e) => onDataChange(node.id, { template: e.target.value })}
          placeholder="Use {{1}}, {{2}}, {{3}} as variables..."
          className="min-h-[48px] resize-y bg-white/5 border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
          rows={3}
        />
      </div>

      {variables.length > 0 && (
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] uppercase tracking-wider text-slate-400">
            Variables Detected
          </Label>
          <div className="flex flex-wrap gap-1">
            {variables.map((v) => (
              <span
                key={v}
                className="inline-flex rounded bg-violet-500/15 px-1.5 py-0.5 text-[10px] text-violet-300 border border-violet-500/20"
              >
                {`{{${v}}}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {node.status === 'completed' && outputText && (
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] uppercase tracking-wider text-slate-400">
            Result
          </Label>
          <ScrollArea className="max-h-[60px] rounded-md bg-white/5 p-2">
            <p className="text-xs text-slate-300 whitespace-pre-wrap">{outputText}</p>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
