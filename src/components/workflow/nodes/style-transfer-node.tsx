'use client'

import React from 'react'
import { Paintbrush } from 'lucide-react'
import type { WorkflowNode } from '@/store/workflow-types'
import { ProviderSelector } from '@/components/ui/provider-selector'

interface StyleTransferNodeProps {
  node: WorkflowNode
  onDataChange: (id: string, data: Record<string, unknown>) => void
}

export function StyleTransferNode({ node, onDataChange }: StyleTransferNodeProps) {
  const stylePrompt = (node.data.stylePrompt as string) || ''

  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-center gap-2">
        <Paintbrush size={14} className="text-purple-400" />
        <span className="text-xs font-medium text-white/80">Style Transfer</span>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-white/50">Style Prompt</label>
        <input
          type="text"
          value={stylePrompt}
          onChange={(e) => onDataChange(node.id, { stylePrompt: e.target.value })}
          placeholder="e.g. Van Gogh, watercolor, cyberpunk..."
          className="w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-white/80 placeholder:text-white/25 focus:border-purple-500/50 focus:outline-none"
        />
      </div>
      <div className="text-[10px] text-white/40">
        Applies the specified artistic style to the input image.
      </div>
      {node.outputs?.output_2_image?.value ? (
        <div className="mt-1 rounded border border-white/10 bg-black/30 p-1">
          <div className="text-[9px] text-white/50">Styled image ready</div>
        </div>
      ) : null}
      <ProviderSelector category="style-transfer" compact />
    </div>
  )
}
