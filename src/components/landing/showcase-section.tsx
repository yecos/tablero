"use client";

import { ArrowUpRight } from "lucide-react";

const showcaseItems = [
  {
    title: "Campaña de Moda AI",
    description: "Fotografía de moda generada con IA para una colección de primavera. Flux Pro + Upscaler.",
    gradient: "from-violet-600/80 to-purple-900/80",
    accentColor: "bg-violet-500",
    pattern: "radial-gradient(circle at 30% 40%, rgba(139,92,246,0.3) 0%, transparent 60%)",
  },
  {
    title: "Vídeo Promocional",
    description: "Vídeo cinematográfico de 30 segundos creado desde un prompt de texto. Kling Video + Audio.",
    gradient: "from-cyan-600/80 to-blue-900/80",
    accentColor: "bg-cyan-500",
    pattern: "radial-gradient(circle at 70% 30%, rgba(6,182,212,0.3) 0%, transparent 60%)",
  },
  {
    title: "Modelado 3D de Producto",
    description: "Modelo 3D interactivo de un producto generado desde una foto real. Hunyuan3D.",
    gradient: "from-fuchsia-600/80 to-pink-900/80",
    accentColor: "bg-fuchsia-500",
    pattern: "radial-gradient(circle at 50% 60%, rgba(217,70,239,0.3) 0%, transparent 60%)",
  },
];

export function ShowcaseSection() {
  return (
    <section className="relative bg-[#0a0a0f] py-24 sm:py-32">
      {/* Background accent */}
      <div className="absolute left-0 top-1/3 h-[400px] w-[400px] rounded-full bg-purple-600/5 blur-[120px]" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Creado con
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Tablero
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
            Mira lo que los creadores están construyendo con nuestras herramientas de IA.
          </p>
        </div>

        {/* Showcase Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {showcaseItems.map((item) => (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] transition-all duration-500 hover:border-white/10 hover:shadow-2xl cursor-pointer"
            >
              {/* Image Placeholder */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background: item.pattern,
                  }}
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />
                {/* Decorative elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full border border-white/20 flex items-center justify-center">
                    <div className={`h-10 w-10 rounded-full ${item.accentColor} animate-pulse`} />
                  </div>
                </div>
                {/* Grid overlay */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 scale-75 group-hover:scale-100">
                    <ArrowUpRight className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5">
                <h3 className="font-semibold text-white text-lg">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
