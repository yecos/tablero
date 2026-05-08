'use client'

import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Sparkles, Wand2, Eye, Sun, Snowflake, Maximize2, Gauge } from 'lucide-react'

export interface EnhanceSettings {
  prompt: string
  creativity: number
  resemblance: number
  hdr: number
  fractality: number
  scale: 2 | 4
  precisionMode: boolean
}

interface EnhanceControlsProps {
  settings: EnhanceSettings
  onSettingsChange: (settings: EnhanceSettings) => void
  onEnhance: () => void
  isProcessing: boolean
}

interface SliderConfig {
  key: keyof EnhanceSettings
  label: string
  description: string
  icon: React.ReactNode
  min: number
  max: number
  step: number
  color: string
}

const sliders: SliderConfig[] = [
  {
    key: 'creativity',
    label: 'Creatividad',
    description: 'Controla cuánto inventa la IA',
    icon: <Wand2 className="w-3.5 h-3.5" />,
    min: 0,
    max: 10,
    step: 0.5,
    color: 'from-purple-600 to-purple-400',
  },
  {
    key: 'resemblance',
    label: 'Parecido',
    description: 'Qué tanto se parece al original',
    icon: <Eye className="w-3.5 h-3.5" />,
    min: 0,
    max: 10,
    step: 0.5,
    color: 'from-cyan-600 to-cyan-400',
  },
  {
    key: 'hdr',
    label: 'HDR',
    description: 'Microcontraste y profundidad',
    icon: <Sun className="w-3.5 h-3.5" />,
    min: 0,
    max: 10,
    step: 0.5,
    color: 'from-amber-600 to-amber-400',
  },
  {
    key: 'fractality',
    label: 'Fractalidad',
    description: 'Complejidad y microdetalles',
    icon: <Snowflake className="w-3.5 h-3.5" />,
    min: 0,
    max: 10,
    step: 0.5,
    color: 'from-emerald-600 to-emerald-400',
  },
]

function GradientSlider({
  value,
  min,
  max,
  step,
  color,
  onChange,
}: {
  value: number
  min: number
  max: number
  step: number
  color: string
  onChange: (v: number) => void
}) {
  const percent = ((value - min) / (max - min)) * 100

  return (
    <div className="relative w-full h-6 flex items-center">
      <div className="relative w-full h-1.5 rounded-full bg-white/10">
        <div
          className={cn('absolute top-0 left-0 h-full rounded-full bg-gradient-to-r', color)}
          style={{ width: `${percent}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="absolute w-full h-6 opacity-0 cursor-pointer z-10"
      />
      <div
        className={cn(
          'absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg shadow-black/30 z-[5] pointer-events-none',
          'ring-2 ring-white/20'
        )}
        style={{ left: `calc(${percent}% - 8px)` }}
      />
    </div>
  )
}

export default function EnhanceControls({
  settings,
  onSettingsChange,
  onEnhance,
  isProcessing,
}: EnhanceControlsProps) {
  const updateSetting = (key: keyof EnhanceSettings, value: number | string | boolean) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-1 pb-4 space-y-5 max-h-[calc(100vh-220px)]">
        {/* Prompt */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Guía de Prompt
          </label>
          <Textarea
            value={settings.prompt}
            onChange={(e) => updateSetting('prompt', e.target.value)}
            placeholder="Describe cómo mejorar la imagen..."
            className="min-h-[80px] bg-[#0a0a0f] border-white/10 text-white/90 placeholder:text-white/30 text-sm resize-none focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50"
          />
        </div>

        {/* Sliders */}
        {sliders.map((slider) => {
          const val = settings[slider.key] as number
          return (
            <div key={slider.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white/50">{slider.icon}</span>
                  <span className="text-sm font-medium text-white/80">{slider.label}</span>
                </div>
                <span className="text-sm font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                  {val}
                </span>
              </div>
              <GradientSlider
                value={val}
                min={slider.min}
                max={slider.max}
                step={slider.step}
                color={slider.color}
                onChange={(v) => updateSetting(slider.key, v)}
              />
              <p className="text-[11px] text-white/30">{slider.description}</p>
            </div>
          )
        })}

        {/* Scale selector */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-3.5 h-3.5 text-white/50" />
            <span className="text-sm font-medium text-white/80">Escala</span>
          </div>
          <div className="flex gap-2">
            {[2, 4].map((s) => (
              <button
                key={s}
                onClick={() => updateSetting('scale', s)}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                  settings.scale === s
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 border border-white/5'
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Precision Mode toggle */}
        <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-2.5">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-sm font-medium text-white/80">Precision Mode</div>
              <div className="text-[11px] text-white/30">Más pasos, mejor calidad</div>
            </div>
          </div>
          <Switch
            checked={settings.precisionMode}
            onCheckedChange={(checked) => updateSetting('precisionMode', checked)}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-cyan-500"
          />
        </div>
      </div>

      {/* Enhance button */}
      <div className="pt-4 border-t border-white/5">
        <button
          onClick={onEnhance}
          disabled={isProcessing}
          className={cn(
            'w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300',
            'bg-gradient-to-r from-purple-600 to-cyan-500 text-white',
            'shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:from-purple-500 hover:to-cyan-400',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-purple-500/20',
            'flex items-center justify-center gap-2'
          )}
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Mejorar Imagen
            </>
          )}
        </button>
      </div>
    </div>
  )
}
