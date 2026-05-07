'use client'

import React from 'react'
import { PenTool } from 'lucide-react'
import type { WorkflowNode } from '@/store/workflow-types'

interface SvgVectorizeNodeProps {
  node: WorkflowNode
  isSelected: boolean
  onUpdate: (id: string, data: Record<string, unknown>) => void
}

export function SvgVectorizeNode({ node, isSelected: _isSelected, onUpdate: _onUpdate }: SvgVectorizeNodeProps) {
  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-center gap-2">
        <PenTool size={14} className="text-green-400" />
        <span className="text-xs font-medium text-white/80">SVG Vectorize</span>
      </div>
      <div className="text-[10px] text-white/40">
        Converts raster images into scalable SVG vector graphics. Best for logos, icons, and line art.
      </div>
      {node.outputs?.output_1_text?.value ? (
        <div className="mt-1 rounded border border-white/10 bg-black/30 p-1">
          <div className="text-[9px] text-white/50">SVG ready ({String(node.outputs.output_1_text.value).length} chars)</div>
        </div>
      ) : null}
    </div>
  )
}
