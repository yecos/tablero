'use client'

import React, { useCallback, useRef } from 'react'
import type { WorkflowNode } from '@/store/workflow-types'
import { Label } from '@/components/ui/label'
import { Upload, ImageIcon, X } from 'lucide-react'

interface ImageInputNodeProps {
  node: WorkflowNode
  onDataChange: (nodeId: string, data: Record<string, unknown>) => void
}

export function ImageInputNode({ node, onDataChange }: ImageInputNodeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageBase64 = (node.data.imageBase64 as string) || ''
  const fileName = (node.data.fileName as string) || ''

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image too large. Please select an image under 10MB.')
        return
      }

      const reader = new FileReader()
      reader.onload = (ev) => {
        const result = ev.target?.result as string
        onDataChange(node.id, {
          imageBase64: result,
          fileName: file.name,
        })
      }
      reader.readAsDataURL(file)
    },
    [node.id, onDataChange]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (!file) continue

          const reader = new FileReader()
          reader.onload = (ev) => {
            const result = ev.target?.result as string
            onDataChange(node.id, {
              imageBase64: result,
              fileName: 'pasted-image',
            })
          }
          reader.readAsDataURL(file)
          break
        }
      }
    },
    [node.id, onDataChange]
  )

  const handleClear = useCallback(() => {
    onDataChange(node.id, { imageBase64: '', fileName: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [node.id, onDataChange])

  const handleUrlInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onDataChange(node.id, {
        imageBase64: e.target.value,
        fileName: 'url-image',
      })
    },
    [node.id, onDataChange]
  )

  return (
    <div className="flex flex-col gap-2" onPaste={handlePaste}>
      {imageBase64 ? (
        <div className="flex flex-col gap-1.5">
          <div className="relative overflow-hidden rounded-md border border-white/10">
            <img
              src={imageBase64}
              alt={fileName || 'Uploaded image'}
              className="w-full h-auto max-h-[120px] object-contain bg-black/20"
            />
            <button
              onClick={handleClear}
              className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white/80 hover:bg-red-500/80 transition-colors"
              title="Remove image"
            >
              <X size={10} />
            </button>
          </div>
          {fileName && (
            <span className="text-[9px] text-slate-500 truncate" title={fileName}>
              {fileName}
            </span>
          )}
        </div>
      ) : (
        <div
          className="flex flex-col items-center gap-2 rounded-md border border-dashed border-white/15 bg-white/[0.02] py-4 cursor-pointer hover:bg-white/[0.04] hover:border-white/20 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            e.currentTarget.classList.add('border-rose-500/50', 'bg-rose-500/5')
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('border-rose-500/50', 'bg-rose-500/5')
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.currentTarget.classList.remove('border-rose-500/50', 'bg-rose-500/5')
            const file = e.dataTransfer.files[0]
            if (file && file.type.startsWith('image/')) {
              const reader = new FileReader()
              reader.onload = (ev) => {
                onDataChange(node.id, {
                  imageBase64: ev.target?.result as string,
                  fileName: file.name,
                })
              }
              reader.readAsDataURL(file)
            }
          }}
        >
          <Upload className="h-5 w-5 text-rose-400/50" />
          <div className="text-center">
            <p className="text-[10px] text-slate-400">Drop image, click, or paste</p>
            <p className="text-[9px] text-slate-600 mt-0.5">PNG, JPG, WebP, GIF</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {!imageBase64 && (
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] uppercase tracking-wider text-slate-400">
            Or paste image URL
          </Label>
          <input
            type="text"
            placeholder="https://..."
            onChange={handleUrlInput}
            className="h-7 w-full rounded-md bg-white/5 border border-white/10 px-2 text-xs text-slate-200 placeholder:text-slate-600 focus-visible:border-rose-500/50 focus-visible:ring-rose-500/20 focus-visible:outline-none"
          />
        </div>
      )}
    </div>
  )
}
