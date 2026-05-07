"use client";

import React from "react";
import { Check, Sparkles, Building2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingTier {
  name: string;
  icon: React.ElementType;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  gradient: string;
}

const tiers: PricingTier[] = [
  {
    name: "Gratis",
    icon: Zap,
    price: "$0",
    period: "/mes",
    description: "Perfecto para empezar a explorar las herramientas de IA.",
    features: [
      "10 generaciones/mes",
      "Modelos básicos de imagen",
      "Editor de imágenes",
      "Comunidad de creadores",
    ],
    cta: "Empezar gratis",
    highlighted: false,
    gradient: "from-zinc-500 to-zinc-600",
  },
  {
    name: "Pro",
    icon: Sparkles,
    price: "$29",
    period: "/mes",
    description: "Para creadores que necesitan potencia y flexibilidad.",
    features: [
      "Generaciones ilimitadas",
      "Todos los modelos de IA",
      "Spaces con canvas ilimitado",
      "Upscaler 4x y extender",
      "Generación de vídeo",
      "Herramientas de audio",
      "Prioridad en cola",
    ],
    cta: "Empezar prueba gratis",
    highlighted: true,
    gradient: "from-violet-500 to-cyan-500",
  },
  {
    name: "Business",
    icon: Building2,
    price: "$99",
    period: "/mes",
    description: "Para equipos y empresas con necesidades avanzadas.",
    features: [
      "Todo lo de Pro",
      "API access completa",
      "Usuarios ilimitados",
      "Soporte dedicado 24/7",
      "Brand kit y estilos",
      "SSO y seguridad avanzada",
      "SLA garantizado",
    ],
    cta: "Contactar ventas",
    highlighted: false,
    gradient: "from-cyan-500 to-emerald-500",
  },
];

export function PricingSection() {
  return (
    <section id="precios" className="relative bg-[#0a0a0f] py-24 sm:py-32">
      {/* Background accent */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[120px]" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Plan para cada
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              creativo
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
            Empieza gratis, escala cuando estés listo. Sin sorpresas ni costes ocultos.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative overflow-hidden rounded-2xl border p-6 sm:p-8 transition-all duration-300 ${
                tier.highlighted
                  ? "border-violet-500/30 bg-gradient-to-b from-violet-500/5 to-transparent shadow-lg shadow-violet-500/5 scale-[1.02] lg:scale-105"
                  : "border-white/5 bg-white/[0.02] hover:border-white/10"
              }`}
            >
              {/* Popular badge */}
              {tier.highlighted && (
                <div className="absolute -right-8 top-4 rotate-45 bg-gradient-to-r from-violet-600 to-cyan-500 px-10 py-1 text-xs font-semibold text-white">
                  Popular
                </div>
              )}

              {/* Tier header */}
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tier.gradient as string}`}>
                  {React.createElement(tier.icon, { className: "h-5 w-5 text-white" })}
                </div>
                <h3 className="text-xl font-bold text-white">{tier.name}</h3>
              </div>

              {/* Price */}
              <div className="mt-6">
                <span className="text-4xl font-bold text-white">{tier.price}</span>
                <span className="text-zinc-500">{tier.period}</span>
              </div>
              <p className="mt-3 text-sm text-zinc-500">{tier.description}</p>

              {/* CTA */}
              <Button
                className={`mt-6 w-full h-11 ${
                  tier.highlighted
                    ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-0 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:opacity-90 transition-all"
                    : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white hover:border-white/20"
                }`}
                variant={tier.highlighted ? "default" : "outline"}
              >
                {tier.cta}
              </Button>

              {/* Features */}
              <div className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <Check className={`h-4 w-4 shrink-0 ${tier.highlighted ? "text-violet-400" : "text-zinc-600"}`} />
                    <span className="text-sm text-zinc-400">{feature}</span>
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
