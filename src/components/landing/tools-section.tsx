"use client";

import React from "react";
import {
  Image,
  Video,
  Mic,
  Box,
  LayoutGrid,
  Wand2,
  Pencil,
  Maximize2,
  Expand,
  ImageMinus,
  Film,
  Camera,
  PenTool,
  Speaker,
  AudioLines,
  Music,
  Cuboid,
  Workflow,
  Palette,
  Layers,
  Shapes,
} from "lucide-react";

interface Tool {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

interface ToolCategory {
  category: string;
  icon: React.ElementType;
  tools: Tool[];
}

const toolCategories: ToolCategory[] = [
  {
    category: "Imagen",
    icon: Image,
    tools: [
      { icon: Wand2, title: "Generador IA", description: "Crea imágenes desde texto con IA", color: "from-violet-500 to-purple-600" },
      { icon: Pencil, title: "Editor", description: "Edita y transforma con precisión", color: "from-purple-500 to-pink-600" },
      { icon: Maximize2, title: "Upscaler", description: "Escala hasta 4x sin perder calidad", color: "from-pink-500 to-rose-600" },
      { icon: Expand, title: "Extender", description: "Expande imágenes más allá del borde", color: "from-rose-500 to-orange-600" },
      { icon: ImageMinus, title: "Fondo Transparente", description: "Elimina fondos automáticamente", color: "from-orange-500 to-amber-600" },
      { icon: Camera, title: "Foto Cinemática", description: "Estilo cinematográfico profesional", color: "from-amber-500 to-yellow-600" },
      { icon: PenTool, title: "Sketch a Imagen", description: "Convierte bocetos en arte final", color: "from-yellow-500 to-lime-600" },
    ],
  },
  {
    category: "Vídeo",
    icon: Video,
    tools: [
      { icon: Film, title: "Generador de Vídeo IA", description: "Crea vídeos desde texto o imagen", color: "from-cyan-500 to-blue-600" },
      { icon: Maximize2, title: "Upscaler de Vídeo", description: "Mejora la resolución de vídeos", color: "from-blue-500 to-indigo-600" },
    ],
  },
  {
    category: "Audio",
    icon: Mic,
    tools: [
      { icon: Speaker, title: "Texto a Voz", description: "Voces realistas en 20+ idiomas", color: "from-emerald-500 to-teal-600" },
      { icon: AudioLines, title: "Clonación de Voz", description: "Clona cualquier voz con muestras", color: "from-teal-500 to-cyan-600" },
      { icon: Music, title: "Efectos de Sonido", description: "Genera efectos de sonido únicos", color: "from-cyan-500 to-sky-600" },
      { icon: Music, title: "Música", description: "Crea bandas sonoras con IA", color: "from-sky-500 to-blue-600" },
    ],
  },
  {
    category: "3D",
    icon: Box,
    tools: [
      { icon: Cuboid, title: "Imagen a 3D", description: "Convierte imágenes en modelos 3D", color: "from-fuchsia-500 to-purple-600" },
    ],
  },
  {
    category: "Herramientas",
    icon: LayoutGrid,
    tools: [
      { icon: Workflow, title: "Spaces", description: "Canvas de nodos para flujos de trabajo", color: "from-violet-500 to-cyan-500" },
      { icon: Palette, title: "Editor de Diseño", description: "Diseña con herramientas profesionales", color: "from-cyan-500 to-emerald-500" },
      { icon: Layers, title: "Mockups", description: "Crea mockups de producto al instante", color: "from-emerald-500 to-lime-500" },
      { icon: Shapes, title: "Iconos", description: "Genera iconos consistentes al instante", color: "from-lime-500 to-yellow-500" },
    ],
  },
];

export function ToolsSection() {
  return (
    <section id="herramientas" className="relative bg-[#0a0a0f] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Una sola plataforma para
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              crear cualquier cosa
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
            Más de 20 herramientas de IA integradas en un solo lugar. Genera, edita y transforma contenido como nunca antes.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="mt-16 space-y-10">
          {toolCategories.map((category) => (
            <div key={category.category}>
              {/* Category Header */}
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                  {React.createElement(category.icon, { className: "h-4 w-4 text-zinc-400" })}
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  {category.category}
                </h3>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {/* Tools Cards */}
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {category.tools.map((tool) => (
                  <div
                    key={tool.title}
                    className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.05] cursor-pointer"
                  >
                    {/* Hover Glow */}
                    <div
                      className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${tool.color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`}
                    />

                    <div className="relative z-10 flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${tool.color as string} shadow-lg`}>
                        {React.createElement(tool.icon, { className: "h-5 w-5 text-white" })}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-white text-sm">{tool.title}</h4>
                        <p className="mt-0.5 text-xs text-zinc-500 leading-relaxed">{tool.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
