"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f] pt-16">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-orb hero-orb-4" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* Radial fade */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0a0f_70%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex animate-fade-in">
          <Badge
            variant="outline"
            className="gap-1.5 border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 hover:bg-violet-500/20 transition-colors"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            Plataforma #1 de IA Creativa
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          La plataforma creativa
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            de IA para dirigir
          </span>
          <br />
          tu mejor trabajo
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl animate-fade-in-up text-lg text-zinc-400 sm:text-xl" style={{ animationDelay: "0.1s" }}>
          Cada modelo de IA para vídeo, imagen y audio. Flujos de trabajo
          inteligentes para control profesional y colaboración.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex animate-fade-in-up flex-col items-center gap-4 sm:flex-row sm:justify-center" style={{ animationDelay: "0.2s" }}>
          <Link href="/app">
            <Button
              size="lg"
              className="h-12 bg-gradient-to-r from-violet-600 to-cyan-500 px-8 text-base font-semibold text-white border-0 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:opacity-90 transition-all"
            >
              Empezar a crear
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="h-12 border-white/10 bg-white/5 px-8 text-base text-zinc-300 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all"
          >
            <Play className="mr-2 h-4 w-4" />
            Ver demo
          </Button>
        </div>

        {/* Stats bar */}
        <div className="mt-16 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="mx-auto max-w-3xl grid grid-cols-3 gap-4 sm:gap-8">
            {[
              { value: "50M+", label: "Creaciones" },
              { value: "200+", label: "Modelos IA" },
              { value: "500K+", label: "Creadores" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-sm text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
    </section>
  );
}
