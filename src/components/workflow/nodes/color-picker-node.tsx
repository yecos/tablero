'use client'

import React, { useCallback } from 'react'
import type { WorkflowNode } from '@/store/workflow-types'
import { Label } from '@/components/ui/label'

interface ColorPickerNodeProps {
  node: WorkflowNode
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e',
  '#000000', '#374151', '#6b7280', '#9ca3af', '#ffffff',
]

export function ColorPickerNode({ node, onDataChange }: ColorPickerNodeProps) {
  const color = (node.data.color as string) || '#8b5cf6'

  const handleColorChange = useCallback(
    (newColor: string) => {
      onDataChange(node.id, { color: newColor })
    },
    [node.id, onDataChange]
  )

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="h-9 w-9 cursor-pointer rounded-md border border-white/15 bg-transparent"
            style={{ padding: 0 }}
          />
        </div>
        <div className="flex-1 flex flex-col gap-0.5">
          <span className="text-xs font-mono text-slate-200">{color.toUpperCase()}</span>
          <div
            className="h-3 w-full rounded-full border border-white/10"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-slate-400">
          Presets
        </Label>
        <div className="grid grid-cols-5 gap-1">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset}
              onClick={() => handleColorChange(preset)}
              className={`h-5 w-5 rounded border transition-transform hover:scale-110 ${
                color.toLowerCase() === preset.toLowerCase()
                  ? 'border-white/60 scale-110'
                  : 'border-white/15'
              }`}
              style={{ backgroundColor: preset }}
              title={preset}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
