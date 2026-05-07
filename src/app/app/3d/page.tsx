'use client'

import { useState, useCallback, useRef, Suspense, useEffect } from 'react'
import {
  Upload,
  Box,
  Download,
  Loader2,
  X,
  RotateCcw,
  Eye,
  EyeOff,
  ImagePlus,
  Move3D,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import dynamic from 'next/dynamic'
import { useToast } from '@/hooks/use-toast'

// Dynamic import for Three.js to avoid SSR issues
const ModelViewer3DDynamic = dynamic(
  () => import('@/components/workspace/model-viewer-3d').then((mod) => mod.ModelViewer3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 text-[#8b5cf6] animate-spin mx-auto" />
          <p className="text-sm text-white/40">Cargando visor 3D...</p>
        </div>
      </div>
    ),
  }
)

export default function ThreedPage() {
  const [sourceImage, setSourceImage] = useState<string | null>(null)
  const [modelData, setModelData] = useState<string | null>(null)
  const [isFallback, setIsFallback] = useState(false)
  const [showTexture, setShowTexture] = useState(true)
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
      setSourceImage(e.target?.result as string)
      setModelData(null)
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

  const handleGenerate = useCallback(async () => {
    if (!sourceImage) return

    setProcessing(true)
    try {
      const base64 = sourceImage.split(',')[1]
      const response = await fetch('/api/image-to-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar el modelo 3D')
      }

      setModelData(data.modelData)
      setIsFallback(data.fallback || false)

      if (data.fallback) {
        toast({
          title: 'Modelo de vista previa',
          description: 'Se está usando un modelo de vista previa. El servicio de generación 3D completo estará disponible pronto.',
        })
      } else {
        toast({ title: '¡Modelo 3D generado!', description: 'Tu imagen se ha convertido en un modelo 3D.' })
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'No se pudo generar el modelo 3D.',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }, [sourceImage, toast])

  const handleDownloadGLB = () => {
    if (!modelData) return
    const binaryString = atob(modelData)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    const blob = new Blob([bytes], { type: 'model/gltf-binary' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'tablero-model.glb'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      <div className="flex-1 flex min-h-0">
        {/* Left panel: Controls */}
        <div className="w-[340px] border-r border-white/10 bg-[#0d0d14]/50 backdrop-blur-sm flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Upload area */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/70">Imagen de origen</Label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-[#8b5cf6]/30 transition-colors cursor-pointer"
              >
                {sourceImage ? (
                  <div className="relative">
                    <img src={sourceImage} alt="Origen" className="w-full rounded-lg" />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 h-7 w-7 bg-black/50 hover:bg-black/70 text-white"
                      onClick={(e) => { e.stopPropagation(); setSourceImage(null); setModelData(null) }}
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

            {/* Texture toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showTexture ? <Eye className="h-4 w-4 text-white/40" /> : <EyeOff className="h-4 w-4 text-white/40" />}
                <Label className="text-sm text-white/70">Texturas</Label>
              </div>
              <Switch
                checked={showTexture}
                onCheckedChange={setShowTexture}
              />
            </div>

            {/* Wireframe info */}
            {modelData && (
              <div className="bg-white/5 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Move3D className="h-4 w-4 text-[#8b5cf6]" />
                  <span className="text-xs font-medium text-white/60">Información del modelo</span>
                </div>
                <div className="text-xs text-white/40 space-y-1">
                  <p>Formato: GLB (glTF Binary)</p>
                  <p>Textura: {showTexture ? 'Activada' : 'Desactivada'}</p>
                  {isFallback && <p className="text-amber-400/60">⚠ Modelo de vista previa</p>}
                </div>
              </div>
            )}

            {/* Generate button */}
            <Button
              onClick={handleGenerate}
              disabled={processing || !sourceImage}
              className="w-full h-12 bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white font-semibold text-sm hover:opacity-90 transition-opacity rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando 3D...
                </>
              ) : (
                <>
                  <Box className="h-4 w-4 mr-2" />
                  Generar modelo 3D
                </>
              )}
            </Button>

            {/* Download button */}
            {modelData && (
              <Button
                onClick={handleDownloadGLB}
                variant="outline"
                className="w-full border-white/10 text-white/60 hover:text-white hover:bg-white/5"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar GLB
              </Button>
            )}
          </div>
        </div>

        {/* Right area: 3D Viewer */}
        <div className="flex-1 flex items-center justify-center p-6">
          {!sourceImage && !modelData ? (
            <div className="text-center space-y-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#06b6d4]/20 flex items-center justify-center mx-auto border border-white/10">
                <Box className="h-10 w-10 text-white/20" />
              </div>
              <h2 className="text-xl font-semibold text-white/40">Convierte imágenes a 3D</h2>
              <p className="text-sm text-white/25">
                Sube una imagen y genera un modelo 3D que puedes rotar y descargar.
              </p>
            </div>
          ) : modelData ? (
            <Card className="w-full h-full bg-[#12121a] border-white/10 overflow-hidden">
              <div className="h-full relative">
                <ModelViewer3DDynamic modelData={modelData} showTexture={showTexture} />
                {/* Controls overlay */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 bg-black/40 backdrop-blur-sm text-white/60 hover:text-white hover:bg-black/60"
                    onClick={() => setModelData(null)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="w-full max-w-xl bg-[#12121a] border-white/10 overflow-hidden">
              <img src={sourceImage!} alt="Origen" className="w-full" />
              <div className="p-4 text-center">
                <p className="text-sm text-white/40">Imagen lista para convertir. Haz clic en &quot;Generar modelo 3D&quot;.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
