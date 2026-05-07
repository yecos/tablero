'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight, Image, Film, Music, ZoomIn, Box, Tag, MessageSquare, Play, Star, Users, Zap, Globe, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const tools = [
  { id: 'image', name: 'Generador de Imágenes', icon: Image, href: '/tools/image', desc: 'Crea imágenes fotorrealistas, ilustraciones, logos y más con los modelos de IA más avanzados', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10' },
  { id: 'video', name: 'Generador de Video', icon: Film, href: '/tools/video', desc: 'Transforma tus ideas en videos impresionantes con inteligencia artificial', color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-500/10' },
  { id: 'chat', name: 'Chat IA', icon: MessageSquare, href: '/tools/chat', desc: 'Tu asistente creativo inteligente que entiende diseño y te ayuda a crear', color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10' },
  { id: 'audio', name: 'Generador de Audio', icon: Music, href: '/tools/audio', desc: 'Genera música, efectos de sonido y voces con IA para tus proyectos', color: 'from-orange-500 to-red-500', bg: 'bg-orange-500/10' },
  { id: 'upscale', name: 'Mejorar Imagen', icon: ZoomIn, href: '/tools/upscale', desc: 'Aumenta la resolución de cualquier imagen hasta 4x manteniendo la calidad', color: 'from-violet-500 to-purple-500', bg: 'bg-violet-500/10' },
  { id: '3d', name: 'Convertir a 3D', icon: Box, href: '/tools/3d', desc: 'Convierte cualquier imagen en un modelo 3D interactivo en segundos', color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-500/10' },
  { id: 'brand-kit', name: 'Kit de Marca', icon: Tag, href: '/tools/brand-kit', desc: 'Genera identidades visuales completas: colores, tipografía, logo y más', color: 'from-pink-500 to-rose-500', bg: 'bg-pink-500/10' },
]

const stats = [
  { value: '7+', label: 'Herramientas IA' },
  { value: '4', label: 'Proveedores de IA' },
  { value: '∞', label: 'Creaciones' },
  { value: '<30s', label: 'Tiempo promedio' },
]

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[#0a0a0f]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.05),transparent_60%)]" />
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-white/60">Plataforma creativa de IA</span>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">Nuevo</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">Crea lo que </span>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              imagines
            </span>
            <br />
            <span className="text-white">con inteligencia </span>
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              artificial
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            La plataforma completa de herramientas creativas de IA para generar imágenes, vídeos, audio y más. 
            Desde logos hasta campañas completas, todo en un solo lugar.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/tools/image"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-medium px-8 py-4 rounded-2xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] text-lg"
            >
              <Sparkles className="w-5 h-5" />
              Empezar a crear
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/spaces"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-medium px-8 py-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 text-lg"
            >
              <Globe className="w-5 h-5" />
              Ver Spaces
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-xs text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function ToolsSection() {
  return (
    <section id="tools" className="relative py-24 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-300">Suite completa de IA</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Todas las herramientas que necesitas
          </h2>
          <p className="text-white/40 max-w-xl mx-auto">
            Desde generación de imágenes hasta conversión 3D, cada herramienta está diseñada para potenciar tu creatividad
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tools.map((tool, index) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1"
            >
              <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300', tool.color)}>
                <tool.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">{tool.name}</h3>
              <p className="text-sm text-white/40 leading-relaxed mb-4">{tool.desc}</p>
              <div className="flex items-center text-xs text-purple-400 group-hover:text-purple-300 transition-colors">
                <span>Probar ahora</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function SpacesSection() {
  return (
    <section className="relative py-24 bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),transparent_50%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-6">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-cyan-300">Spaces colaborativos</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Organiza tus proyectos en{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Spaces</span>
            </h2>
            <p className="text-white/40 leading-relaxed mb-8">
              Los Spaces son espacios de trabajo donde puedes agregar nodos de IA, ejecutar herramientas y guardar todos tus diseños en un solo lugar. Organiza por proyecto, cliente o temática.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                'Nodos de IA interactivos dentro de cada espacio',
                'Galería automática con todos tus diseños',
                'Ejecuta múltiples herramientas en paralelo',
                'Historial completo de generaciones'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/spaces"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium px-6 py-3 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all duration-300"
            >
              Explorar Spaces
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-lg">🎨</div>
                <div>
                  <h4 className="text-sm font-medium text-white">Mi Campaña Marketing</h4>
                  <p className="text-[10px] text-white/40">3 diseños • Actualizado hace 2h</p>
                </div>
              </div>
              {['Generador de Imágenes', 'Kit de Marca', 'Mejorar Imagen'].map((tool, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center', tools[i]?.color || 'from-purple-500 to-pink-500')}>
                    {i === 0 && <Image className="w-4 h-4 text-white" />}
                    {i === 1 && <Tag className="w-4 h-4 text-white" />}
                    {i === 2 && <ZoomIn className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-white">{tool}</div>
                    <div className="text-[10px] text-white/30">Completado</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function PricingSection() {
  const plans = [
    { name: 'Gratis', price: '$0', period: '/mes', features: ['5 generaciones/día', '1 Space', 'Calidad estándar', 'Chat IA básico'], cta: 'Empezar gratis', popular: false },
    { name: 'Pro', price: '$12', period: '/mes', features: ['Generaciones ilimitadas', '10 Spaces', 'Calidad HD', 'Todos los modelos IA', 'Upscale 4x', 'Sin marcas de agua'], cta: 'Comenzar prueba', popular: true },
    { name: 'Business', price: '$39', period: '/mes', features: ['Todo de Pro', 'Spaces ilimitados', 'API access', 'Prioridad en cola', 'Soporte prioritario', 'Uso comercial'], cta: 'Contactar', popular: false },
  ]

  return (
    <section id="pricing" className="relative py-24 bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.08),transparent_50%)]" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Precios simples y transparentes</h2>
          <p className="text-white/40">Empieza gratis, escala cuando estés listo</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(plan => (
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
                href="/tools/image"
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
  )
}

export function CTASection() {
  return (
    <section className="relative py-24 bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 p-12 sm:p-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Sé <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Magnific</span>
          </h2>
          <p className="text-white/40 max-w-lg mx-auto mb-8">
            La creatividad no tiene límites. Empieza a crear con las herramientas de IA más avanzadas, todo en una plataforma.
          </p>
          <Link
            href="/tools/image"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-medium px-8 py-4 rounded-2xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02]"
          >
            <Sparkles className="w-5 h-5" />
            Crear ahora
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0f] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Tablero</span>
            </div>
            <p className="text-xs text-white/30 leading-relaxed">La plataforma completa de herramientas creativas de IA.</p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-3">Herramientas</h4>
            <ul className="space-y-2">
              {tools.slice(0, 4).map(t => (
                <li key={t.id}><Link href={t.href} className="text-xs text-white/30 hover:text-white/60 transition-colors">{t.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-3">Más</h4>
            <ul className="space-y-2">
              {tools.slice(4).map(t => (
                <li key={t.id}><Link href={t.href} className="text-xs text-white/30 hover:text-white/60 transition-colors">{t.name}</Link></li>
              ))}
              <li><Link href="/spaces" className="text-xs text-white/30 hover:text-white/60 transition-colors">Spaces</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-3">Legal</h4>
            <ul className="space-y-2">
              {['Términos', 'Privacidad', 'Contacto'].map(item => (
                <li key={item}><span className="text-xs text-white/30">{item}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 text-center">
          <p className="text-xs text-white/20">© 2025 Tablero. Plataforma creativa de IA.</p>
        </div>
      </div>
    </footer>
  )
}
