'use client'

import React from 'react'
import type { WorkflowNode, ConditionNodeData } from '@/store/workflow-types'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ConditionNodeProps {
  node: WorkflowNode
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}

const OPERATOR_OPTIONS: { value: ConditionNodeData['operator']; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'is_not_empty', label: 'Is Not Empty' },
]

export function ConditionNode({ node, onDataChange }: ConditionNodeProps) {
  const operator = (node.data.operator as ConditionNodeData['operator']) || 'equals'

  // Check the result from execution
  const trueOutput = node.outputs['output_2_any']
  const falseOutput = node.outputs['output_3_any']
  const resultIsTrue = trueOutput !== undefined
  const resultIsFalse = falseOutput !== undefined
  const hasResult = node.status === 'completed' && (resultIsTrue || resultIsFalse)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-slate-400">
          Condition
        </Label>
        <Select
          value={operator}
          onValueChange={(v) => onDataChange(node.id, { operator: v as ConditionNodeData['operator'] })}
        >
          <SelectTrigger className="h-7 w-full bg-white/5 border-white/10 text-xs text-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-white/10">
            {OPERATOR_OPTIONS.map((op) => (
              <SelectItem key={op.value} value={op.value} className="text-xs text-slate-200 focus:bg-white/10">
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 text-[10px]">
        <span className="text-slate-500">Value</span>
        <span className="text-orange-400 font-mono">{operator.replace('_', ' ')}</span>
        <span className="text-slate-500">Compare</span>
      </div>

      {hasResult && (
        <div className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 ${
          resultIsTrue ? 'bg-emerald-500/10' : 'bg-red-500/10'
        }`}>
          <div className={`h-2 w-2 rounded-full ${resultIsTrue ? 'bg-emerald-400' : 'bg-red-400'}`} />
          <span className={`text-[10px] ${resultIsTrue ? 'text-emerald-400' : 'text-red-400'}`}>
            {resultIsTrue ? 'Condition is TRUE' : 'Condition is FALSE'}
          </span>
        </div>
      )}

      {node.status === 'idle' && (
        <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1.5">
          <span className="text-[10px] text-slate-500">Connect Value & Compare inputs</span>
        </div>
      )}
    </div>
  )
}
