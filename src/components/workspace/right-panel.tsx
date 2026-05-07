'use client'

import { usePathname } from 'next/navigation'
import {
  Settings,
  Info,
  Layers,
  Sliders,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function WorkspaceRightPanel() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const getPanelContent = () => {
    if (pathname === '/app/spaces') {
      return (
        <div className="p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white/80">Propiedades del Espacio</h3>
          <div className="space-y-3">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-white/40 mb-1">Nodos</p>
              <p className="text-sm text-white/80">Arrastra nodos desde la paleta al canvas</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-white/40 mb-1">Conexiones</p>
              <p className="text-sm text-white/80">Conecta puertos de salida con entrada</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-white/40 mb-1">Ejecución</p>
              <p className="text-sm text-white/80">Ejecuta el flujo completo con un clic</p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="p-4 space-y-4">
        <h3 className="text-sm font-semibold text-white/80">Propiedades</h3>
        <div className="space-y-3">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-[#8b5cf6]" />
              <p className="text-xs font-medium text-white/60">Información</p>
            </div>
            <p className="text-xs text-white/40">
              Selecciona un elemento para ver sus propiedades aquí.
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-[#06b6d4]" />
              <p className="text-xs font-medium text-white/60">Capas</p>
            </div>
            <p className="text-xs text-white/40">
              Las capas aparecerán aquí cuando generes contenido.
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="h-4 w-4 text-[#8b5cf6]" />
              <p className="text-xs font-medium text-white/60">Ajustes</p>
            </div>
            <p className="text-xs text-white/40">
              Los ajustes avanzados se mostrarán según la herramienta seleccionada.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (collapsed) {
    return (
      <aside className="w-12 border-l border-white/10 bg-[#0d0d14]/80 backdrop-blur-xl flex flex-col items-center py-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5"
          onClick={() => setCollapsed(false)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </aside>
    )
  }

  return (
    <aside className="w-[320px] border-l border-white/10 bg-[#0d0d14]/80 backdrop-blur-xl flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-white/40" />
          <span className="text-sm font-medium text-white/60">Panel de Propiedades</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white/30 hover:text-white hover:bg-white/5"
          onClick={() => setCollapsed(true)}
        >
          <span className="text-lg leading-none">&times;</span>
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {getPanelContent()}
      </div>
    </aside>
  )
}
