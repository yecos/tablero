'use client'

import React from 'react'
import type { WorkflowNode } from '@/store/workflow-types'
import { Textarea } from '@/components/ui/textarea'

interface NoteNodeProps {
  node: WorkflowNode
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}

const NOTE_COLORS = [
  '#eab308', // yellow
  '#f97316', // orange
  '#ef4444', // red
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#3b82f6', // blue
  '#10b981', // green
  '#6b7280', // gray
]

export function NoteNode({ node, onDataChange }: NoteNodeProps) {
  const content = (node.data.content as string) || ''
  const noteColor = (node.data.color as string) || '#eab308'

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={content}
        onChange={(e) => onDataChange(node.id, { content: e.target.value })}
        placeholder="Write a note..."
        className="min-h-[60px] resize-y bg-transparent border-0 text-xs text-slate-300 placeholder:text-slate-600 focus-visible:ring-0 p-0"
        style={{ color: `${noteColor}cc` }}
        rows={3}
      />

      <div className="flex gap-1">
        {NOTE_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onDataChange(node.id, { color })}
            className={`h-3 w-3 rounded-full transition-transform hover:scale-125 ${
              noteColor === color ? 'ring-1 ring-white/50 scale-110' : ''
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  )
}
