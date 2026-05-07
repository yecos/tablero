'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  ImageIcon,
  Maximize2,
  Expand,
  ImageMinus,
  PenTool,
  Box,
  Video,
  AudioLines,
  Music,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ToolItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
}

interface ToolCategory {
  label: string
  items: ToolItem[]
}

const categories: ToolCategory[] = [
  {
    label: 'IMAGEN',
    items: [
      { id: 'image-gen', label: 'Generador IA', icon: <Sparkles className="h-4 w-4" />, href: '/app/image-gen' },
      { id: 'upscaler', label: 'Upscaler', icon: <Maximize2 className="h-4 w-4" />, href: '/app/upscaler' },
      { id: 'extend', label: 'Extender', icon: <Expand className="h-4 w-4" />, href: '/app/extend' },
      { id: 'bg-remove', label: 'Fondo', icon: <ImageMinus className="h-4 w-4" />, href: '/app/image-gen' },
      { id: 'sketch', label: 'Sketch a Imagen', icon: <PenTool className="h-4 w-4" />, href: '/app/sketch' },
    ],
  },
  {
    label: 'VIDEO',
    items: [
      { id: 'video-gen', label: 'Generador de Video', icon: <Video className="h-4 w-4" />, href: '/app/image-gen' },
    ],
  },
  {
    label: 'AUDIO',
    items: [
      { id: 'tts', label: 'Texto a Voz', icon: <AudioLines className="h-4 w-4" />, href: '/app/image-gen' },
      { id: 'music', label: 'Música', icon: <Music className="h-4 w-4" />, href: '/app/image-gen' },
    ],
  },
  {
    label: '3D',
    items: [
      { id: '3d', label: 'Imagen a 3D', icon: <Box className="h-4 w-4" />, href: '/app/3d' },
    ],
  },
  {
    label: 'ESPACIOS',
    items: [
      { id: 'spaces', label: 'Spaces', icon: <LayoutGrid className="h-4 w-4" />, href: '/app/spaces' },
    ],
  },
]

export function WorkspaceSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex flex-col border-r border-white/10 bg-[#0d0d14]/80 backdrop-blur-xl transition-all duration-300 ease-in-out h-full relative',
          collapsed ? 'w-[68px]' : 'w-[280px]'
        )}
      >
        {/* Logo area */}
        <div className="flex items-center h-14 px-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center">
              <ImageIcon className="h-4 w-4 text-white" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">
                Tablero
              </span>
            )}
          </div>
        </div>

        {/* Tool categories */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin">
          {categories.map((category) => (
            <div key={category.label}>
              {!collapsed && (
                <div className="px-3 mb-2">
                  <span className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">
                    {category.label}
                  </span>
                </div>
              )}
              <div className="space-y-0.5">
                {category.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  const linkContent = (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group',
                        isActive
                          ? 'bg-gradient-to-r from-[#8b5cf6]/20 to-[#06b6d4]/10 text-white border border-[#8b5cf6]/30'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      )}
                    >
                      <span
                        className={cn(
                          'shrink-0 transition-colors',
                          isActive ? 'text-[#8b5cf6]' : 'text-white/40 group-hover:text-white/70'
                        )}
                      >
                        {item.icon}
                      </span>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {isActive && !collapsed && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#8b5cf6]" />
                      )}
                    </Link>
                  )

                  if (collapsed) {
                    return (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                          {linkContent}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-[#1a1a2e] border-white/10 text-white">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return linkContent
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-white/10 p-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-white/40 hover:text-white hover:bg-white/5"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span className="ml-2 text-xs">Colapsar</span>}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
