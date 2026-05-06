'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Star, Users } from 'lucide-react'

interface CtaSectionProps {
  onStartCreating: () => void
}

export function CtaSection({ onStartCreating }: CtaSectionProps) {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
          Ready to Design with{' '}
          <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            AI?
          </span>
        </h2>
        <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
          Join thousands of creators who are already designing faster and better with DesignAI.
          Start creating for free — no credit card required.
        </p>

        <Button
          onClick={onStartCreating}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white border-0 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 text-lg px-10 py-7"
        >
          Start Creating Free
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Users className="w-4 h-4 text-purple-400" />
            <span><span className="text-white font-semibold">100K+</span> Creators</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Star className="w-4 h-4 text-amber-400" />
            <span><span className="text-white font-semibold">4.9★</span> Rating</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span><span className="text-white font-semibold">No Credit Card</span> Required</span>
          </div>
        </div>
      </div>
    </section>
  )
}
