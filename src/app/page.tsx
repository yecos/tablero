'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight, ZoomIn, Sun, Palette, Layers, Box, Zap, Star, Image, Film, ChevronRight, Upload, SlidersHorizontal, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const features = [
  { icon: ZoomIn, title: 'AI Upscale', desc: 'Sube resolución hasta 4K/8K con IA generativa que inventa detalles reales', color: 'from-purple-500 to-pink-500' },
  { icon: SlidersHorizontal, title: 'Creativity Slider', desc: 'Controla cuánto "inventa" la IA, desde sutil hasta transformador', color: 'from-cyan-500 to-blue-500' },
  { icon: Sun, title: 'Relight IA', desc: 'Cambia iluminación, sombras y atmósfera con un prompt', color: 'from-amber-500 to-orange-500' },
  { icon: Palette, title: 'Style Transfer', desc: 'Transforma renders a fotorrealista, bocetos a fotografía', color: 'from-emerald-500 to-teal-500' },
  { icon: Eye, title: 'Before / After', desc: 'Comparador interactivo con deslizador y zoom al detalle', color: 'from-violet-500 to-purple-500' },
  { icon: Layers, title: 'Presets Pro', desc: 'Arquitectura, Interior, Mobiliario, Ecommerce y más', color: 'from-pink-500 to-rose-500' },
]

const presets = [
  { name: 'Arquitectura', desc: 'Edificios, fachadas, espacios', icon: '🏛️' },
  { name: 'Interior', desc: 'Diseño interior, decoración', icon: '🛋️' },
  { name: 'Mobiliario', desc: 'Muebles, piezas decorativas', icon: '🪑' },
  { name: 'Render→Real', desc: 'Convierte renders a foto real', icon: '✨' },
  { name: 'Ecommerce', desc: 'Fondo blanco, studio lighting', icon: '📦' },
  { name: 'Producto', desc: 'Productos profesionales', icon: '💎' },
]

const stats = [
  { value: '16x', label: 'Upscale máximo' },
  { value: '<30s', label: 'Tiempo promedio' },
  { value: '4K+', label: 'Resolución salida' },
  { value: '10+', label: 'Presets especializados' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Tablero</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-white/50 hover:text-white transition-colors">Funciones</a>
              <a href="#presets" className="text-sm text-white/50 hover:text-white transition-colors">Presets</a>
              <a href="#pricing" className="text-sm text-white/50 hover:text-white transition-colors">Precios</a>
              <Link href="/spaces" className="text-sm text-white/50 hover:text-white transition-colors">Spaces</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/enhance" className="text-sm text-white/50 hover:text-white transition-colors hidden sm:block">
                Iniciar sesión
              </Link>
              <Link
                href="/enhance"
                className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Probar gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs text-white/50">IA generativa para imágenes</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">Nuevo</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white">Mejora imágenes con </span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                IA generativa
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed">
              Sube resolución, añade detalles, cambia iluminación y transforma renders a fotorrealista.
              Especializado en arquitectura, interiorismo y mobiliario.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/enhance"
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-medium px-8 py-4 rounded-2xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:scale-[1.02] text-lg"
              >
                <Upload className="w-5 h-5" />
                Subir imagen
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-medium px-8 py-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all text-lg"
              >
                Ver funciones
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto">
              {stats.map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-xs text-white/30 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs text-purple-300">Suite completa de IA</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Todo lo que necesitas para mejorar imágenes
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              No es solo upscale — es IA generativa que inventa detalles, cambia iluminación y transforma estilos
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-white/15 hover:bg-white/[0.04] hover:-translate-y-1"
              >
                <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 group-hover:scale-110 transition-transform', feature.color)}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Presets */}
      <section id="presets" className="py-24 bg-[#0a0a0f]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.06),transparent_50%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Presets para <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">tu sector</span>
            </h2>
            <p className="text-white/40">Configuraciones optimizadas para cada tipo de imagen</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {presets.map(preset => (
              <div key={preset.name} className="group rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all cursor-pointer">
                <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">{preset.icon}</span>
                <h3 className="text-sm font-semibold text-white mb-1">{preset.name}</h3>
                <p className="text-xs text-white/40">{preset.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-[#0a0a0f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Precios simples</h2>
            <p className="text-white/40">Empieza gratis, escala cuando estés listo</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Gratis', price: '$0', period: '/mes', features: ['5 mejoras/día', 'Upscale 2x', 'Calidad estándar', 'Presets básicos'], cta: 'Empezar gratis', popular: false },
              { name: 'Pro', price: '$15', period: '/mes', features: ['Mejoras ilimitadas', 'Upscale hasta 4x', 'Creativity slider completo', 'Relight y Style Transfer', 'Todos los presets', 'Sin marca de agua'], cta: 'Comenzar prueba', popular: true },
              { name: 'Business', price: '$49', period: '/mes', features: ['Todo de Pro', 'Upscale hasta 16x', 'API access', 'Batch processing', 'Prioridad en cola', 'Uso comercial'], cta: 'Contactar', popular: false },
            ].map(plan => (
              <div key={plan.name} className={cn(
                'rounded-2xl border p-8 transition-all',
                plan.popular
                  ? 'border-purple-500/30 bg-purple-500/5 shadow-xl shadow-purple-500/10 relative'
                  : 'border-white/10 bg-white/[0.02]'
              )}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-[10px] font-medium px-3 py-1 rounded-full">
                    Más popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/40">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                      <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <div className="w-1 h-1 rounded-full bg-purple-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/enhance"
                  className={cn(
                    'block text-center font-medium py-3 rounded-xl transition-all',
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:from-purple-500 hover:to-cyan-400 shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                  )}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#0a0a0f]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 p-12 sm:p-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Transforma tus <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">imágenes</span> hoy
            </h2>
            <p className="text-white/40 max-w-lg mx-auto mb-8">
              Sube una imagen y ve la magia. IA generativa que añade detalles, mejora resolución y transforma renders a fotorrealista.
            </p>
            <Link
              href="/enhance"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-medium px-8 py-4 rounded-2xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:scale-[1.02]"
            >
              <Upload className="w-5 h-5" />
              Subir imagen ahora
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0a0a0f] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Tablero</span>
            </div>
            <p className="text-xs text-white/20">© 2025 Tablero. IA generativa para imágenes.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
