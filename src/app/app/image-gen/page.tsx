'use client'

import { useState, useCallback } from 'react'
import {
  Sparkles,
  Download,
  Maximize2,
  Expand,
  Box,
  ChevronDown,
  Loader2,
  X,
  ImagePlus,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface GeneratedImage {
  id: string
  url: string
  prompt: string
  style: string
  aspectRatio: string
  model: string
  timestamp: Date
}

const styleOptions = [
  { id: 'vivid', label: 'Vívido', color: 'from-pink-500 to-orange-400' },
  { id: 'natural', label: 'Natural', color: 'from-green-500 to-emerald-400' },
  { id: 'cinematic', label: 'Cinemático', color: 'from-amber-500 to-yellow-400' },
  { id: 'anime', label: 'Anime', color: 'from-purple-500 to-pink-400' },
  { id: 'illustration', label: 'Ilustración', color: 'from-cyan-500 to-blue-400' },
]

const aspectRatios = [
  { id: '1:1', label: '1:1', size: '1024x1024', desc: 'Cuadrado' },
  { id: '16:9', label: '16:9', size: '1344x768', desc: 'Panorámico' },
  { id: '9:16', label: '9:16', size: '768x1344', desc: 'Vertical' },
  { id: '4:3', label: '4:3', size: '1152x864', desc: 'Clásico' },
]

export default function ImageGenPage() {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [negOpen, setNegOpen] = useState(false)
  const [style, setStyle] = useState('vivid')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [model, setModel] = useState('gpt-image')
  const [generating, setGenerating] = useState(false)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const { toast } = useToast()

  const getSelectedSize = () => {
    return aspectRatios.find((r) => r.id === aspectRatio)?.size || '1024x1024'
  }

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast({ title: 'Prompt vacío', description: 'Escribe una descripción para generar una imagen.', variant: 'destructive' })
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim() || undefined,
          size: getSelectedSize(),
          style,
          model,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar la imagen')
      }

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: data.imageUrl || (data.base64 ? `data:image/png;base64,${data.base64}` : ''),
        prompt: prompt.trim(),
        style,
        aspectRatio,
        model,
        timestamp: new Date(),
      }

      setImages((prev) => [newImage, ...prev])
      toast({ title: '¡Imagen generada!', description: 'Tu imagen se ha creado correctamente.' })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'No se pudo generar la imagen.',
        variant: 'destructive',
      })
    } finally {
      setGenerating(false)
    }
  }, [prompt, negativePrompt, style, aspectRatio, model, toast])

  const handleDownload = (image: GeneratedImage) => {
    if (!image.url) return
    const link = document.createElement('a')
    link.href = image.url
    link.download = `tablero-${image.id}.png`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      <div className="flex-1 flex min-h-0">
        {/* Left panel: Controls */}
        <div className="w-[380px] border-r border-white/10 bg-[#0d0d14]/50 backdrop-blur-sm flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Prompt */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/70">Prompt</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe la imagen que quieres crear..."
                className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#8b5cf6]/50 resize-none"
              />
            </div>

            {/* Negative prompt */}
            <Collapsible open={negOpen} onOpenChange={setNegOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors w-full">
                <ChevronDown className={`h-3 w-3 transition-transform ${negOpen ? 'rotate-180' : ''}`} />
                Prompt negativo
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <Input
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="Qué evitar en la imagen..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#8b5cf6]/50 text-sm"
                />
              </CollapsibleContent>
            </Collapsible>

            {/* Style selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/70">Estilo</Label>
              <div className="grid grid-cols-5 gap-2">
                {styleOptions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all ${
                      style === s.id
                        ? 'border-[#8b5cf6]/50 bg-[#8b5cf6]/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full bg-gradient-to-br ${s.color}`} />
                    <span className="text-[10px] text-white/60">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect ratio */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/70">Relación de aspecto</Label>
              <div className="grid grid-cols-4 gap-2">
                {aspectRatios.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setAspectRatio(r.id)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all ${
                      aspectRatio === r.id
                        ? 'border-[#8b5cf6]/50 bg-[#8b5cf6]/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div
                      className={`border-2 ${aspectRatio === r.id ? 'border-[#8b5cf6]' : 'border-white/30'} rounded-sm`}
                      style={{
                        width: r.id === '9:16' ? 12 : r.id === '16:9' ? 24 : 18,
                        height: r.id === '16:9' ? 12 : r.id === '9:16' ? 24 : 18,
                      }}
                    />
                    <span className="text-[10px] text-white/60">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Model selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/70">Modelo</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10">
                  <SelectItem value="gpt-image">GPT Image</SelectItem>
                  <SelectItem value="flux-pro">Flux Pro</SelectItem>
                  <SelectItem value="stable-diffusion">Stable Diffusion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate button */}
            <Button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="w-full h-12 bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white font-semibold text-sm hover:opacity-90 transition-opacity rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generar imagen
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right area: Results */}
        <div className="flex-1 flex flex-col min-w-0">
          {images.length === 0 ? (
            /* Empty state */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4 max-w-md">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#06b6d4]/20 flex items-center justify-center mx-auto border border-white/10">
                  <ImagePlus className="h-10 w-10 text-white/20" />
                </div>
                <h2 className="text-xl font-semibold text-white/40">Crea tu primera imagen</h2>
                <p className="text-sm text-white/25">
                  Escribe un prompt en el panel izquierdo y haz clic en &quot;Generar imagen&quot; para comenzar.
                </p>
              </div>
            </div>
          ) : (
            /* Results grid */
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                {images.map((image) => (
                  <Card
                    key={image.id}
                    className="group relative bg-[#12121a] border-white/10 overflow-hidden cursor-pointer hover:border-[#8b5cf6]/30 transition-all"
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="aspect-square relative overflow-hidden">
                      {image.url ? (
                        <img
                          src={image.url}
                          alt={image.prompt}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <ImagePlus className="h-8 w-8 text-white/10" />
                        </div>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white"
                          onClick={(e) => { e.stopPropagation(); handleDownload(image) }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Expand className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Box className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-white/50 truncate">{image.prompt}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Badge variant="secondary" className="text-[10px] bg-white/5 text-white/40 hover:bg-white/10">
                          {styleOptions.find((s) => s.id === image.style)?.label}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] bg-white/5 text-white/40 hover:bg-white/10">
                          {image.aspectRatio}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Loading bar */}
          {generating && (
            <div className="h-1 bg-[#12121a]">
              <div className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] animate-pulse w-full" />
            </div>
          )}
        </div>
      </div>

      {/* Image preview dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl bg-[#12121a] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white/80 text-sm">{selectedImage?.prompt}</DialogTitle>
          </DialogHeader>
          {selectedImage?.url && (
            <div className="relative">
              <img
                src={selectedImage.url}
                alt={selectedImage.prompt}
                className="w-full rounded-lg"
              />
              <div className="flex items-center gap-2 mt-4">
                <Button
                  onClick={() => handleDownload(selectedImage)}
                  className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white hover:opacity-90"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
                <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5">
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Escalar
                </Button>
                <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5">
                  <Expand className="h-4 w-4 mr-2" />
                  Extender
                </Button>
                <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5">
                  <Box className="h-4 w-4 mr-2" />
                  Convertir a 3D
                </Button>
                <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Regenerar
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary" className="bg-white/5 text-white/40">
                  {styleOptions.find((s) => s.id === selectedImage.style)?.label}
                </Badge>
                <Badge variant="secondary" className="bg-white/5 text-white/40">
                  {selectedImage.aspectRatio}
                </Badge>
                <Badge variant="secondary" className="bg-white/5 text-white/40">
                  {selectedImage.model}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
