'use client'

import React from 'react'
import { Scissors } from 'lucide-react'
import type { WorkflowNode } from '@/store/workflow-types'

interface RemoveBgNodeProps {
  node: WorkflowNode
  onDataChange: (id: string, data: Record<string, unknown>) => void
}

export function RemoveBgNode({ node }: RemoveBgNodeProps) {
  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-center gap-2">
        <Scissors size={14} className="text-red-400" />
        <span className="text-xs font-medium text-white/80">Remove Background</span>
      </div>
      <div className="text-[10px] text-white/40">
        Automatically removes the background from the input image using AI. Supports PNG with transparency.
      </div>
      {node.outputs?.output_1_image?.value ? (
        <div className="mt-1 rounded border border-white/10 bg-black/30 p-1">
          <div className="text-[9px] text-white/50">Result ready</div>
        </div>
      ) : null}
    </div>
  )
}
