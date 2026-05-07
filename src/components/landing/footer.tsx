"use client";

import { Sparkles } from "lucide-react";

const footerLinks = {
  Producto: [
    { label: "Herramientas", href: "#herramientas" },
    { label: "Spaces", href: "#spaces" },
    { label: "Modelos IA", href: "#modelos" },
    { label: "Precios", href: "#precios" },
    { label: "API", href: "#" },
  ],
  Compañía: [
    { label: "Sobre nosotros", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Carreras", href: "#" },
    { label: "Prensa", href: "#" },
  ],
  Recursos: [
    { label: "Documentación", href: "#" },
    { label: "Tutoriales", href: "#" },
    { label: "Comunidad", href: "#" },
    { label: "Soporte", href: "#" },
  ],
  Legal: [
    { label: "Privacidad", href: "#" },
    { label: "Términos", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-[#06060a]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* CTA Banner */}
        <div className="relative -mt-px overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-r from-violet-600/10 via-purple-600/5 to-cyan-600/10 p-8 sm:p-12 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_70%)]" aria-hidden="true" />
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white sm:text-3xl">
              Empieza a crear con IA hoy
            </h3>
            <p className="mx-auto mt-3 max-w-md text-zinc-400">
              Únete a más de 500,000 creadores que ya usan Tablero para dar vida a sus ideas.
            </p>
            <a
              href="#"
              className="mt-6 inline-flex h-12 items-center rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-8 text-base font-semibold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:opacity-90 transition-all"
            >
              Empezar gratis
            </a>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="#" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Tablero</span>
            </a>
            <p className="mt-4 text-sm text-zinc-500 leading-relaxed">
              La plataforma creativa de IA para dirigir tu mejor trabajo.
            </p>
          </div>

          {/* Link Groups */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-zinc-300">{title}</h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-zinc-500 transition-colors hover:text-zinc-300">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 py-6 sm:flex-row">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Tablero. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            {/* Social icons as simple text links */}
            {["Twitter", "GitHub", "Discord", "LinkedIn"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-xs text-zinc-600 transition-colors hover:text-zinc-400"
                aria-label={social}
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
