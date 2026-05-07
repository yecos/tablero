"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Tablero</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#herramientas" className="text-sm text-zinc-400 transition-colors hover:text-white">
            Herramientas
          </a>
          <a href="#spaces" className="text-sm text-zinc-400 transition-colors hover:text-white">
            Spaces
          </a>
          <a href="#modelos" className="text-sm text-zinc-400 transition-colors hover:text-white">
            Modelos IA
          </a>
          <a href="#precios" className="text-sm text-zinc-400 transition-colors hover:text-white">
            Precios
          </a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" className="text-sm text-zinc-400 hover:text-white hover:bg-white/5">
            Iniciar sesión
          </Button>
          <Link href="/app">
            <Button className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-0 hover:opacity-90 transition-opacity">
              Empezar gratis
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-zinc-400 hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 px-4 py-4">
            <a href="#herramientas" className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white" onClick={() => setMobileOpen(false)}>
              Herramientas
            </a>
            <a href="#spaces" className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white" onClick={() => setMobileOpen(false)}>
              Spaces
            </a>
            <a href="#modelos" className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white" onClick={() => setMobileOpen(false)}>
              Modelos IA
            </a>
            <a href="#precios" className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white" onClick={() => setMobileOpen(false)}>
              Precios
            </a>
            <div className="mt-3 flex flex-col gap-2 border-t border-white/5 pt-3">
              <Button variant="ghost" className="w-full justify-center text-zinc-400 hover:text-white hover:bg-white/5">
                Iniciar sesión
              </Button>
              <Link href="/app" className="w-full">
                <Button className="w-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-0 hover:opacity-90 transition-opacity">
                  Empezar gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
