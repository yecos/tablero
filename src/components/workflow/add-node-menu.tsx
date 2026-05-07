'use client'

import React, { useEffect, useRef } from 'react'
import type { WorkflowNodeType } from '@/store/workflow-types'
import { NODE_DEFAULTS } from '@/store/workflow-types'
import {
  Type,
  ImageIcon,
  Pencil,
  Box,
  Palette,
  Monitor,
  FileText,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Node type config for the menu
// ---------------------------------------------------------------------------
const NODE_MENU_ITEMS: {
  type: WorkflowNodeType
  icon: React.ElementType
  label: string
  description: string
  category: 'input' | 'process' | 'output'
}[] = [
  // ── Input nodes ──
  {
    type: 'text-input',
    icon: FileText,
    label: 'Texto',
    description: 'Ingresar texto manualmente',
    category: 'input',
  },
  {
    type: 'image-input',
    icon: Upload,
    label: 'Imagen',
    description: 'Subir imagen o pegar URL',
    category: 'input',
  },
  // ── Process nodes ──
  {
    type: 'text-ai',
    icon: Type,
    label: 'AI Text',
    description: 'Generar texto con IA',
    category: 'process',
  },
  {
    type: 'image-gen',
    icon: ImageIcon,
    label: 'Image Gen',
    description: 'Generar imágenes desde prompts',
    category: 'process',
  },
  {
    type: 'image-edit',
    icon: Pencil,
    label: 'Image Edit',
    description: 'Editar y analizar imágenes',
    category: 'process',
  },
  {
    type: '3d-gen',
    icon: Box,
    label: '3D Gen',
    description: 'Convertir imágenes a 3D',
    category: 'process',
  },
  {
    type: 'brand-kit',
    icon: Palette,
    label: 'Brand Kit',
    description: 'Generar activos de marca',
    category: 'process',
  },
  // ── Output nodes ──
  {
    type: 'output',
    icon: Monitor,
    label: 'Output',
    description: 'Previsualizar resultados',
    category: 'output',
  },
]

const CATEGORY_LABELS: Record<string, string> = {
  input: 'Entrada',
  process: 'Proceso',
  output: 'Salida',
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface AddNodeMenuProps {
  x: number
  y: number
  onAddNode: (type: WorkflowNodeType) => void
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function AddNodeMenu({ x, y, onAddNode, onClose }: AddNodeMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  // Group items by category
  const categories = ['input', 'process', 'output'] as const

  return (
    <div
      ref={menuRef}
      className="absolute z-50 rounded-xl border border-white/10 bg-[#12121a] p-3 shadow-2xl shadow-black/50 backdrop-blur-md w-[280px] max-h-[420px] overflow-y-auto"
      style={{ left: x, top: y }}
    >
      {categories.map((category) => {
        const items = NODE_MENU_ITEMS.filter((i) => i.category === category)
        if (items.length === 0) return null
        return (
          <div key={category} className="mb-2 last:mb-0">
            <p className="mb-1.5 px-1 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
              {CATEGORY_LABELS[category]}
            </p>
            <div className="grid grid-cols-1 gap-0.5">
              {items.map(({ type, icon: Icon, label, description }) => {
                const defaults = NODE_DEFAULTS[type]
                return (
                  <button
                    key={type}
                    onClick={() => {
                      onAddNode(type)
                      onClose()
                    }}
                    className={cn(
                      'group flex items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-all',
                      'hover:bg-white/5 active:scale-[0.98]'
                    )}
                  >
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-md shrink-0"
                      style={{ backgroundColor: defaults.color + '22' }}
                    >
                      {React.createElement(Icon, { size: 14, style: { color: defaults.color } })}
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-white/90 block truncate">
                        {label}
                      </span>
                      <span className="text-[10px] text-white/35 block truncate">
                        {description}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
