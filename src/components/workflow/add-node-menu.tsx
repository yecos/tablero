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
}[] = [
  {
    type: 'text-ai',
    icon: Type,
    label: 'Text AI',
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
    type: 'output',
    icon: Monitor,
    label: 'Output',
    description: 'Preview results',
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
      className="absolute z-50 rounded-xl border border-white/10 bg-[#12121a] p-3 shadow-2xl shadow-black/50 backdrop-blur-md"
      style={{ left: x, top: y }}
    >
      <p className="mb-2 px-1 text-xs font-medium text-white/50 uppercase tracking-wider">
        Add Node
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {NODE_MENU_ITEMS.map(({ type, icon: Icon, label, description }) => {
          const defaults = NODE_DEFAULTS[type]
          return (
            <button
              key={type}
              onClick={() => {
                onAddNode(type)
                onClose()
              }}
              className={cn(
                'group flex flex-col items-start gap-1 rounded-lg p-2.5 text-left transition-all',
                'hover:bg-white/5 active:scale-[0.97]'
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-md"
                  style={{ backgroundColor: defaults.color + '22' }}
                >
                  <Icon
                    size={14}
                    style={{ color: defaults.color }}
                  />
                </span>
                <span className="text-sm font-medium text-white/90">
                  {label}
                </span>
              </div>
              <span className="text-[10px] leading-tight text-white/40 pl-9">
                {description}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
