'use client'

import { useDesignStore } from '@/store/design-store'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Undo2,
  Redo2,
  MousePointer2,
  Type,
  Square,
  Image,
  Pencil,
  Download,
  Share2,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToolbarProps {
  onClose: () => void
}

export function Toolbar({ onClose }: ToolbarProps) {
  const { activeTool, setActiveTool, projectName, setProjectName, leftPanelOpen, setLeftPanelOpen, chatSidebarOpen, setChatSidebarOpen, zoom, setZoom } = useDesignStore()

  const tools = [
    { id: 'select' as const, icon: MousePointer2, label: 'Select' },
    { id: 'text' as const, icon: Type, label: 'Text' },
    { id: 'shape' as const, icon: Square, label: 'Shape' },
    { id: 'image' as const, icon: Image, label: 'Image' },
    { id: 'draw' as const, icon: Pencil, label: 'Draw' },
  ]

  return (
    <div className="h-12 bg-[#12121a] border-b border-white/5 flex items-center justify-between px-3 gap-2 shrink-0">
      {/* Left: Back + Project name */}
      <div className="flex items-center gap-2 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5 shrink-0"
          onClick={onClose}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Separator orientation="vertical" className="h-6 bg-white/5" />
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="bg-transparent text-sm text-white border-none outline-none focus:bg-white/5 rounded px-2 py-1 max-w-[200px] truncate"
        />
      </div>

      {/* Center: Tools */}
      <div className="flex items-center gap-1 bg-[#0a0a0f] rounded-lg p-0.5 border border-white/5">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={cn(
              'h-7 w-7 rounded-md flex items-center justify-center transition-colors',
              activeTool === tool.id
                ? 'bg-purple-500/20 text-purple-400'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
            )}
            title={tool.label}
          >
            <tool.icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/5">
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/5">
          <Redo2 className="w-4 h-4" />
        </Button>
        <Separator orientation="vertical" className="h-6 bg-white/5" />

        {/* Zoom controls */}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/5" onClick={() => setZoom(zoom - 0.1)}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-xs text-slate-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/5" onClick={() => setZoom(zoom + 0.1)}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/5" onClick={() => setZoom(1)}>
          <Maximize2 className="w-3.5 h-3.5" />
        </Button>
        <Separator orientation="vertical" className="h-6 bg-white/5" />

        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8 hover:bg-white/5', leftPanelOpen ? 'text-purple-400' : 'text-slate-500 hover:text-white')}
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
        >
          {leftPanelOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8 hover:bg-white/5', chatSidebarOpen ? 'text-purple-400' : 'text-slate-500 hover:text-white')}
          onClick={() => setChatSidebarOpen(!chatSidebarOpen)}
        >
          <MessageSquare className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 bg-white/5" />
        <Button variant="ghost" size="sm" className="h-8 text-slate-400 hover:text-white hover:bg-white/5 gap-1.5">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Export</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-8 text-slate-400 hover:text-white hover:bg-white/5 gap-1.5">
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Share</span>
        </Button>
      </div>
    </div>
  )
}
