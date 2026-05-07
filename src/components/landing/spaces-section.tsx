"use client";

import { ArrowRight, GitBranch, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: GitBranch,
    title: "Flujos de trabajo reproducibles",
    description: "Conecta herramientas de IA en pipelines automatizados que puedes reutilizar y compartir.",
  },
  {
    icon: Users,
    title: "Colaboración en equipo",
    description: "Trabaja en tiempo real con tu equipo en el mismo canvas de IA.",
  },
  {
    icon: CheckCircle2,
    title: "Resultados consistentes",
    description: "Mantén la coherencia visual y de estilo en todos tus proyectos.",
  },
];

export function SpacesSection() {
  return (
    <section id="spaces" className="relative bg-[#0a0a0f] py-24 sm:py-32 overflow-hidden">
      {/* Background accent */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-violet-600/5 blur-[120px]" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300 mb-6">
              <GitBranch className="h-3 w-3" />
              Nuevo: Spaces
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Spaces: Tu proceso
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                creativo en un canvas
              </span>
            </h2>
            <p className="mt-4 text-lg text-zinc-400 leading-relaxed">
              Un canvas basado en nodos donde conectas herramientas de IA en flujos de trabajo visuales. 
              Automatiza tu proceso creativo, desde la idea hasta el resultado final.
            </p>

            <div className="mt-8 space-y-5">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600/20 to-cyan-600/20 border border-violet-500/20">
                    <feature.icon className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="mt-0.5 text-sm text-zinc-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="mt-8 h-12 bg-gradient-to-r from-violet-600 to-cyan-500 px-8 text-white border-0 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:opacity-90 transition-all"
            >
              Probar Spaces
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Right: Canvas Visual Preview */}
          <div className="relative">
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm shadow-2xl">
              {/* Canvas Header */}
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
                <span className="ml-2 text-xs text-zinc-600">Spaces Canvas</span>
              </div>

              {/* Nodes Visualization */}
              <div className="relative aspect-[4/3] rounded-xl border border-white/5 bg-black/40 overflow-hidden">
                {/* Grid background */}
                <div
                  className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />

                {/* SVG Connections */}
                <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="conn1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  {/* Connection lines */}
                  <path d="M 130 80 C 180 80, 180 50, 230 50" fill="none" stroke="url(#conn1)" strokeWidth="2" opacity="0.6" />
                  <path d="M 130 80 C 180 80, 180 130, 230 130" fill="none" stroke="url(#conn1)" strokeWidth="2" opacity="0.6" />
                  <path d="M 340 50 C 380 50, 380 80, 410 80" fill="none" stroke="url(#conn1)" strokeWidth="2" opacity="0.6" />
                  <path d="M 340 130 C 380 130, 380 80, 410 80" fill="none" stroke="url(#conn1)" strokeWidth="2" opacity="0.6" />
                  <path d="M 520 80 C 560 80, 560 60, 590 60" fill="none" stroke="url(#conn1)" strokeWidth="2" opacity="0.6" />
                  <path d="M 520 80 C 560 80, 560 150, 590 150" fill="none" stroke="url(#conn1)" strokeWidth="2" opacity="0.6" />
                  {/* Animated dots on paths */}
                  <circle r="3" fill="#8b5cf6">
                    <animateMotion dur="3s" repeatCount="indefinite" path="M 130 80 C 180 80, 180 50, 230 50" />
                  </circle>
                  <circle r="3" fill="#06b6d4">
                    <animateMotion dur="2.5s" repeatCount="indefinite" path="M 340 130 C 380 130, 380 80, 410 80" />
                  </circle>
                </svg>

                {/* Node: Text Input */}
                <div className="absolute left-6 top-[22%] sm:left-8 sm:top-[25%] rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-violet-400" />
                    <span className="text-[10px] sm:text-xs font-medium text-violet-300">Texto IA</span>
                  </div>
                  <p className="mt-1 text-[8px] sm:text-[10px] text-violet-400/60">Prompt input</p>
                </div>

                {/* Node: Image Gen */}
                <div className="absolute left-[28%] top-[8%] sm:left-[30%] sm:top-[10%] rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-cyan-400" />
                    <span className="text-[10px] sm:text-xs font-medium text-cyan-300">Imagen IA</span>
                  </div>
                  <p className="mt-1 text-[8px] sm:text-[10px] text-cyan-400/60">Generar imagen</p>
                </div>

                {/* Node: Style Transfer */}
                <div className="absolute left-[28%] top-[55%] sm:left-[30%] sm:top-[58%] rounded-lg border border-pink-500/30 bg-pink-500/10 px-3 py-2 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-pink-400" />
                    <span className="text-[10px] sm:text-xs font-medium text-pink-300">Estilo</span>
                  </div>
                  <p className="mt-1 text-[8px] sm:text-[10px] text-pink-400/60">Transferir estilo</p>
                </div>

                {/* Node: Upscaler */}
                <div className="absolute left-[53%] top-[25%] sm:left-[55%] sm:top-[25%] rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] sm:text-xs font-medium text-emerald-300">Upscaler</span>
                  </div>
                  <p className="mt-1 text-[8px] sm:text-[10px] text-emerald-400/60">Escalar 4x</p>
                </div>

                {/* Node: Output */}
                <div className="absolute right-4 top-[15%] sm:right-8 sm:top-[15%] rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="text-[10px] sm:text-xs font-medium text-amber-300">Salida</span>
                  </div>
                  <p className="mt-1 text-[8px] sm:text-[10px] text-amber-400/60">Resultado final</p>
                </div>

                {/* Node: 3D Convert */}
                <div className="absolute right-4 top-[60%] sm:right-8 sm:top-[62%] rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-2 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-fuchsia-400" />
                    <span className="text-[10px] sm:text-xs font-medium text-fuchsia-300">3D</span>
                  </div>
                  <p className="mt-1 text-[8px] sm:text-[10px] text-fuchsia-400/60">Imagen a 3D</p>
                </div>
              </div>
            </div>
            {/* Decorative glow behind the canvas */}
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-violet-600/10 via-purple-600/5 to-cyan-600/10 blur-2xl" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
