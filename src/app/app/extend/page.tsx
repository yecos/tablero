'use client'

import { useState, useCallback, useRef } from 'react'
import {
  Upload,
  Expand,
  Download,
  Loader2,
  X,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize,
  ImagePlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

const directionOptions = [
  { id: 'up', label: 'Arriba', icon: ArrowUp },
  { id: 'down', label: 'Abajo', icon: ArrowDown },
  { id: 'left', label: 'Izquierda', icon: ArrowLeft },
  { id: 'right', label: 'Derecha', icon: ArrowRight },
  { id: 'all', label: 'Todas', icon: Maximize },
]

const aspectRatioTargets = [
  { id: '16:9', label: '16:9', desc: 'Panorámico' },
  { id: '9:16', label: '9:16', desc: 'Vertical' },
  { id: '4:3', label: '4:3', desc: 'Clásico' },
  { id: '1:1', label: '1:1', desc: 'Cuadrado' },
]

export default function ExtendPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [direction, setDirection] = useState('all')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [processing, setProcessing] = useState(false)
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
      const response = await fetch('/api/extend-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          direction,
          aspectRatio,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al extender la imagen')
      }

      const resultUrl = data.imageUrl || (data.base64 ? `data:image/png;base64,${data.base64}` : '')
      setResultImage(resultUrl)
      toast({ title: '¡Imagen extendida!', description: `Extendida hacia ${direction === 'all' ? 'todas las direcciones' : direction}.` })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'No se pudo extender la imagen.',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }, [uploadedImage, direction, aspectRatio, toast])

  const handleDownload = () => {
    if (!resultImage) return
    const link = document.createElement('a')
    link.href = resultImage
    link.download = 'tablero-extended.png'
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

            {/* Direction selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/70">Dirección de expansión</Label>
              <div className="grid grid-cols-5 gap-2">
                {directionOptions.map((d) => {
                  const Icon = d.icon
                  return (
                    <button
                      key={d.id}
                      onClick={() => setDirection(d.id)}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all ${
                        direction === d.id
                          ? 'border-[#8b5cf6]/50 bg-[#8b5cf6]/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${direction === d.id ? 'text-[#8b5cf6]' : 'text-white/40'}`} />
                      <span className="text-[10px] text-white/60">{d.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Aspect ratio target */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/70">Relación de aspecto objetivo</Label>
              <div className="grid grid-cols-4 gap-2">
                {aspectRatioTargets.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setAspectRatio(r.id)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all ${
                      aspectRatio === r.id
                        ? 'border-[#8b5cf6]/50 bg-[#8b5cf6]/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-semibold text-white/80">{r.label}</span>
                    <span className="text-[10px] text-white/40">{r.desc}</span>
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
                  Extendiendo...
                </>
              ) : (
                <>
                  <Expand className="h-4 w-4 mr-2" />
                  Extender imagen
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right area: Result */}
        <div className="flex-1 flex items-center justify-center p-6">
          {!uploadedImage && !resultImage ? (
            <div className="text-center space-y-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#06b6d4]/20 flex items-center justify-center mx-auto border border-white/10">
                <ImagePlus className="h-10 w-10 text-white/20" />
              </div>
              <h2 className="text-xl font-semibold text-white/40">Extiende tus imágenes</h2>
              <p className="text-sm text-white/25">
                Sube una imagen y elige en qué dirección quieres expandirla.
              </p>
            </div>
          ) : resultImage ? (
            <Card className="w-full max-w-3xl bg-[#12121a] border-white/10 overflow-hidden">
              {uploadedImage && (
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="relative">
                    <img src={uploadedImage} alt="Original" className="w-full" />
                    <div className="absolute top-2 left-2 bg-black/60 rounded-md px-2 py-1 text-xs text-white/80">Original</div>
                  </div>
                  <div className="relative">
                    <img src={resultImage} alt="Extendida" className="w-full" />
                    <div className="absolute top-2 right-2 bg-black/60 rounded-md px-2 py-1 text-xs text-white/80">Extendida</div>
                  </div>
                </div>
              )}
              <div className="p-4 flex items-center justify-between">
                <p className="text-xs text-white/40">
                  Dirección: {directionOptions.find((d) => d.id === direction)?.label} | Aspecto: {aspectRatio}
                </p>
                <Button
                  onClick={handleDownload}
                  className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white hover:opacity-90"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="w-full max-w-xl bg-[#12121a] border-white/10 overflow-hidden">
              <img src={uploadedImage!} alt="Original" className="w-full" />
              <div className="p-4 text-center">
                <p className="text-sm text-white/40">Imagen lista para extender. Selecciona las opciones y haz clic en &quot;Extender imagen&quot;.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
