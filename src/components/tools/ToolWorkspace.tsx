'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Loader2, Download, Settings2, Image, Film, Music, ZoomIn, Box, Tag, MessageSquare, RotateCcw, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const TOOL_CONFIG: Record<string, { name: string; icon: any; color: string; endpoint: string; placeholder: string; hasImage: boolean; hasNegative: boolean; hasSize: boolean; hasSteps: boolean }> = {
  image: { name: 'Generador de Imágenes', icon: Image, color: 'from-purple-500 to-pink-500', endpoint: '/api/generate-image', placeholder: 'Describe la imagen que quieres crear...', hasImage: false, hasNegative: true, hasSize: true, hasSteps: true },
  video: { name: 'Generador de Video', icon: Film, color: 'from-cyan-500 to-blue-500', endpoint: '/api/generate-video', placeholder: 'Describe el video que quieres crear...', hasImage: true, hasNegative: false, hasSize: false, hasSteps: false },
  chat: { name: 'Chat IA', icon: MessageSquare, color: 'from-green-500 to-emerald-500', endpoint: '/api/chat', placeholder: 'Escribe tu mensaje...', hasImage: false, hasNegative: false, hasSize: false, hasSteps: false },
  audio: { name: 'Generador de Audio', icon: Music, color: 'from-orange-500 to-red-500', endpoint: '/api/generate-audio', placeholder: 'Describe el audio o música que quieres...', hasImage: false, hasNegative: false, hasSize: false, hasSteps: false },
  upscale: { name: 'Mejorar Imagen', icon: ZoomIn, color: 'from-violet-500 to-purple-500', endpoint: '/api/upscale', placeholder: 'Pega la URL de la imagen a mejorar...', hasImage: true, hasNegative: false, hasSize: false, hasSteps: false },
  '3d': { name: 'Convertir a 3D', icon: Box, color: 'from-blue-500 to-indigo-500', endpoint: '/api/image-to-3d', placeholder: 'Pega la URL de la imagen para convertir a 3D...', hasImage: true, hasNegative: false, hasSize: false, hasSteps: false },
  'brand-kit': { name: 'Kit de Marca', icon: Tag, color: 'from-pink-500 to-rose-500', endpoint: '/api/brand-kit', placeholder: 'Describe tu marca, negocio o proyecto...', hasImage: false, hasNegative: false, hasSize: false, hasSteps: false },
}

interface ToolWorkspaceProps {
  toolId: string
}

export default function ToolWorkspace({ toolId }: ToolWorkspaceProps) {
  const config = TOOL_CONFIG[toolId]
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [width, setWidth] = useState(1024)
  const [height, setHeight] = useState(1024)
  const [steps, setSteps] = useState(30)
  const [showSettings, setShowSettings] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<{ url?: string; text?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const generate = useCallback(async () => {
    if (!prompt.trim() && !imageUrl.trim()) return
    setIsGenerating(true)
    setResult(null)
    setError(null)

    try {
      const body: Record<string, unknown> = { prompt }
      if (negativePrompt) body.negativePrompt = negativePrompt
      if (imageUrl) body.image = imageUrl
      if (config.hasSize) { body.width = width; body.height = height }
      if (config.hasSteps) body.steps = steps
      if (toolId === 'chat') body.message = prompt

      const res = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (data.success) {
        setResult({
          url: data.data?.url || data.imageUrl,
          text: data.data?.text || data.text || data.reply,
        })
      } else {
        setError(data.error || 'Error desconocido')
      }
    } catch (e) {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, negativePrompt, imageUrl, width, height, steps, config, toolId])

  const copyResult = () => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white/50">
        <div className="text-center">
          <p className="text-4xl mb-4">🚫</p>
          <h3 className="text-lg font-semibold text-white">Herramienta no encontrada</h3>
          <Link href="/" className="mt-4 inline-block text-purple-400 hover:text-purple-300 text-sm">← Volver al inicio</Link>
        </div>
      </div>
    )
  }

  const IconComp = config.icon

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Top bar */}
      <div className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center', config.color)}>
              <IconComp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold">{config.name}</h1>
              <p className="text-[10px] text-white/30">Potenciado por IA</p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all', showSettings ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5')}
          >
            <Settings2 className="w-3.5 h-3.5" />
            Ajustes
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
        {/* Left: Input panel */}
        <div className="lg:w-[420px] lg:border-r border-white/5 p-6 flex flex-col gap-4 shrink-0">
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={config.placeholder}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 resize-none min-h-[120px]"
              disabled={isGenerating}
            />
          </div>

          {config.hasNegative && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Prompt negativo</label>
              <input
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="Lo que NO quieres ver..."
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-purple-500/40"
                disabled={isGenerating}
              />
            </div>
          )}

          {config.hasImage && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">URL de imagen</label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-purple-500/40"
                disabled={isGenerating}
              />
            </div>
          )}

          {showSettings && (
            <div className="space-y-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
              {config.hasSize && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 uppercase tracking-wider">Ancho</label>
                    <select value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white outline-none">
                      {[512, 768, 864, 1024, 1152, 1344, 1440].map(w => <option key={w} value={w}>{w}px</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 uppercase tracking-wider">Alto</label>
                    <select value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-white outline-none">
                      {[512, 720, 768, 864, 1024, 1152, 1344, 1440].map(h => <option key={h} value={h}>{h}px</option>)}
                    </select>
                  </div>
                </div>
              )}
              {config.hasSteps && (
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider">Pasos: {steps}</label>
                  <input type="range" min={10} max={50} value={steps} onChange={(e) => setSteps(Number(e.target.value))} className="w-full accent-purple-500" />
                </div>
              )}
            </div>
          )}

          <button
            onClick={generate}
            disabled={(!prompt.trim() && !imageUrl.trim()) || isGenerating}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-4 rounded-xl font-medium text-sm transition-all',
              (prompt.trim() || imageUrl.trim()) && !isGenerating
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.01]'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            )}
          >
            {isGenerating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generando...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Generar</>
            )}
          </button>

          <div className="space-y-2">
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Ideas rápidas</p>
            <div className="flex flex-wrap gap-1.5">
              {getQuickIdeas(toolId).map(idea => (
                <button key={idea} onClick={() => setPrompt(idea)} className="text-[10px] px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-white/40 hover:text-white hover:border-purple-500/20 hover:bg-purple-500/5 transition-all">{idea}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Result */}
        <div className="flex-1 p-6 flex items-center justify-center min-h-[400px]">
          {isGenerating ? (
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Sparkles className="w-10 h-10 text-purple-400 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Generando...</h3>
              <p className="text-sm text-white/40">La IA está creando tu contenido</p>
            </div>
          ) : result ? (
            <div className="w-full max-w-2xl space-y-4">
              {result.url && (
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                  <img src={result.url} alt="Resultado" className="w-full h-auto" />
                </div>
              )}
              {result.text && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-white/40">Resultado</span>
                    <button onClick={copyResult} className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <div className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{result.text}</div>
                </div>
              )}
              <div className="flex items-center gap-3">
                {result.url && (
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-4 py-2 rounded-xl border border-white/10 text-sm transition-all">
                    <Download className="w-4 h-4" /> Descargar
                  </a>
                )}
                <button onClick={() => { setResult(null); setPrompt('') }} className="inline-flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> Nuevo
                </button>
              </div>
            </div>
          ) : error ? (
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Algo salió mal</h3>
              <p className="text-sm text-red-300/70 mb-4">{error}</p>
              <button onClick={generate} className="text-sm text-purple-400 hover:text-purple-300">Intentar de nuevo</button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 flex items-center justify-center mx-auto mb-6">
                <IconComp className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-lg font-semibold text-white/50 mb-2">Tu creación aparecerá aquí</h3>
              <p className="text-sm text-white/25">Escribe un prompt y haz clic en Generar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getQuickIdeas(toolId: string): string[] {
  const ideas: Record<string, string[]> = {
    image: ['Logo moderno', 'Foto de producto', 'Ilustración anime', 'Paisaje fantástico', 'Retrato artístico'],
    chat: ['Ayúdame con un logo', 'Idea para campaña', 'Colores para mi marca', 'Texto para redes'],
    'brand-kit': ['Startup tech', 'Cafetería artesanal', 'Marca de ropa', 'Agencia creativa'],
    video: ['Amanecer en la ciudad', 'Naturaleza en timelapse', 'Animación abstracta'],
    audio: ['Música lo-fi', 'Efecto de sonido épico', 'Jingle para podcast'],
    upscale: ['Foto borrosa', 'Captura de pantalla', 'Imagen vintage'],
    '3d': ['Objeto cotidiano', 'Personaje 3D', 'Arquitectura'],
  }
  return ideas[toolId] || ['Crear algo increíble', 'Diseño profesional']
}
