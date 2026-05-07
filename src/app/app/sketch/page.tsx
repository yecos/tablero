'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  PenTool,
  Eraser,
  Palette,
  Loader2,
  Sparkles,
  Download,
  RotateCcw,
  X,
  Minus,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'

const colors = [
  '#ffffff', '#000000', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
]

const styleOptions = [
  { id: 'natural', label: 'Natural' },
  { id: 'vivid', label: 'Vívido' },
  { id: 'anime', label: 'Anime' },
  { id: 'illustration', label: 'Ilustración' },
  { id: 'cinematic', label: 'Cinemático' },
]

export default function SketchPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen')
  const [color, setColor] = useState('#ffffff')
  const [brushSize, setBrushSize] = useState(4)
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('natural')
  const [generating, setGenerating] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const { toast } = useToast()

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      canvas.width = rect.width
      canvas.height = rect.height
    }

    // Fill black background
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const getCanvasContext = () => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getContext('2d')
  }

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true)
    const ctx = getCanvasContext()
    if (!ctx) return

    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }, [])

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const ctx = getCanvasContext()
    if (!ctx) return

    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (tool === 'eraser') {
      ctx.strokeStyle = '#1a1a2e'
    } else {
      ctx.strokeStyle = color
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }, [isDrawing, tool, color, brushSize])

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const clearCanvas = () => {
    const ctx = getCanvasContext()
    if (!ctx) return
    const canvas = canvasRef.current!
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast({ title: 'Prompt vacío', description: 'Describe qué quieres crear a partir de tu sketch.', variant: 'destructive' })
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    setGenerating(true)
    try {
      const sketchBase64 = canvas.toDataURL('image/png').split(',')[1]

      const response = await fetch('/api/sketch-to-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          sketchBase64,
          style,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar la imagen')
      }

      const resultUrl = data.imageUrl || (data.base64 ? `data:image/png;base64,${data.base64}` : '')
      setResultImage(resultUrl)
      toast({ title: '¡Imagen generada!', description: 'Tu sketch se ha convertido en imagen.' })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'No se pudo generar la imagen.',
        variant: 'destructive',
      })
    } finally {
      setGenerating(false)
    }
  }, [prompt, style, toast])

  const handleDownload = () => {
    if (!resultImage) return
    const link = document.createElement('a')
    link.href = resultImage
    link.download = 'tablero-sketch-to-image.png'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      <div className="flex-1 flex min-h-0">
        {/* Left panel: Controls */}
        <div className="w-[340px] border-r border-white/10 bg-[#0d0d14]/50 backdrop-blur-sm flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Drawing tools */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-white/70">Herramientas</Label>
              <div className="flex gap-2">
                <Button
                  variant={tool === 'pen' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTool('pen')}
                  className={tool === 'pen' ? 'bg-[#8b5cf6] text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}
                >
                  <PenTool className="h-4 w-4 mr-1.5" />
                  Lápiz
                </Button>
                <Button
                  variant={tool === 'eraser' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTool('eraser')}
                  className={tool === 'eraser' ? 'bg-[#8b5cf6] text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}
                >
                  <Eraser className="h-4 w-4 mr-1.5" />
                  Borrador
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCanvas}
                  className="text-white/40 hover:text-white hover:bg-white/5"
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Limpiar
                </Button>
              </div>
            </div>

            {/* Color picker */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/70">Color</Label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setColor(c); setTool('pen') }}
                    className={`h-7 w-7 rounded-full border-2 transition-all ${
                      color === c && tool === 'pen'
                        ? 'border-[#8b5cf6] scale-110'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Brush size */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/70">Tamaño del pincel: {brushSize}px</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/5 shrink-0"
                  onClick={() => setBrushSize(Math.max(1, brushSize - 1))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Slider
                  value={[brushSize]}
                  onValueChange={([v]) => setBrushSize(v)}
                  min={1}
                  max={50}
                  step={1}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/5 shrink-0"
                  onClick={() => setBrushSize(Math.min(50, brushSize + 1))}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/70">Prompt</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe qué quieres crear a partir de tu sketch..."
                className="min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-[#8b5cf6]/50 resize-none"
              />
            </div>

            {/* Style */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/70">Estilo</Label>
              <div className="flex flex-wrap gap-2">
                {styleOptions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      style === s.id
                        ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30'
                        : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
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
                  Generar desde sketch
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right area: Canvas + Result */}
        <div className="flex-1 flex min-w-0">
          {/* Drawing canvas */}
          <div className="flex-1 relative bg-[#1a1a2e]">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {/* Canvas info */}
            <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-white/40">
              Dibuja aquí tu sketch
            </div>
          </div>

          {/* Result panel */}
          {resultImage && (
            <div className="w-[400px] border-l border-white/10 bg-[#0d0d14]/50 flex flex-col shrink-0">
              <div className="h-12 border-b border-white/10 flex items-center justify-between px-4">
                <span className="text-sm font-medium text-white/60">Resultado</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-white/30 hover:text-white hover:bg-white/5"
                  onClick={() => setResultImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <Card className="bg-[#12121a] border-white/10 overflow-hidden">
                  <img src={resultImage} alt="Resultado" className="w-full" />
                </Card>
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={handleDownload}
                    className="flex-1 bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white hover:opacity-90"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="text-white/60 hover:text-white hover:bg-white/5"
                  >
                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
