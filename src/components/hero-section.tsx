'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Play } from 'lucide-react'

interface HeroSectionProps {
  onStartCreating: () => void
}

export function HeroSection({ onStartCreating }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[#0a0a0f]" />
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-500/10 rounded-full blur-[150px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/10 backdrop-blur-sm animate-bounce" style={{ animationDuration: '6s' }} />
        <div className="absolute top-[25%] right-[15%] w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400/20 to-cyan-500/20 border border-cyan-500/10 backdrop-blur-sm animate-bounce" style={{ animationDuration: '8s', animationDelay: '1s' }} />
        <div className="absolute bottom-[30%] left-[20%] w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/10 backdrop-blur-sm animate-bounce" style={{ animationDuration: '7s', animationDelay: '2s' }} />
        <div className="absolute bottom-[20%] right-[10%] w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 border border-violet-500/10 backdrop-blur-sm animate-bounce" style={{ animationDuration: '9s', animationDelay: '0.5s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          The World&apos;s First AI Design Agent
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
          <span className="text-white">The AI Design Agent</span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            That Creates For You
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          From logo to full marketing campaign in one conversation. Describe your vision, 
          get professional designs instantly.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={onStartCreating}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white border-0 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 text-base px-8 py-6"
          >
            Start Creating Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white hover:border-white/20 transition-all duration-300 text-base px-8 py-6"
          >
            <Play className="mr-2 w-5 h-5" />
            Watch Demo
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-12 text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <span className="text-white font-semibold">100K+</span> Creators
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="flex items-center gap-2">
            <span className="text-white font-semibold">4.9★</span> Rating
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="flex items-center gap-2">
            <span className="text-white font-semibold">Free</span> to start
          </span>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
    </section>
  )
}
