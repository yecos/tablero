'use client'

import React from 'react'
import type { WorkflowNode } from '@/store/workflow-types'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface NumberInputNodeProps {
  node: WorkflowNode
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}

export function NumberInputNode({ node, onDataChange }: NumberInputNodeProps) {
  const value = (node.data.value as number) ?? 50
  const min = (node.data.min as number) ?? 0
  const max = (node.data.max as number) ?? 100
  const step = (node.data.step as number) ?? 1

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] uppercase tracking-wider text-slate-400">
            Value
          </Label>
          <Input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v)) onDataChange(node.id, { value: v })
            }}
            className="h-6 w-20 rounded-md bg-white/5 border-white/10 text-xs text-slate-200 text-right px-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={([v]) => onDataChange(node.id, { value: v })}
          className="py-1 [&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-sky-500 [&_[data-slot=slider-thumb]]:border-sky-500 [&_[data-slot=slider-thumb]]:bg-[#12121a]"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 flex flex-col gap-0.5">
          <Label className="text-[9px] text-slate-500">Min</Label>
          <Input
            type="number"
            value={min}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v)) onDataChange(node.id, { min: v })
            }}
            className="h-5 w-full rounded bg-white/5 border-white/10 text-[10px] text-slate-300 px-1.5 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <div className="flex-1 flex flex-col gap-0.5">
          <Label className="text-[9px] text-slate-500">Max</Label>
          <Input
            type="number"
            value={max}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v)) onDataChange(node.id, { max: v })
            }}
            className="h-5 w-full rounded bg-white/5 border-white/10 text-[10px] text-slate-300 px-1.5 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <div className="flex-1 flex flex-col gap-0.5">
          <Label className="text-[9px] text-slate-500">Step</Label>
          <Input
            type="number"
            value={step}
            min={0.01}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v) && v > 0) onDataChange(node.id, { step: v })
            }}
            className="h-5 w-full rounded bg-white/5 border-white/10 text-[10px] text-slate-300 px-1.5 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      </div>
    </div>
  )
}
