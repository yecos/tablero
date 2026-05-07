'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Sparkles, Menu, X, ChevronDown, Image, Film, Music, ZoomIn, Box, Tag, MessageSquare, LayoutGrid, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const tools = [
  { id: 'image', name: 'Generador de Imágenes', icon: Image, href: '/tools/image', desc: 'Crea imágenes increíbles con IA', color: 'from-purple-500 to-pink-500' },
  { id: 'video', name: 'Generador de Video', icon: Film, href: '/tools/video', desc: 'Produce videos con IA', color: 'from-cyan-500 to-blue-500' },
  { id: 'chat', name: 'Chat IA', icon: MessageSquare, href: '/tools/chat', desc: 'Asistente inteligente', color: 'from-green-500 to-emerald-500' },
  { id: 'audio', name: 'Generador de Audio', icon: Music, href: '/tools/audio', desc: 'Audio y música con IA', color: 'from-orange-500 to-red-500' },
  { id: 'upscale', name: 'Mejorar Imagen', icon: ZoomIn, href: '/tools/upscale', desc: 'Sube la resolución', color: 'from-violet-500 to-purple-500' },
  { id: '3d', name: 'Convertir a 3D', icon: Box, href: '/tools/3d', desc: 'Modelos 3D desde imágenes', color: 'from-blue-500 to-indigo-500' },
  { id: 'brand-kit', name: 'Kit de Marca', icon: Tag, href: '/tools/brand-kit', desc: 'Identidad visual completa', color: 'from-pink-500 to-rose-500' },
]

interface NavbarProps {
  onStartCreating?: () => void
}

export function Navbar({ onStartCreating }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-[#0a0a0f]/90 backdrop-blur-2xl border-b border-white/5'
        : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Tablero
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {/* Tools Dropdown */}
            <div className="relative" onMouseEnter={() => setToolsOpen(true)} onMouseLeave={() => setToolsOpen(false)}>
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                <Zap className="w-4 h-4 text-purple-400" />
                Herramientas
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', toolsOpen && 'rotate-180')} />
              </button>

              {toolsOpen && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-[#12121a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/40">
                  {tools.map(tool => (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                      onClick={() => setToolsOpen(false)}
                    >
                      <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0', tool.color)}>
                        <tool.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">{tool.name}</div>
                        <div className="text-[11px] text-white/40">{tool.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/spaces" className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all">
              <LayoutGrid className="w-4 h-4 text-cyan-400" />
              Spaces
            </Link>

            <a href="#pricing" className="px-3 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all">
              Precios
            </a>
          </div>

          {/* CTA + Mobile */}
          <div className="flex items-center gap-3">
            <Link
              href="/tools/image"
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              Crear con IA
            </Link>
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#12121a]/95 backdrop-blur-2xl border border-white/5 rounded-2xl mt-2 p-4 space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-white/30 px-3 py-2">Herramientas IA</div>
            {tools.map(tool => (
              <Link key={tool.id} href={tool.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center', tool.color)}>
                  <tool.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-white">{tool.name}</span>
              </Link>
            ))}
            <div className="border-t border-white/5 pt-2 mt-2">
              <Link href="/spaces" className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-white" onClick={() => setMobileMenuOpen(false)}>
                <LayoutGrid className="w-4 h-4 text-cyan-400" /> Spaces
              </Link>
            </div>
            <Link href="/tools/image" className="block text-center bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl mt-2" onClick={() => setMobileMenuOpen(false)}>
              Crear con IA
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
