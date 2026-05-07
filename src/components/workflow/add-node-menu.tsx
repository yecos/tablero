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
  Upload,
  Pipette,
  Hash,
  Wand2,
  FileCode,
  GitBranch,
  Merge,
  StickyNote,
  Download,
  Scissors,
  Paintbrush,
  PenTool,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Node categories with items
// ---------------------------------------------------------------------------
interface NodeMenuItem {
  type: WorkflowNodeType
  icon: React.ElementType
  label: string
  description: string
}

interface NodeCategory {
  id: string
  label: string
  items: NodeMenuItem[]
}

const NODE_CATEGORIES: NodeCategory[] = [
  {
    id: 'input',
    label: 'Inputs',
    items: [
      {
        type: 'text-input',
        icon: Type,
        label: 'Text Input',
        description: 'Type text directly',
      },
      {
        type: 'image-input',
        icon: Upload,
        label: 'Image Input',
        description: 'Upload or paste image',
      },
      {
        type: 'color-picker',
        icon: Pipette,
        label: 'Color Picker',
        description: 'Pick a color value',
      },
      {
        type: 'number-input',
        icon: Hash,
        label: 'Number Input',
        description: 'Set a numeric value',
      },
    ],
  },
  {
    id: 'ai',
    label: 'AI Generation',
    items: [
      {
        type: 'text-ai',
        icon: Wand2,
        label: 'AI Text',
        description: 'Generate text with AI',
      },
      {
        type: 'image-gen',
        icon: ImageIcon,
        label: 'Image Gen',
        description: 'Generate images from prompts',
      },
      {
        type: 'image-edit',
        icon: Pencil,
        label: 'Image Edit',
        description: 'Edit & decompose images',
      },
      {
        type: '3d-gen',
        icon: Box,
        label: '3D Gen',
        description: 'Convert images to 3D',
      },
      {
        type: 'brand-kit',
        icon: Palette,
        label: 'Brand Kit',
        description: 'Generate brand assets',
      },
      {
        type: 'remove-bg',
        icon: Scissors,
        label: 'Remove BG',
        description: 'Remove image background',
      },
      {
        type: 'style-transfer',
        icon: Paintbrush,
        label: 'Style Transfer',
        description: 'Apply artistic style',
      },
      {
        type: 'svg-vectorize',
        icon: PenTool,
        label: 'SVG Vectorize',
        description: 'Convert raster to SVG',
      },
    ],
  },
  {
    id: 'transform',
    label: 'Transform',
    items: [
      {
        type: 'image-transform',
        icon: Monitor,
        label: 'Image Transform',
        description: 'Resize, filter, adjust',
      },
      {
        type: 'text-template',
        icon: FileCode,
        label: 'Text Template',
        description: 'Template with variables',
      },
    ],
  },
  {
    id: 'logic',
    label: 'Logic',
    items: [
      {
        type: 'condition',
        icon: GitBranch,
        label: 'Condition',
        description: 'If/else branching',
      },
      {
        type: 'merge',
        icon: Merge,
        label: 'Merge',
        description: 'Combine multiple inputs',
      },
    ],
  },
  {
    id: 'output',
    label: 'Output',
    items: [
      {
        type: 'output',
        icon: Monitor,
        label: 'Output',
        description: 'Preview results',
      },
      {
        type: 'export',
        icon: Download,
        label: 'Export',
        description: 'Download results',
      },
      {
        type: 'note',
        icon: StickyNote,
        label: 'Note',
        description: 'Add a comment',
      },
    ],
  },
]

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

  return (
    <div
      ref={menuRef}
      className="absolute z-50 rounded-xl border border-white/10 bg-[#12121a] shadow-2xl shadow-black/50 backdrop-blur-md overflow-hidden"
      style={{ left: x, top: y, maxHeight: '70vh' }}
    >
      <div className="overflow-y-auto max-h-[70vh] p-2">
        {NODE_CATEGORIES.map((category) => (
          <div key={category.id} className="mb-2 last:mb-0">
            <p className="mb-1 px-2 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
              {category.label}
            </p>
            <div className="grid grid-cols-2 gap-0.5">
              {category.items.map(({ type, icon: Icon, label, description }) => {
                const defaults = NODE_DEFAULTS[type]
                return (
                  <button
                    key={type}
                    onClick={() => {
                      onAddNode(type)
                      onClose()
                    }}
                    className={cn(
                      'group flex items-start gap-2 rounded-lg p-2 text-left transition-all',
                      'hover:bg-white/5 active:scale-[0.97]'
                    )}
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md mt-0.5"
                      style={{ backgroundColor: defaults.color + '22' }}
                    >
                      {React.createElement(Icon, { size: 12, style: { color: defaults.color } })}
                    </span>
                    <div className="min-w-0">
                      <span className="text-[11px] font-medium text-white/90 block truncate">
                        {label}
                      </span>
                      <span className="text-[9px] leading-tight text-white/35 block">
                        {description}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
