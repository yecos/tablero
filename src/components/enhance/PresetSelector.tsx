'use client'

import { cn } from '@/lib/utils'
import {
  User,
  Building2,
  Lamp,
  Armchair,
  Package,
  Camera,
  Palette,
  Wand2,
  Box,
  ShoppingBag,
} from 'lucide-react'
import type { EnhanceSettings } from './EnhanceControls'

export interface Preset {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  gradient: string
  settings: Partial<EnhanceSettings>
}

export const presets: Preset[] = [
  {
    id: 'portrait',
    name: 'Portrait',
    description: 'Rostros y retratos',
    icon: <User className="w-4 h-4" />,
    gradient: 'from-pink-500 to-rose-500',
    settings: { creativity: 4, resemblance: 8, hdr: 3, fractality: 2 },
  },
  {
    id: 'architecture',
    name: 'Architecture',
    description: 'Arquitectura y edificios',
    icon: <Building2 className="w-4 h-4" />,
    gradient: 'from-purple-500 to-violet-500',
    settings: { creativity: 6, resemblance: 8, hdr: 5, fractality: 3 },
  },
  {
    id: 'interior',
    name: 'Interior',
    description: 'Diseño interior',
    icon: <Lamp className="w-4 h-4" />,
    gradient: 'from-amber-500 to-orange-500',
    settings: { creativity: 5, resemblance: 7, hdr: 4, fractality: 2 },
  },
  {
    id: 'furniture',
    name: 'Furniture',
    description: 'Mobiliario y muebles',
    icon: <Armchair className="w-4 h-4" />,
    gradient: 'from-emerald-500 to-teal-500',
    settings: { creativity: 5, resemblance: 9, hdr: 4, fractality: 2 },
  },
  {
    id: 'product',
    name: 'Product',
    description: 'Productos ecommerce',
    icon: <Package className="w-4 h-4" />,
    gradient: 'from-blue-500 to-indigo-500',
    settings: { creativity: 3, resemblance: 9, hdr: 4, fractality: 1 },
  },
  {
    id: 'realistic',
    name: 'Realistic',
    description: 'Foto realista',
    icon: <Camera className="w-4 h-4" />,
    gradient: 'from-cyan-500 to-blue-500',
    settings: { creativity: 4, resemblance: 9, hdr: 5, fractality: 2 },
  },
  {
    id: 'illustration',
    name: 'Illustration',
    description: 'Ilustraciones',
    icon: <Palette className="w-4 h-4" />,
    gradient: 'from-fuchsia-500 to-pink-500',
    settings: { creativity: 8, resemblance: 5, hdr: 2, fractality: 4 },
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    description: 'Arte fantasy/sci-fi',
    icon: <Wand2 className="w-4 h-4" />,
    gradient: 'from-violet-500 to-purple-500',
    settings: { creativity: 9, resemblance: 4, hdr: 3, fractality: 5 },
  },
  {
    id: 'render',
    name: 'Render',
    description: 'Render a fotorrealista',
    icon: <Box className="w-4 h-4" />,
    gradient: 'from-teal-500 to-emerald-500',
    settings: { creativity: 7, resemblance: 6, hdr: 5, fractality: 3 },
  },
  {
    id: 'ecommerce',
    name: 'Ecommerce',
    description: 'Fondo blanco, studio',
    icon: <ShoppingBag className="w-4 h-4" />,
    gradient: 'from-slate-400 to-slate-500',
    settings: { creativity: 3, resemblance: 9, hdr: 3, fractality: 1 },
  },
]

interface PresetSelectorProps {
  selectedPreset: string | null
  onSelectPreset: (preset: Preset) => void
}

export default function PresetSelector({ selectedPreset, onSelectPreset }: PresetSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 px-1">
        Presets
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset)}
            className={cn(
              'group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200',
              'border text-left',
              selectedPreset === preset.id
                ? 'bg-white/10 border-purple-500/50 shadow-lg shadow-purple-500/10'
                : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 transition-transform duration-200',
                preset.gradient,
                selectedPreset === preset.id ? 'scale-110' : 'group-hover:scale-105'
              )}
            >
              <span className="text-white">{preset.icon}</span>
            </div>
            <div className="min-w-0">
              <div
                className={cn(
                  'text-xs font-semibold truncate',
                  selectedPreset === preset.id ? 'text-white' : 'text-white/70'
                )}
              >
                {preset.name}
              </div>
              <div className="text-[10px] text-white/30 truncate">{preset.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
