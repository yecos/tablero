'use client'

import React from 'react'
import { useProviderStore, type ProviderCategory, type ProviderOption, PROVIDER_OPTIONS } from '@/store/provider-store'
import { cn } from '@/lib/utils'
import { Sparkles, Zap, Shield, ChevronDown } from 'lucide-react'

interface ProviderSelectorProps {
  category: ProviderCategory
  className?: string
  compact?: boolean
}

function QualityBadge({ quality }: { quality: ProviderOption['quality'] }) {
  switch (quality) {
    case 'fast':
      return <Zap className="h-3 w-3 text-amber-400" />
    case 'quality':
      return <Sparkles className="h-3 w-3 text-purple-400" />
    case 'balanced':
      return <Shield className="h-3 w-3 text-blue-400" />
  }
}

export function ProviderSelector({ category, className, compact = false }: ProviderSelectorProps) {
  const { getProvider, setProvider } = useProviderStore()
  const selected = getProvider(category)
  const providers = PROVIDER_OPTIONS.filter((p) => p.category === category)
  const [open, setOpen] = React.useState(false)

  const selectedOption = providers.find((p) => p.name === selected)

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px]',
            'bg-white/5 border border-white/10 hover:bg-white/10 transition-colors',
            className
          )}
        >
          <Sparkles className="h-3 w-3 text-purple-400" />
          <span className="text-slate-300 truncate max-w-[80px]">
            {selectedOption?.label || 'Auto'}
          </span>
          <ChevronDown className="h-3 w-3 text-white/30" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute z-50 mt-1 left-0 w-56 rounded-lg border border-white/10 bg-[#1a1a2e]/95 backdrop-blur-md shadow-xl overflow-hidden">
              {/* Auto option */}
              <button
                onClick={() => { setProvider(category, null); setOpen(false) }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors text-left',
                  !selected && 'bg-purple-500/10'
                )}
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-white/80 font-medium">Auto</div>
                  <div className="text-[10px] text-white/30">Automatic best provider</div>
                </div>
              </button>
              <div className="h-px bg-white/5" />
              {providers.map((provider) => (
                <button
                  key={provider.name}
                  onClick={() => { setProvider(category, provider.name); setOpen(false) }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors text-left',
                    selected === provider.name && 'bg-purple-500/10'
                  )}
                >
                  <QualityBadge quality={provider.quality} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/80 font-medium">{provider.label}</span>
                      {provider.isFree && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-400">FREE</span>
                      )}
                    </div>
                    <div className="text-[10px] text-white/30 truncate">{provider.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-wider text-slate-400">Provider</label>
        <button
          onClick={() => setProvider(category, null)}
          className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
        >
          Reset to Auto
        </button>
      </div>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs',
            'bg-white/5 border border-white/10 hover:bg-white/10 transition-colors',
            className
          )}
        >
          <QualityBadge quality={selectedOption?.quality || 'balanced'} />
          <span className="flex-1 text-left text-white/80">
            {selectedOption?.label || 'Auto (Best Available)'}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-white/30" />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute z-50 mt-1 left-0 w-full rounded-lg border border-white/10 bg-[#1a1a2e]/95 backdrop-blur-md shadow-xl overflow-hidden">
              <button
                onClick={() => { setProvider(category, null); setOpen(false) }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-white/5 transition-colors text-left',
                  !selected && 'bg-purple-500/10'
                )}
              >
                <Sparkles className="h-4 w-4 text-purple-400 shrink-0" />
                <div className="flex-1">
                  <div className="text-white/80 font-medium">Auto</div>
                  <div className="text-[10px] text-white/30">Automatically picks the best available provider</div>
                </div>
              </button>
              <div className="h-px bg-white/5" />
              {providers.map((provider) => (
                <button
                  key={provider.name}
                  onClick={() => { setProvider(category, provider.name); setOpen(false) }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-white/5 transition-colors text-left',
                    selected === provider.name && 'bg-purple-500/10'
                  )}
                >
                  <QualityBadge quality={provider.quality} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/80 font-medium">{provider.label}</span>
                      {provider.isFree && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-400">FREE</span>
                      )}
                      {provider.requiresKey && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400">KEY</span>
                      )}
                    </div>
                    <div className="text-[10px] text-white/30">{provider.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
