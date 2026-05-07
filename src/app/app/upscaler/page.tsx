'use client'

import { useState, useCallback, useRef } from 'react'
import {
  Upload,
  Maximize2,
  Download,
  Loader2,
  X,
  ArrowRightLeft,
  ImagePlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

const scaleOptions = [
  { id: 2, label: '2x', desc: 'Alta calidad' },
  { id: 4, label: '4x', desc: 'Ultra HD' },
  { id: 8, label: '8x', desc: 'Extremo' },
  { id: 10, label: '10x', desc: 'Máximo' },
]

const enhancementLevels = [
  { id: 'subtle', label: 'Sutil', desc: 'Mejora ligera' },
  { id: 'moderate', label: 'Moderado', desc: 'Equilibrado' },
  { id: 'intense', label: 'Intenso', desc: 'Máximo detalle' },
]

export default function UpscalerPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [scale, setScale] = useState(2)
  const [enhancement, setEnhancement] = useState('moderate')
  const [processing, setProcessing] = useState(false)
  const [sliderPos, setSliderPos] = useState(50)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Formato no válido', description: 'Sube una imagen (PNG, JPG, WebP).', variant: 'destructive' })
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
      setResultImage(null)
    }
    reader.readAsDataURL(file)
  }, [toast])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }, [handleUpload])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }, [handleUpload])

  const handleProcess = useCallback(async () => {
    if (!uploadedImage) return

    setProcessing(true)
    try {
      const base64 = uploadedImage.split(',')[1]
      const response = await fetch('/api/upscale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          scale,
          enhancement,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al escalar la imagen')
      }

      const resultUrl = data.imageUrl || (data.base64 ? `data:image/png;base64,${data.base64}` : '')
      setResultImage(resultUrl)
      toast({ title: '¡Imagen escalada!', description: `Escalada a ${scale}x con mejora ${enhancement}.` })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'No se pudo escalar la imagen.',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }, [uploadedImage, scale, enhancement, toast])

  const handleDownload = () => {
    if (!resultImage) return
    const link = document.createElement('a')
    link.href = resultImage
    link.download = `tablero-upscaled-${scale}x.png`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSliderMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const pos = ((clientX - rect.left) / rect.width) * 100
    setSliderPos(Math.max(0, Math.min(100, pos)))
  }, [])

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      <div className="flex-1 flex min-h-0">
        {/* Left panel: Controls */}
        <div className="w-[340px] border-r border-white/10 bg-[#0d0d14]/50 backdrop-blur-sm flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Upload area */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/70">Imagen original</Label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-[#8b5cf6]/30 transition-colors cursor-pointer"
              >
                {uploadedImage ? (
                  <div className="relative">
                    <img src={uploadedImage} alt="Original" className="w-full rounded-lg" />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 h-7 w-7 bg-black/50 hover:bg-black/70 text-white"
                      onClick={(e) => { e.stopPropagation(); setUploadedImage(null); setResultImage(null) }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <Upload className="h-8 w-8 text-white/20 mx-auto" />
                    <p className="text-sm text-white/40">Arrastra o haz clic para subir</p>
                    <p className="text-xs text-white/20">PNG, JPG, WebP</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Scale selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/70">Escala</Label>
              <div className="grid grid-cols-4 gap-2">
                {scaleOptions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setScale(s.id)}
                    className={`flex flex-col items-center gap-0.5 p-3 rounded-lg border transition-all ${
                      scale === s.id
                        ? 'border-[#8b5cf6]/50 bg-[#8b5cf6]/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className="text-sm font-semibold text-white/80">{s.label}</span>
                    <span className="text-[10px] text-white/40">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Enhancement level */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/70">Nivel de mejora</Label>
              <div className="grid grid-cols-3 gap-2">
                {enhancementLevels.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setEnhancement(l.id)}
                    className={`flex flex-col items-center gap-0.5 p-3 rounded-lg border transition-all ${
                      enhancement === l.id
                        ? 'border-[#8b5cf6]/50 bg-[#8b5cf6]/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-medium text-white/80">{l.label}</span>
                    <span className="text-[10px] text-white/40">{l.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Process button */}
            <Button
              onClick={handleProcess}
              disabled={processing || !uploadedImage}
              className="w-full h-12 bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white font-semibold text-sm hover:opacity-90 transition-opacity rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Escalar imagen
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right area: Comparison */}
        <div className="flex-1 flex items-center justify-center p-6">
          {!uploadedImage && !resultImage ? (
            /* Empty state */
            <div className="text-center space-y-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#06b6d4]/20 flex items-center justify-center mx-auto border border-white/10">
                <ImagePlus className="h-10 w-10 text-white/20" />
              </div>
              <h2 className="text-xl font-semibold text-white/40">Sube una imagen para escalar</h2>
              <p className="text-sm text-white/25">
                Arrastra una imagen al panel izquierdo para comenzar a escalarla.
              </p>
            </div>
          ) : resultImage && uploadedImage ? (
            /* Before/After comparison */
            <Card className="w-full max-w-3xl bg-[#12121a] border-white/10 overflow-hidden">
              <div
                ref={containerRef}
                className="relative select-none"
                onMouseMove={dragging ? handleSliderMove : undefined}
                onMouseUp={() => setDragging(false)}
                onMouseLeave={() => setDragging(false)}
                onTouchMove={dragging ? handleSliderMove : undefined}
                onTouchEnd={() => setDragging(false)}
              >
                {/* After image (full width) */}
                <img src={resultImage} alt="Escalada" className="w-full" />

                {/* Before image (clipped) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={uploadedImage}
                    alt="Original"
                    className="w-full h-full object-cover"
                    style={{ width: containerRef.current ? containerRef.current.offsetWidth : '100%' }}
                  />
                </div>

                {/* Slider handle */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize"
                  style={{ left: `${sliderPos}%` }}
                  onMouseDown={() => setDragging(true)}
                  onTouchStart={() => setDragging(true)}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <ArrowRightLeft className="h-4 w-4 text-[#0a0a0f]" />
                  </div>
                </div>

                {/* Labels */}
                <div className="absolute top-3 left-3 bg-black/60 rounded-md px-2 py-1 text-xs text-white/80">
                  Original
                </div>
                <div className="absolute top-3 right-3 bg-black/60 rounded-md px-2 py-1 text-xs text-white/80">
                  Escalada {scale}x
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <p className="text-xs text-white/40">Arrastra el control deslizante para comparar</p>
                <Button
                  onClick={handleDownload}
                  className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white hover:opacity-90"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar {scale}x
                </Button>
              </div>
            </Card>
          ) : (
            /* Just uploaded, no result yet */
            <Card className="w-full max-w-xl bg-[#12121a] border-white/10 overflow-hidden">
              <img src={uploadedImage ?? undefined} alt="Original" className="w-full" />
              <div className="p-4 text-center">
                <p className="text-sm text-white/40">Imagen lista para escalar. Selecciona las opciones y haz clic en &quot;Escalar imagen&quot;.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
