'use client'

import { useState, useCallback } from 'react'
import { useDesignStore, type ImageAnalysis, type SplitLayer } from '@/store/design-store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  X,
  Loader2,
  ScanEye,
  Layers,
  Type,
  Square,
  Image,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Wand2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function ImageSplitPanel() {
  const {
    imageSplit,
    elements,
    closeSplitPanel,
    completeImageAnalysis,
    completeImageSplit,
    addSplitLayersToCanvas,
  } = useDesignStore()

  const { isAnalyzing, isSplitting, originalImageId, analysis, splitLayers, showSplitPanel } = imageSplit

  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set())
  const [expandedElement, setExpandedElement] = useState<string | null>(null)
  const [isGeneratingLayers, setIsGeneratingLayers] = useState(false)

  // Get the original image element
  const originalImage = elements.find(e => e.id === originalImageId)

  // Step 1: Analyze the image
  const handleAnalyze = useCallback(async () => {
    if (!originalImage?.src) {
      toast.error('No image found to analyze')
      return
    }

    useDesignStore.getState().startImageAnalysis(originalImage.id)

    try {
      // Extract base64 data from the image src
      let imageBase64 = null
      if (originalImage.src.startsWith('data:')) {
        imageBase64 = originalImage.src.split(',')[1]
      }

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          imageUrl: imageBase64 ? undefined : originalImage.src,
        }),
      })

      if (!response.ok) throw new Error('Analysis failed')

      const data = await response.json()

      if (data.success && data.analysis) {
        completeImageAnalysis(data.analysis)
        // Auto-select all elements
        const allIds = [
          ...(data.analysis.elements || []).map((e: ImageAnalysis['elements'][0]) => e.id),
          ...(data.analysis.textElements || []).map((t: ImageAnalysis['textElements'][0]) => t.id),
        ]
        setSelectedElements(new Set(allIds))
        toast.success('Image analyzed! Select elements to split into editable layers.')
      } else {
        toast.error('Analysis returned no results')
        closeSplitPanel()
      }
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to analyze image. Please try again.')
      closeSplitPanel()
    }
  }, [originalImage, completeImageAnalysis, closeSplitPanel])

  // Step 2: Generate the split layers
  const handleSplit = useCallback(async () => {
    if (!analysis || selectedElements.size === 0) {
      toast.error('Select at least one element to split')
      return
    }

    useDesignStore.getState().startImageSplit()
    setIsGeneratingLayers(true)

    try {
      // Prepare layers to generate
      const layersToGenerate = analysis.elements
        .filter(e => selectedElements.has(e.id))
        .map(e => ({
          id: e.id,
          name: e.name,
          type: e.type,
          generatePrompt: e.generatePrompt,
        }))

      const response = await fetch('/api/split-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layers: layersToGenerate,
          style: analysis.style,
          imageSize: '1024x1024',
        }),
      })

      if (!response.ok) throw new Error('Split failed')

      const data = await response.json()

      if (data.success && data.layers) {
        // Add text elements as editable text layers
        const textLayers: SplitLayer[] = analysis.textElements
          .filter(t => selectedElements.has(t.id))
          .map(t => ({
            id: t.id,
            name: t.name,
            type: 'text',
            imageUrl: null,
            base64: null,
          }))

        const allLayers = [...data.layers, ...textLayers]
        completeImageSplit(allLayers)
        toast.success('Image split into editable layers!')
      } else {
        toast.error('Split returned no results')
        completeImageSplit([])
      }
    } catch (error) {
      console.error('Split error:', error)
      toast.error('Failed to split image. Please try again.')
      completeImageSplit([])
    } finally {
      setIsGeneratingLayers(false)
    }
  }, [analysis, selectedElements, completeImageSplit])

  // Step 3: Add all generated layers to canvas
  const handleAddToCanvas = useCallback(() => {
    if (!originalImage || splitLayers.length === 0) return

    addSplitLayersToCanvas(
      splitLayers,
      originalImage.id,
      originalImage.x,
      originalImage.y,
      originalImage.width,
      originalImage.height
    )

    // Also add text elements as text elements on canvas
    if (analysis?.textElements) {
      const { addElement } = useDesignStore.getState()
      analysis.textElements.forEach((textEl, idx) => {
        addElement({
          id: `split_txt_${textEl.id}_${Date.now()}_${idx}`,
          type: 'text',
          x: originalImage.x + originalImage.width + 40,
          y: originalImage.y + originalImage.height - (analysis.textElements.length - idx) * 50,
          width: originalImage.width,
          height: 40,
          rotation: 0,
          content: textEl.text,
          fontSize: textEl.fontSize === 'large' ? 32 : textEl.fontSize === 'medium' ? 20 : 14,
          fontFamily: 'Inter',
          color: '#ffffff',
          selected: false,
          locked: false,
          visible: true,
          opacity: 1,
          isEditableLayer: true,
          parentImageId: originalImage.id,
          layerType: 'text',
          layerName: textEl.name,
        })
      })
    }

    toast.success('Editable layers added to canvas!')
  }, [originalImage, splitLayers, analysis, addSplitLayersToCanvas])

  // Toggle element selection
  const toggleElement = (id: string) => {
    setSelectedElements(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Get icon for element type
  const getElementIcon = (type: string) => {
    switch (type) {
      case 'background': return Image
      case 'subject': return ScanEye
      case 'text': return Type
      case 'object': return Square
      case 'decoration': return Sparkles
      case 'effect': return Sparkles
      default: return Layers
    }
  }

  if (!showSplitPanel) return null

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[420px] bg-[#12121a]/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center">
            <Layers className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Edit Elements</h3>
            <p className="text-[10px] text-slate-500">AI-powered image decomposition</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-500 hover:text-white hover:bg-white/5"
          onClick={closeSplitPanel}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Step 1: Original Image Preview */}
          {originalImage?.src && (
            <div className="space-y-2">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Original Image</span>
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/30">
                <img
                  src={originalImage.src}
                  alt="Original"
                  className="w-full h-auto max-h-[200px] object-contain"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                        <ScanEye className="w-4 h-4 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <span className="text-xs text-purple-300">Analyzing image...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Auto-analyze on first open */}
          {isAnalyzing && !analysis && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                <ScanEye className="w-8 h-8 text-purple-400 animate-pulse" />
              </div>
              <h4 className="text-sm font-medium text-white mb-1">Scanning Image</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                AI is analyzing your image to identify all distinct visual elements...
              </p>
            </div>
          )}

          {/* Step 2: Analysis Results */}
          {analysis && (
            <div className="space-y-3">
              {/* Description */}
              <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                <p className="text-xs text-purple-200 leading-relaxed">{analysis.description}</p>
                <p className="text-[10px] text-purple-400 mt-1">Style: {analysis.style}</p>
              </div>

              {/* Visual Elements */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    Visual Elements ({analysis.elements.length})
                  </span>
                  <button
                    onClick={() => {
                      const allIds = analysis.elements.map(e => e.id)
                      if (selectedElements.size === allIds.length) {
                        setSelectedElements(new Set())
                      } else {
                        setSelectedElements(new Set(allIds))
                      }
                    }}
                    className="text-[10px] text-purple-400 hover:text-purple-300"
                  >
                    {selectedElements.size === analysis.elements.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {analysis.elements.map((element) => {
                  const Icon = getElementIcon(element.type)
                  const isSelected = selectedElements.has(element.id)
                  const isExpanded = expandedElement === element.id

                  return (
                    <div
                      key={element.id}
                      className={cn(
                        'rounded-lg border transition-all',
                        isSelected
                          ? 'bg-purple-500/5 border-purple-500/20'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                      )}
                    >
                      <div
                        className="flex items-center gap-2.5 p-2.5 cursor-pointer"
                        onClick={() => toggleElement(element.id)}
                      >
                        {/* Checkbox */}
                        <div
                          className={cn(
                            'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                            isSelected
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-slate-600 hover:border-purple-400'
                          )}
                        >
                          {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>

                        {/* Icon */}
                        <div className={cn(
                          'w-7 h-7 rounded-md flex items-center justify-center shrink-0',
                          element.type === 'background' ? 'bg-blue-500/10' :
                          element.type === 'subject' ? 'bg-emerald-500/10' :
                          element.type === 'object' ? 'bg-amber-500/10' :
                          'bg-purple-500/10'
                        )}>
                          <Icon className={cn(
                            'w-3.5 h-3.5',
                            element.type === 'background' ? 'text-blue-400' :
                            element.type === 'subject' ? 'text-emerald-400' :
                            element.type === 'object' ? 'text-amber-400' :
                            'text-purple-400'
                          )} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-white font-medium">{element.name}</span>
                          <p className="text-[10px] text-slate-500 truncate">{element.type} - {element.position}</p>
                        </div>

                        {/* Expand */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedElement(isExpanded ? null : element.id)
                          }}
                          className="h-5 w-5 flex items-center justify-center text-slate-500 hover:text-white"
                        >
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="px-2.5 pb-2.5 space-y-2">
                          <p className="text-[11px] text-slate-400 leading-relaxed">{element.description}</p>
                          <div className="p-2 rounded-md bg-black/20 border border-white/5">
                            <span className="text-[9px] text-slate-500 uppercase">Generation Prompt</span>
                            <p className="text-[10px] text-cyan-300 mt-0.5 leading-relaxed">{element.generatePrompt}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Text Elements */}
              {analysis.textElements && analysis.textElements.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    Detected Text ({analysis.textElements.length})
                  </span>
                  {analysis.textElements.map((textEl) => {
                    const isSelected = selectedElements.has(textEl.id)
                    return (
                      <div
                        key={textEl.id}
                        className={cn(
                          'flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all',
                          isSelected
                            ? 'bg-cyan-500/5 border-cyan-500/20'
                            : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                        )}
                        onClick={() => toggleElement(textEl.id)}
                      >
                        <div className={cn(
                          'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                          isSelected
                            ? 'bg-cyan-500 border-cyan-500'
                            : 'border-slate-600 hover:border-cyan-400'
                        )}>
                          {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <Type className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-white">"{textEl.text}"</span>
                          <p className="text-[10px] text-slate-500">{textEl.name} - {textEl.style}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <Separator className="bg-white/5" />

              {/* Generate button */}
              <Button
                onClick={handleSplit}
                disabled={selectedElements.size === 0 || isSplitting}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white border-0 h-10"
              >
                {isSplitting || isGeneratingLayers ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating Layers...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Split into {selectedElements.size} Editable Layers
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 3: Generated Layers Preview */}
          {splitLayers.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">
                Generated Layers ({splitLayers.length})
              </span>

              <div className="grid grid-cols-2 gap-2">
                {splitLayers.map((layer, idx) => (
                  <div key={layer.id} className="rounded-lg border border-white/10 overflow-hidden bg-black/30">
                    {layer.imageUrl || layer.base64 ? (
                      <img
                        src={layer.base64 ? `data:image/png;base64,${layer.base64}` : layer.imageUrl!}
                        alt={layer.name}
                        className="w-full h-28 object-cover"
                      />
                    ) : layer.type === 'text' ? (
                      <div className="w-full h-28 flex items-center justify-center bg-cyan-500/5">
                        <Type className="w-6 h-6 text-cyan-400" />
                      </div>
                    ) : layer.error ? (
                      <div className="w-full h-28 flex items-center justify-center bg-red-500/5">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                      </div>
                    ) : null}
                    <div className="p-2">
                      <span className="text-[10px] text-white font-medium">{layer.name}</span>
                      <p className="text-[9px] text-slate-500">{layer.type}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="bg-white/5" />

              {/* Side-by-side comparison */}
              {originalImage?.src && (
                <div className="space-y-2">
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    Side-by-Side Comparison
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-white/10 overflow-hidden bg-black/30">
                      <img
                        src={originalImage.src}
                        alt="Original"
                        className="w-full h-32 object-contain"
                      />
                      <div className="p-1.5 text-center">
                        <span className="text-[9px] text-slate-400">Original</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-emerald-500/20 overflow-hidden bg-black/30">
                      {/* Show the background layer as the "editable" version */}
                      {splitLayers.find(l => l.type === 'background' && (l.imageUrl || l.base64)) ? (
                        <img
                          src={
                            splitLayers.find(l => l.type === 'background')!.base64
                              ? `data:image/png;base64,${splitLayers.find(l => l.type === 'background')!.base64}`
                              : splitLayers.find(l => l.type === 'background')!.imageUrl!
                          }
                          alt="Editable"
                          className="w-full h-32 object-contain"
                        />
                      ) : splitLayers[0]?.imageUrl || splitLayers[0]?.base64 ? (
                        <img
                          src={
                            splitLayers[0].base64
                              ? `data:image/png;base64,${splitLayers[0].base64}`
                              : splitLayers[0].imageUrl!
                          }
                          alt="Editable"
                          className="w-full h-32 object-contain"
                        />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center">
                          <Layers className="w-6 h-6 text-emerald-400" />
                        </div>
                      )}
                      <div className="p-1.5 text-center">
                        <span className="text-[9px] text-emerald-400">Editable Layers</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add to Canvas button */}
              <Button
                onClick={handleAddToCanvas}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border-0 h-10"
              >
                <Layers className="w-4 h-4 mr-2" />
                Add Editable Layers to Canvas
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-white/5 bg-[#0a0a0f]/50">
        <p className="text-[10px] text-slate-600 text-center">
          Powered by AI Vision Analysis - Similar to Lovart.ai Edit Elements
        </p>
      </div>
    </div>
  )
}
