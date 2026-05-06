'use client'

import { useDesignStore } from '@/store/design-store'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Image,
  Type,
  Square,
  Layers,
  FolderOpen,
  LayoutTemplate,
  Palette,
  Plus,
} from 'lucide-react'

export function LayersPanel() {
  const {
    elements,
    layers,
    selectedElementId,
    selectElement,
    removeElement,
    updateElement,
    leftPanelTab,
    setLeftPanelTab,
  } = useDesignStore()

  const tabs = [
    { id: 'layers' as const, icon: Layers, label: 'Layers' },
    { id: 'assets' as const, icon: FolderOpen, label: 'Assets' },
    { id: 'templates' as const, icon: LayoutTemplate, label: 'Templates' },
    { id: 'brandkit' as const, icon: Palette, label: 'Brand Kit' },
  ]

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'image': return Image
      case 'text': return Type
      case 'shape': return Square
      default: return Square
    }
  }

  const templates = [
    { name: 'Social Media Post', size: '1080 × 1080' },
    { name: 'Instagram Story', size: '1080 × 1920' },
    { name: 'Twitter Header', size: '1500 × 500' },
    { name: 'YouTube Thumbnail', size: '1280 × 720' },
    { name: 'Poster', size: '2480 × 3508' },
    { name: 'Business Card', size: '1050 × 600' },
  ]

  return (
    <div className="w-64 bg-[#12121a] border-r border-white/5 flex flex-col shrink-0 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setLeftPanelTab(tab.id)}
            className={cn(
              'flex-1 py-2.5 flex flex-col items-center gap-1 transition-colors',
              leftPanelTab === tab.id
                ? 'text-purple-400 bg-purple-500/5'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-[10px]">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {leftPanelTab === 'layers' && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">Layers</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-500 hover:text-white">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            {elements.length === 0 ? (
              <div className="text-center py-8">
                <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No layers yet</p>
                <p className="text-xs text-slate-600 mt-1">Add elements to the canvas</p>
              </div>
            ) : (
              <div className="space-y-1">
                {elements.map((element, index) => {
                  const Icon = getElementIcon(element.type)
                  return (
                    <div
                      key={element.id}
                      onClick={() => selectElement(element.id)}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors group',
                        selectedElementId === element.id
                          ? 'bg-purple-500/10 border border-purple-500/20'
                          : 'hover:bg-white/[0.03] border border-transparent'
                      )}
                    >
                      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-300 truncate flex-1">
                        {element.type === 'text' ? element.content : `${element.type} ${index + 1}`}
                      </span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateElement(element.id, { visible: !element.visible })
                          }}
                          className="h-5 w-5 flex items-center justify-center text-slate-500 hover:text-white"
                        >
                          {element.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            updateElement(element.id, { locked: !element.locked })
                          }}
                          className="h-5 w-5 flex items-center justify-center text-slate-500 hover:text-white"
                        >
                          {element.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeElement(element.id)
                          }}
                          className="h-5 w-5 flex items-center justify-center text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Layer groups */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <span className="text-xs font-medium text-slate-400 mb-2 block">Layer Groups</span>
              {layers.map((layer) => (
                <div key={layer.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.03]">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs text-slate-300">{layer.name}</span>
                  <span className="text-[10px] text-slate-600 ml-auto">{layer.elements.length}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {leftPanelTab === 'assets' && (
          <div className="p-3">
            <span className="text-xs font-medium text-slate-400 mb-3 block">Uploaded Assets</span>
            <div className="text-center py-8">
              <FolderOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No assets yet</p>
              <p className="text-xs text-slate-600 mt-1">Upload images or generate with AI</p>
            </div>
          </div>
        )}

        {leftPanelTab === 'templates' && (
          <div className="p-3">
            <span className="text-xs font-medium text-slate-400 mb-3 block">Templates</span>
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.name}
                  className="p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-purple-500/20 cursor-pointer transition-colors"
                >
                  <span className="text-xs text-white font-medium">{template.name}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">{template.size}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {leftPanelTab === 'brandkit' && (
          <div className="p-3">
            <span className="text-xs font-medium text-slate-400 mb-3 block">Brand Kit</span>
            <div className="text-center py-8">
              <Palette className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No brand kit yet</p>
              <p className="text-xs text-slate-600 mt-1">Generate one with the AI agent</p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
