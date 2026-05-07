'use client'

import React, { useCallback, useRef, useState } from 'react'
import type { WorkflowNode } from '@/store/workflow-types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ImageIcon, Upload, Link, X, CheckCircle2 } from 'lucide-react'

interface ImageInputNodeProps {
  node: WorkflowNode
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}

export function ImageInputNode({ node, onDataChange }: ImageInputNodeProps) {
  const imageUrl = (node.data.imageUrl as string) || ''
  const imageBase64 = (node.data.imageBase64 as string) || ''
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload')

  const hasImage = imageUrl.trim().length > 0 || imageBase64.trim().length > 0
  const previewSrc = imageBase64 || imageUrl

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        onDataChange(node.id, { imageBase64: result, imageUrl: '' })
      }
      reader.readAsDataURL(file)
    },
    [node.id, onDataChange]
  )

  const handleUrlChange = useCallback(
    (url: string) => {
      onDataChange(node.id, { imageUrl: url, imageBase64: '' })
    },
    [node.id, onDataChange]
  )

  const handleClear = useCallback(() => {
    onDataChange(node.id, { imageUrl: '', imageBase64: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [node.id, onDataChange])

  return (
    <div className="flex flex-col gap-2">
      {/* Mode toggle */}
      <div className="flex gap-1">
        <button
          onClick={() => setInputMode('upload')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
            inputMode === 'upload'
              ? 'bg-pink-500/20 text-pink-400'
              : 'bg-white/5 text-slate-500 hover:text-slate-400'
          }`}
        >
          <Upload className="h-3 w-3" />
          Subir
        </button>
        <button
          onClick={() => setInputMode('url')}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
            inputMode === 'url'
              ? 'bg-pink-500/20 text-pink-400'
              : 'bg-white/5 text-slate-500 hover:text-slate-400'
          }`}
        >
          <Link className="h-3 w-3" />
          URL
        </button>
      </div>

      {/* Upload mode */}
      {inputMode === 'upload' && !hasImage && (
        <div className="flex flex-col gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/15 transition-all py-4 cursor-pointer"
          >
            <Upload className="h-5 w-5 text-pink-400/50" />
            <span className="text-[10px] text-slate-400">Haz clic para subir imagen</span>
            <span className="text-[9px] text-slate-500">PNG, JPG, WEBP (máx 2MB)</span>
          </button>
        </div>
      )}

      {/* URL mode */}
      {inputMode === 'url' && !hasImage && (
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] uppercase tracking-wider text-slate-400">
            URL de imagen
          </Label>
          <Input
            value={imageUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
            className="h-7 bg-white/5 border-white/10 text-xs text-slate-200 placeholder:text-slate-500 focus-visible:border-pink-500/50 focus-visible:ring-pink-500/20"
          />
        </div>
      )}

      {/* Preview */}
      {hasImage && (
        <div className="flex flex-col gap-1.5">
          <div className="relative overflow-hidden rounded-md border border-white/10 bg-black/20">
            <img
              src={previewSrc}
              alt="Imagen ingresada"
              className="w-full h-auto max-h-[140px] object-contain"
            />
            <button
              onClick={handleClear}
              className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 hover:bg-red-500/80 transition-colors"
              title="Eliminar imagen"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-pink-400" />
            <span className="text-[10px] text-pink-400">Imagen lista para enviar</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasImage && inputMode === 'upload' && (
        <div className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-2">
          <ImageIcon className="h-3 w-3 text-pink-400/40" />
          <span className="text-[10px] text-slate-500">Sube una imagen o usa una URL</span>
        </div>
      )}
    </div>
  )
}
