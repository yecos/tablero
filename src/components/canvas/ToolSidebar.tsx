'use client'

import { useState } from 'react'
import { NODE_DEFINITIONS, NodeType } from './types'
import { Search, Image, Film, MessageSquare, Music, ZoomIn, Box, Tag, Type, Upload, Bot, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const iconMap: Record<NodeType, any> = {
  'image-generator': Image,
  'video-generator': Film,
  'chat': MessageSquare,
  'audio-generator': Music,
  'upscale': ZoomIn,
  'image-to-3d': Box,
  'brand-kit': Tag,
  'text': Type,
  'upload': Upload,
  'assistant': Bot,
}

const categories = [
  { key: 'basic' as const, label: 'BÁSICOS', tools: ['text', 'image-generator', 'video-generator', 'assistant', 'upscale', 'chat', 'audio-generator', 'brand-kit', 'image-to-3d'] as NodeType[] },
  { key: 'content' as const, label: 'CONTENIDO', tools: ['upload'] as NodeType[] },
]

interface ToolSidebarProps {
  onAddNode: (type: NodeType) => void
}

export function ToolSidebar({ onAddNode }: ToolSidebarProps) {
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const filteredCategories = categories.map(cat => ({
    ...cat,
    tools: cat.tools.filter(t => {
      const def = NODE_DEFINITIONS[t]
      if (!search) return true
      return def.title.toLowerCase().includes(search.toLowerCase())
    }),
  })).filter(cat => cat.tools.length > 0)

  return (
    <div className="w-56 bg-[#12121a]/95 border-r border-white/5 flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-white/5">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar"
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
          />
        </div>
      </div>

      {/* Tool categories */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {filteredCategories.map(cat => (
          <div key={cat.key}>
            <button
              onClick={() => setCollapsed(prev => ({ ...prev, [cat.key]: !prev[cat.key] }))}
              className="flex items-center gap-1.5 w-full px-2 py-1.5 text-[10px] uppercase tracking-wider text-white/30 hover:text-white/50 transition-colors"
            >
              {collapsed[cat.key] ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {cat.label}
            </button>
            {!collapsed[cat.key] && (
              <div className="space-y-0.5 ml-1">
                {cat.tools.map(toolType => {
                  const def = NODE_DEFINITIONS[toolType]
                  const Icon = iconMap[toolType]
                  return (
                    <button
                      key={toolType}
                      onClick={() => onAddNode(toolType)}
                      className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all group"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                        style={{ backgroundColor: def.color + '20' }}
                      >
                        {Icon ? <Icon className="w-3.5 h-3.5" style={{ color: def.color }} /> : <span className="text-sm">{def.icon}</span>}
                      </div>
                      <span className="truncate">{def.title}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="p-2 border-t border-white/5 space-y-1">
        <button className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors">
          <Upload className="w-3.5 h-3.5" />
          Abrir
        </button>
      </div>
    </div>
  )
}
