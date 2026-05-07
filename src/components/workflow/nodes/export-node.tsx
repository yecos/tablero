'use client'

import React from 'react'
import type { WorkflowNode, ExportNodeData } from '@/store/workflow-types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download } from 'lucide-react'

interface ExportNodeProps {
  node: WorkflowNode
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}

const FORMAT_OPTIONS: ExportNodeData['format'][] = ['png', 'txt', 'json', 'svg']

export function ExportNode({ node, onDataChange }: ExportNodeProps) {
  const format = (node.data.format as ExportNodeData['format']) || 'png'
  const fileName = (node.data.fileName as string) || 'export'

  const inputPort = node.ports.find((p) => p.direction === 'input')
  const hasData = !!inputPort && Object.keys(node.outputs).length > 0

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-slate-400">
          Format
        </Label>
        <Select
          value={format}
          onValueChange={(v) => onDataChange(node.id, { format: v as ExportNodeData['format'] })}
        >
          <SelectTrigger className="h-7 w-full bg-white/5 border-white/10 text-xs text-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e] border-white/10">
            {FORMAT_OPTIONS.map((f) => (
              <SelectItem key={f} value={f} className="text-xs text-slate-200 focus:bg-white/10 uppercase">
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-slate-400">
          File Name
        </Label>
        <Input
          value={fileName}
          onChange={(e) => onDataChange(node.id, { fileName: e.target.value })}
          placeholder="export"
          className="h-7 bg-white/5 border-white/10 text-xs text-slate-200 placeholder:text-slate-600"
        />
      </div>

      {node.status === 'completed' && (
        <button
          onClick={() => {
            // Trigger download
            const inputValue = Object.values(node.outputs)[0]
            if (!inputValue) return

            const value = inputValue.value
            let dataUrl: string
            let mimeType: string

            if (format === 'png' && typeof value === 'string' && (value.startsWith('data:image') || value.startsWith('http'))) {
              // For images, open in new tab or download
              const a = document.createElement('a')
              a.href = value
              a.download = `${fileName}.${format === 'png' ? 'png' : 'jpg'}`
              a.click()
              return
            }

            if (format === 'json') {
              const jsonStr = JSON.stringify(value, null, 2)
              dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(jsonStr)}`
              mimeType = 'application/json'
            } else if (format === 'svg' && typeof value === 'string') {
              dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(value)}`
              mimeType = 'image/svg+xml'
            } else {
              const textStr = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
              dataUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(textStr)}`
              mimeType = 'text/plain'
            }

            const a = document.createElement('a')
            a.href = dataUrl
            a.download = `${fileName}.${format}`
            a.click()
          }}
          className="flex items-center justify-center gap-1.5 rounded-md bg-purple-500/15 border border-purple-500/20 px-3 py-1.5 text-xs text-purple-300 hover:bg-purple-500/25 transition-colors"
        >
          <Download size={12} />
          Download {format.toUpperCase()}
        </button>
      )}

      {!hasData && node.status === 'idle' && (
        <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1.5">
          <Download className="h-3 w-3 text-purple-500/40" />
          <span className="text-[10px] text-slate-500">Connect data to export</span>
        </div>
      )}
    </div>
  )
}
