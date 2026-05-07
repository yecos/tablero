'use client'

import React, { useCallback } from 'react'
import type { WorkflowNode } from '@/store/workflow-types'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FileText, CheckCircle2 } from 'lucide-react'

interface TextInputNodeProps {
  node: WorkflowNode
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}

export function TextInputNode({ node, onDataChange }: TextInputNodeProps) {
  const text = (node.data.text as string) || ''
  const hasContent = text.trim().length > 0

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-slate-400">
          Ingresar texto
        </Label>
        <Textarea
          value={text}
          onChange={(e) => onDataChange(node.id, { text: e.target.value })}
          placeholder="Escribe o pega tu texto aquí..."
          className="min-h-[80px] resize-none bg-white/5 border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus-visible:border-purple-400/50 focus-visible:ring-purple-400/20"
          rows={4}
        />
      </div>

      {hasContent && (
        <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1">
          <CheckCircle2 className="h-3 w-3 text-purple-400" />
          <span className="text-[10px] text-purple-400">{text.length} caracteres listos</span>
        </div>
      )}

      {!hasContent && (
        <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1.5">
          <FileText className="h-3 w-3 text-purple-400/40" />
          <span className="text-[10px] text-slate-500">Escribe texto para enviar a otros nodos</span>
        </div>
      )}
    </div>
  )
}
