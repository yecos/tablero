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
import { toast } from 'sonner'

interface ToolbarProps {
  onClose: () => void
}

export function Toolbar({ onClose }: ToolbarProps) {
  const { activeTool, setActiveTool, projectName, setProjectName, leftPanelOpen, setLeftPanelOpen, chatSidebarOpen, setChatSidebarOpen, zoom, setZoom, elements, canUndo, canRedo, undo, redo } = useDesignStore()

  const tools = [
    { id: 'select' as const, icon: MousePointer2, label: 'Select' },
    { id: 'text' as const, icon: Type, label: 'Text' },
    { id: 'shape' as const, icon: Square, label: 'Shape' },
    { id: 'image' as const, icon: Image, label: 'Image' },
    { id: 'draw' as const, icon: Pencil, label: 'Draw' },
  ]

  const handleExport = async () => {
    if (elements.length === 0) {
      toast.error('Nothing to export. Add some elements to the canvas first.')
      return
    }

    toast.loading('Exporting canvas...', { id: 'export' })

    try {
      // Create an offscreen canvas
      const canvas = document.createElement('canvas')
      const exportWidth = 2000
      const exportHeight = 2000
      canvas.width = exportWidth
      canvas.height = exportHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        toast.error('Failed to create canvas context', { id: 'export' })
        return
      }

      // Draw background
      ctx.fillStyle = '#0a0a0f'
      ctx.fillRect(0, 0, exportWidth, exportHeight)

      // Calculate the bounding box of all elements to center them
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      elements.forEach(el => {
        if (el.x < minX) minX = el.x
        if (el.y < minY) minY = el.y
        if (el.x + el.width > maxX) maxX = el.x + el.width
        if (el.y + el.height > maxY) maxY = el.y + el.height
      })

      const contentWidth = maxX - minX
      const contentHeight = maxY - minY
      const scale = Math.min(exportWidth * 0.8 / contentWidth, exportHeight * 0.8 / contentHeight, 2)
      const offsetX = (exportWidth - contentWidth * scale) / 2 - minX * scale
      const offsetY = (exportHeight - contentHeight * scale) / 2 - minY * scale

      // Draw each element
      for (const element of elements) {
        if (!element.visible) continue

        ctx.save()
        ctx.globalAlpha = element.opacity

        const ex = element.x * scale + offsetX
        const ey = element.y * scale + offsetY
        const ew = element.width * scale
        const eh = element.height * scale

        if (element.rotation) {
          const cx = ex + ew / 2
          const cy = ey + eh / 2
          ctx.translate(cx, cy)
          ctx.rotate((element.rotation * Math.PI) / 180)
          ctx.translate(-cx, -cy)
        }

        if (element.type === 'shape') {
          ctx.fillStyle = element.color || '#8b5cf6'
          const radius = 8 * scale
          ctx.beginPath()
          ctx.roundRect(ex, ey, ew, eh, radius)
          ctx.fill()
        } else if (element.type === 'text') {
          ctx.fillStyle = element.color || '#ffffff'
          ctx.font = `${(element.fontSize || 16) * scale}px ${element.fontFamily || 'Inter'}`
          ctx.textBaseline = 'top'
          ctx.fillText(element.content, ex, ey, ew)
        } else if (element.type === 'image' && element.src) {
          try {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            // For base64 images, we can draw directly
            await new Promise<void>((resolve, reject) => {
              img.onload = () => {
                ctx.drawImage(img, ex, ey, ew, eh)
                resolve()
              }
              img.onerror = reject
              img.src = element.src!
            })
          } catch {
            // Skip images that fail to load (e.g. CORS issues)
            ctx.fillStyle = '#333'
            ctx.fillRect(ex, ey, ew, eh)
            ctx.fillStyle = '#fff'
            ctx.font = `${12 * scale}px Inter`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('Image', ex + ew / 2, ey + eh / 2)
            ctx.textAlign = 'start'
          }
        }

        ctx.restore()
      }

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Failed to export canvas', { id: 'export' })
          return
        }
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${projectName || 'design'}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success('Export completed!', { id: 'export' })
      }, 'image/png')
    } catch {
      toast.error('Export failed. Please try again.', { id: 'export' })
    }
  }

  const handleUndo = () => {
    undo()
  }

  const handleRedo = () => {
    redo()
  }

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
        <Button variant="ghost" size="icon" className={cn('h-8 w-8 hover:bg-white/5', canUndo ? 'text-slate-400 hover:text-white' : 'text-slate-700')} onClick={handleUndo} disabled={!canUndo}>
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className={cn('h-8 w-8 hover:bg-white/5', canRedo ? 'text-slate-400 hover:text-white' : 'text-slate-700')} onClick={handleRedo} disabled={!canRedo}>
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
        <Button variant="ghost" size="sm" className="h-8 text-slate-400 hover:text-white hover:bg-white/5 gap-1.5" onClick={handleExport}>
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
