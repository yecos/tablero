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
import { toast } from 'sonner'

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
    addElement,
    brandKit,
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
      case 'group': return Layers
      default: return Square
    }
  }

  const templates = [
    { name: 'Social Media Post', size: '1080 × 1080', width: 400, height: 400, color: '#ec4899' },
    { name: 'Instagram Story', size: '1080 × 1920', width: 300, height: 500, color: '#f97316' },
    { name: 'Twitter Header', size: '1500 × 500', width: 500, height: 170, color: '#06b6d4' },
    { name: 'YouTube Thumbnail', size: '1280 × 720', width: 500, height: 300, color: '#ef4444' },
    { name: 'Poster', size: '2480 × 3508', width: 350, height: 500, color: '#8b5cf6' },
    { name: 'Business Card', size: '1050 × 600', width: 350, height: 200, color: '#10b981' },
  ]

  const handleTemplateClick = (template: typeof templates[number]) => {
    const centerX = 5000 - template.width / 2
    const centerY = 5000 - template.height / 2

    addElement({
      id: `template_${Date.now()}`,
      type: 'shape',
      x: centerX,
      y: centerY,
      width: template.width,
      height: template.height,
      rotation: 0,
      content: template.name,
      color: template.color,
      selected: false,
      locked: false,
      visible: true,
      opacity: 1,
    })

    // Add a title text element on top
    addElement({
      id: `template_text_${Date.now()}`,
      type: 'text',
      x: centerX + 20,
      y: centerY + 20,
      width: template.width - 40,
      height: 40,
      rotation: 0,
      content: template.name,
      fontSize: 20,
      fontFamily: 'Inter',
      color: '#ffffff',
      selected: false,
      locked: false,
      visible: true,
      opacity: 1,
    })

    toast.success(`${template.name} template added to canvas`)
  }

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
                          ? element.isEditableLayer
                            ? 'bg-cyan-500/10 border border-cyan-500/20'
                            : 'bg-purple-500/10 border border-purple-500/20'
                          : 'hover:bg-white/[0.03] border border-transparent'
                      )}
                    >
                      <Icon className={cn('w-4 h-4 shrink-0', element.isEditableLayer ? 'text-cyan-400' : 'text-slate-400')} />
                      <div className='flex-1 min-w-0'>
                        <span className={cn('text-xs truncate block', element.isEditableLayer ? 'text-cyan-300' : 'text-slate-300')}>
                          {element.isEditableLayer ? element.layerName : element.type === 'text' ? element.content : `${element.type} ${index + 1}`}
                        </span>
                        {element.isEditableLayer && (
                          <span className='text-[9px] text-cyan-500/70'>{element.layerType} layer</span>
                        )}
                      </div>
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
            {/* Upload button */}
            <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 cursor-pointer transition-colors mb-3">
              <Plus className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-400">Upload Image</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files
                  if (!files || files.length === 0) return
                  Array.from(files).forEach((file) => {
                    if (!file.type.startsWith('image/')) return
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      const src = event.target?.result as string
                      if (!src) return
                      const img = new Image()
                      img.onload = () => {
                        const maxDim = 500
                        const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1)
                        addElement({
                          id: `asset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                          type: 'image',
                          x: 5000 - (img.width * ratio) / 2 + Math.random() * 100 - 50,
                          y: 5000 - (img.height * ratio) / 2 + Math.random() * 100 - 50,
                          width: img.width * ratio,
                          height: img.height * ratio,
                          rotation: 0,
                          content: file.name,
                          src,
                          selected: false,
                          locked: false,
                          visible: true,
                          opacity: 1,
                        })
                        toast.success(`${file.name} added to canvas`)
                      }
                      img.src = src
                    }
                    reader.readAsDataURL(file)
                  })
                  e.target.value = ''
                }}
              />
            </label>
            {/* List image elements */}
            {elements.filter(e => e.type === 'image').length === 0 ? (
              <div className="text-center py-6">
                <FolderOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No images yet</p>
                <p className="text-xs text-slate-600 mt-1">Upload or drag & drop images, or generate with AI</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {elements.filter(e => e.type === 'image').map((element) => (
                  <div
                    key={element.id}
                    onClick={() => selectElement(element.id)}
                    className={cn(
                      'flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors group',
                      selectedElementId === element.id
                        ? 'bg-purple-500/10 border border-purple-500/20'
                        : 'hover:bg-white/[0.03] border border-transparent'
                    )}
                  >
                    {element.src && (
                      <div className="w-8 h-8 rounded-md overflow-hidden border border-white/10 shrink-0">
                        <img src={element.src} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-slate-300 truncate block">
                        {element.isEditableLayer ? element.layerName : element.content || 'Image'}
                      </span>
                      {element.isEditableLayer && (
                        <span className="text-[9px] text-cyan-500/70">Editable layer</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Hint */}
            <div className="mt-4 p-2 rounded-lg bg-purple-500/5 border border-purple-500/10">
              <p className="text-[10px] text-purple-300/70 leading-relaxed">
                Tip: Select an image on canvas and click "Edit Elements" to decompose it into editable layers with AI
              </p>
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
                  onClick={() => handleTemplateClick(template)}
                  className="p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-purple-500/20 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-md shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: `${template.color}20` }}
                    >
                      <div
                        className="rounded-sm"
                        style={{
                          backgroundColor: template.color,
                          width: template.width > template.height ? 16 : 10,
                          height: template.width > template.height ? 10 : 16,
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-white font-medium group-hover:text-purple-300 transition-colors">{template.name}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{template.size}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {leftPanelTab === 'brandkit' && (
          <div className="p-3">
            <span className="text-xs font-medium text-slate-400 mb-3 block">Brand Kit</span>
            {brandKit ? (
              <div className="space-y-4">
                {/* Brand Name */}
                <div>
                  <h4 className="text-sm font-semibold text-white">{brandKit.brandName}</h4>
                </div>

                {/* Colors */}
                {brandKit.colors && Object.keys(brandKit.colors).length > 0 && (
                  <div>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2 block">Colors</span>
                    <div className="space-y-1.5">
                      {Object.entries(brandKit.colors).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-md border border-white/10 shrink-0"
                            style={{ backgroundColor: value }}
                          />
                          <span className="text-xs text-slate-300 flex-1">{key}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fonts */}
                {brandKit.fonts && (
                  <div>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2 block">Fonts</span>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Type className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-300 flex-1">Heading</span>
                        <span className="text-[10px] text-slate-500">{brandKit.fonts.heading}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Type className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-300 flex-1">Body</span>
                        <span className="text-[10px] text-slate-500">{brandKit.fonts.body}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Brand Voice */}
                {brandKit.voice && (
                  <div>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2 block">Brand Voice</span>
                    <div className="space-y-1.5">
                      <div>
                        <span className="text-[10px] text-slate-500">Tone:</span>
                        <span className="text-xs text-slate-300 ml-1">{brandKit.voice.tone}</span>
                      </div>
                      {brandKit.voice.personality && brandKit.voice.personality.length > 0 && (
                        <div>
                          <span className="text-[10px] text-slate-500">Personality:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {brandKit.voice.personality.map((p) => (
                              <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {brandKit.voice.keywords && brandKit.voice.keywords.length > 0 && (
                        <div>
                          <span className="text-[10px] text-slate-500">Keywords:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {brandKit.voice.keywords.map((k) => (
                              <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Logo Concept */}
                {brandKit.logoConcept && (
                  <div>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1 block">Logo Concept</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{brandKit.logoConcept}</p>
                  </div>
                )}

                {/* Tagline */}
                {brandKit.tagline && (
                  <div>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1 block">Tagline</span>
                    <p className="text-xs text-purple-300 italic">&ldquo;{brandKit.tagline}&rdquo;</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Palette className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No brand kit yet</p>
                <p className="text-xs text-slate-600 mt-1">Generate one with the AI agent</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
