'use client'

import { useState, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import {
  Upload,
  Download,
  Shuffle,
  Sun,
  Palette,
  Sparkles,
  ImagePlus,
  X,
  ZoomIn,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import BeforeAfterSlider from './BeforeAfterSlider'
import EnhanceControls, { type EnhanceSettings } from './EnhanceControls'
import PresetSelector, { type Preset } from './PresetSelector'

const defaultSettings: EnhanceSettings = {
  prompt: '',
  creativity: 5,
  resemblance: 7,
  hdr: 3,
  fractality: 2,
  scale: 2,
  precisionMode: false,
}

export default function EnhanceWorkspace() {
  const [beforeImage, setBeforeImage] = useState<string | null>(null)
  const [afterImage, setAfterImage] = useState<string | null>(null)
  const [settings, setSettings] = useState<EnhanceSettings>(defaultSettings)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen (PNG, JPG, WEBP)')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('El archivo es demasiado grande (máximo 20MB)')
      return
    }
    setError(null)
    setAfterImage(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      setBeforeImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFileUpload(file)
    },
    [handleFileUpload]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handlePresetSelect = useCallback((preset: Preset) => {
    setSelectedPreset(preset.id)
    setSettings((prev) => ({
      ...prev,
      ...preset.settings,
    }))
  }, [])

  const handleEnhance = useCallback(async () => {
    if (!beforeImage) return

    setIsProcessing(true)
    setActiveAction('enhance')
    setError(null)

    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: beforeImage,
          prompt: settings.prompt,
          creativity: settings.creativity,
          resemblance: settings.resemblance,
          hdr: settings.hdr,
          fractality: settings.fractality,
          scale: settings.scale,
          mode: settings.precisionMode ? 'precision' : 'standard',
          preset: selectedPreset,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al mejorar la imagen')
      }

      if (data.success && data.data?.url) {
        setAfterImage(data.data.url)
      } else {
        throw new Error('No se recibió la imagen mejorada')
      }
    } catch (err) {
      console.error('Enhance error:', err)
      setError(err instanceof Error ? err.message : 'Error al procesar la imagen')
    } finally {
      setIsProcessing(false)
      setActiveAction(null)
    }
  }, [beforeImage, settings, selectedPreset])

  const handleRelight = useCallback(async () => {
    if (!beforeImage && !afterImage) return

    setIsProcessing(true)
    setActiveAction('relight')
    setError(null)

    try {
      const response = await fetch('/api/relight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: afterImage || beforeImage,
          prompt: settings.prompt,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al reiluminar')
      }

      if (data.success && data.data?.url) {
        setAfterImage(data.data.url)
      }
    } catch (err) {
      console.error('Relight error:', err)
      setError(err instanceof Error ? err.message : 'Error al reiluminar')
    } finally {
      setIsProcessing(false)
      setActiveAction(null)
    }
  }, [beforeImage, afterImage, settings.prompt])

  const handleStyleTransfer = useCallback(async () => {
    if (!beforeImage && !afterImage) return

    setIsProcessing(true)
    setActiveAction('style-transfer')
    setError(null)

    try {
      const response = await fetch('/api/style-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: afterImage || beforeImage,
          style: selectedPreset || 'photorealistic',
          prompt: settings.prompt,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al transferir estilo')
      }

      if (data.success && data.data?.url) {
        setAfterImage(data.data.url)
      }
    } catch (err) {
      console.error('Style transfer error:', err)
      setError(err instanceof Error ? err.message : 'Error al transferir estilo')
    } finally {
      setIsProcessing(false)
      setActiveAction(null)
    }
  }, [beforeImage, afterImage, selectedPreset, settings.prompt])

  const handleExport = useCallback(() => {
    if (!afterImage) return
    const link = document.createElement('a')
    link.href = afterImage
    link.download = `tablero-enhanced-${Date.now()}.png`
    link.target = '_blank'
    link.click()
  }, [afterImage])

  const handleVariations = useCallback(() => {
    // Re-run enhance with slightly different settings
    setSettings((prev) => ({
      ...prev,
      creativity: Math.min(10, prev.creativity + 1),
    }))
    // Trigger enhance after state update
    setTimeout(() => {
      handleEnhance()
    }, 100)
  }, [handleEnhance])

  const handleClearImage = useCallback(() => {
    setBeforeImage(null)
    setAfterImage(null)
    setError(null)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center">
            <ZoomIn className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Mejorar Imagen</h1>
            <p className="text-[11px] text-white/30">Mejora tus imágenes con IA generativa</p>
          </div>
        </div>

        {beforeImage && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearImage}
              className="text-white/50 hover:text-white hover:bg-white/5"
            >
              <X className="w-4 h-4 mr-1" />
              Limpiar
            </Button>
          </div>
        )}
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left side - Image preview */}
        <div className="flex-1 relative flex items-center justify-center p-4 sm:p-6 min-h-[400px] lg:min-h-0">
          {!beforeImage ? (
            /* Upload zone */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'w-full max-w-2xl aspect-[4/3] rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer',
                'flex flex-col items-center justify-center gap-4',
                isDragOver
                  ? 'border-purple-500 bg-purple-500/10 scale-[1.02]'
                  : 'border-white/10 bg-[#12121a] hover:border-white/20 hover:bg-[#12121a]/80'
              )}
            >
              <div
                className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300',
                  isDragOver
                    ? 'bg-gradient-to-br from-purple-600 to-cyan-500 scale-110'
                    : 'bg-white/5'
                )}
              >
                <Upload
                  className={cn(
                    'w-8 h-8 transition-colors',
                    isDragOver ? 'text-white' : 'text-white/30'
                  )}
                />
              </div>
              <div className="text-center">
                <p className="text-white/70 text-sm font-medium">
                  Arrastra una imagen aquí o haz clic para subir
                </p>
                <p className="text-white/30 text-xs mt-1">PNG, JPG, WEBP · Máximo 20MB</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
              />
            </div>
          ) : afterImage ? (
            /* Before/After slider */
            <BeforeAfterSlider
              beforeImage={beforeImage}
              afterImage={afterImage}
              className="w-full max-w-4xl aspect-[4/3] rounded-2xl"
            />
          ) : (
            /* Show uploaded image (before only) */
            <div className="relative w-full max-w-2xl aspect-[4/3] rounded-2xl overflow-hidden">
              <img
                src={beforeImage}
                alt="Imagen original"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white/80 text-xs font-medium tracking-wide uppercase">
                Original
              </div>
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]/60 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                      <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-b-cyan-400/50 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-400 animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="text-white/80 text-sm font-medium">
                        {activeAction === 'relight' && 'Reiluminando...'}
                        {activeAction === 'style-transfer' && 'Transfiriendo estilo...'}
                        {activeAction === 'enhance' && 'Mejorando imagen...'}
                      </p>
                      <p className="text-white/30 text-xs mt-1">Esto puede tomar unos segundos</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side - Controls panel */}
        <div className="w-full lg:w-[380px] xl:w-[420px] border-t lg:border-t-0 lg:border-l border-white/5 bg-[#12121a]/50 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {/* Presets */}
            <PresetSelector selectedPreset={selectedPreset} onSelectPreset={handlePresetSelect} />

            {/* Divider */}
            <div className="h-px bg-white/5" />

            {/* Enhance controls */}
            <EnhanceControls
              settings={settings}
              onSettingsChange={setSettings}
              onEnhance={handleEnhance}
              isProcessing={isProcessing}
            />
          </div>

          {/* Action buttons at bottom of controls */}
          {beforeImage && (
            <div className="p-4 sm:p-5 border-t border-white/5 space-y-3">
              {/* Error message */}
              {error && (
                <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {error}
                </div>
              )}

              {/* Secondary actions */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRelight}
                  disabled={isProcessing}
                  className="bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06] hover:border-white/20"
                >
                  <Sun className="w-3.5 h-3.5 mr-1" />
                  Relight
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStyleTransfer}
                  disabled={isProcessing}
                  className="bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06] hover:border-white/20"
                >
                  <Palette className="w-3.5 h-3.5 mr-1" />
                  Estilo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleVariations}
                  disabled={isProcessing || !afterImage}
                  className="bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06] hover:border-white/20"
                >
                  <Shuffle className="w-3.5 h-3.5 mr-1" />
                  Varias
                </Button>
              </div>

              {/* Export button */}
              {afterImage && (
                <Button
                  onClick={handleExport}
                  className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Imagen
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
