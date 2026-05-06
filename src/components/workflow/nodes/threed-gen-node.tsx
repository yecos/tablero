'use client'

import React from 'react'
import type { WorkflowNode } from '@/store/workflow-types'
import { Label } from '@/components/ui/label'
import { Box, Loader2, ImageIcon } from 'lucide-react'

interface ThreedGenNodeProps {
  node: WorkflowNode
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}

export function ThreedGenNode({ node }: ThreedGenNodeProps) {
  const inputImage = node.ports.find(
    (p) => p.direction === 'input' && p.dataType === 'image'
  )
  const modelUrl = node.outputs['output_1_model3d']?.value as string | undefined
  const isRunning = node.status === 'running'

  return (
    <div className="flex flex-col gap-2">
      {/* Input image status */}
      <div className="flex flex-col gap-1">
        <Label className="text-[10px] uppercase tracking-wider text-slate-400">
          Input Image
        </Label>
        <div className="flex items-center gap-2 rounded-md bg-white/5 px-2 py-1.5 border border-white/10">
          <ImageIcon className="h-3.5 w-3.5 text-cyan-500/60" />
          <span className="text-[10px] text-slate-400">
            {inputImage
              ? 'Connect an image to convert to 3D'
              : 'Image input required'}
          </span>
        </div>
      </div>

      {/* Generation state */}
      {isRunning && (
        <div className="flex flex-col items-center gap-2 rounded-md bg-cyan-500/5 border border-cyan-500/20 px-3 py-4">
          <div className="relative">
            <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
            <Box className="h-3 w-3 text-cyan-300 absolute top-1.5 left-1.5" />
          </div>
          <span className="text-[10px] text-cyan-400">Generating 3D model...</span>
          <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      )}

      {/* 3D preview when completed */}
      {node.status === 'completed' && modelUrl && (
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] uppercase tracking-wider text-slate-400">
            3D Model
          </Label>
          <div className="relative overflow-hidden rounded-md border border-white/10 bg-gradient-to-br from-cyan-500/10 to-transparent aspect-square flex items-center justify-center">
            <div className="flex flex-col items-center gap-1.5">
              <Box className="h-8 w-8 text-cyan-400/80" />
              <span className="text-[10px] text-cyan-400/80">3D Model Ready</span>
              <span className="text-[9px] text-slate-500">Drag to rotate</span>
            </div>
            {/* Decorative grid */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }} />
            </div>
          </div>
        </div>
      )}

      {node.status === 'completed' && !modelUrl && (
        <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-emerald-400">3D model generated</span>
        </div>
      )}

      {node.status === 'idle' && !isRunning && (
        <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-2">
          <Box className="h-3.5 w-3.5 text-cyan-500/40" />
          <span className="text-[10px] text-slate-500">
            Run to generate a 3D model from input image
          </span>
        </div>
      )}
    </div>
  )
}
