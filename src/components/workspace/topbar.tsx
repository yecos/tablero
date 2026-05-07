'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  ZoomIn,
  ZoomOut,
  Share2,
  Maximize2,
  RotateCcw,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const toolNames: Record<string, string> = {
  '/app/image-gen': 'Generador de Imágenes IA',
  '/app/upscaler': 'Upscaler de Imágenes',
  '/app/extend': 'Extender Imagen',
  '/app/sketch': 'Sketch a Imagen',
  '/app/3d': 'Imagen a 3D',
  '/app/spaces': 'Spaces — Flujos de Trabajo',
}

export function WorkspaceTopbar() {
  const pathname = usePathname()
  const [projectName, setProjectName] = useState('Proyecto sin título')
  const [editing, setEditing] = useState(false)
  const [zoom, setZoom] = useState(100)

  const toolName = toolNames[pathname] || 'Tablero'

  return (
    <header className="h-14 border-b border-white/10 bg-[#0d0d14]/60 backdrop-blur-xl flex items-center justify-between px-4 shrink-0">
      {/* Left section: Project name */}
      <div className="flex items-center gap-3">
        {editing ? (
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
            className="h-8 w-56 bg-white/5 border-white/10 text-white text-sm focus:border-[#8b5cf6]/50"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-sm font-medium text-white/80 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5"
          >
            {projectName}
          </button>
        )}
        <span className="text-white/20">|</span>
        <span className="text-xs text-white/40">{toolName}</span>
      </div>

      {/* Center section: Zoom controls */}
      <div className="flex items-center gap-1">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5"
                onClick={() => setZoom(Math.max(25, zoom - 25))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1a1a2e] border-white/10 text-white">Reducir zoom</TooltipContent>
          </Tooltip>

          <span className="text-xs text-white/50 w-12 text-center select-none">{zoom}%</span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5"
                onClick={() => setZoom(Math.min(400, zoom + 25))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1a1a2e] border-white/10 text-white">Aumentar zoom</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5"
                onClick={() => setZoom(100)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1a1a2e] border-white/10 text-white">Restablecer zoom</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Right section: Share, Export, Avatar */}
      <div className="flex items-center gap-2">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5"
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1a1a2e] border-white/10 text-white">Exportar</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1a1a2e] border-white/10 text-white">Pantalla completa</TooltipContent>
          </Tooltip>

          <Button
            size="sm"
            className="h-8 bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white text-xs font-medium hover:opacity-90 transition-opacity rounded-lg px-4"
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Compartir
          </Button>

          <Avatar className="h-8 w-8 border border-white/10 cursor-pointer">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] text-white text-xs font-semibold">
              U
            </AvatarFallback>
          </Avatar>
        </TooltipProvider>
      </div>
    </header>
  )
}
