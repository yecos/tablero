'use client'

import { useState } from 'react'

const galleryItems = [
  {
    id: 1,
    prompt: 'Modern minimalist logo for a fintech startup',
    gradient: 'from-purple-600 via-violet-600 to-pink-500',
    type: 'Logo Design',
  },
  {
    id: 2,
    prompt: 'Retro-futuristic poster for a music festival',
    gradient: 'from-cyan-500 via-teal-500 to-emerald-500',
    type: 'Poster',
  },
  {
    id: 3,
    prompt: 'Luxury brand identity for a cosmetics line',
    gradient: 'from-rose-500 via-pink-500 to-purple-500',
    type: 'Brand Kit',
  },
  {
    id: 4,
    prompt: 'Social media campaign for sustainable fashion',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    type: 'Social Media',
  },
  {
    id: 5,
    prompt: 'Futuristic UI dashboard for a space app',
    gradient: 'from-violet-600 via-purple-600 to-cyan-500',
    type: 'UI Design',
  },
  {
    id: 6,
    prompt: 'Product packaging for an organic tea brand',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    type: 'Packaging',
  },
  {
    id: 7,
    prompt: 'Album cover art for an electronic music artist',
    gradient: 'from-pink-500 via-purple-500 to-indigo-500',
    type: 'Album Art',
  },
  {
    id: 8,
    prompt: 'Professional business card for a law firm',
    gradient: 'from-slate-500 via-zinc-500 to-neutral-500',
    type: 'Business Card',
  },
]

export function GallerySection() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <section id="gallery" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Created with{' '}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              DesignAI
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            See what our community is creating with the AI Design Agent.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Gradient background as placeholder */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-80 group-hover:opacity-60 transition-opacity duration-300`} />

              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                backgroundSize: '16px 16px',
              }} />

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-2xl opacity-50 group-hover:opacity-80 transition-opacity">
                  ✦
                </div>
              </div>

              {/* Hover overlay */}
              <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 transition-opacity duration-300 ${hoveredId === item.id ? 'opacity-100' : 'opacity-0'}`}>
                <span className="text-xs text-purple-300 font-medium mb-2">{item.type}</span>
                <p className="text-sm text-white text-center leading-relaxed">{item.prompt}</p>
              </div>

              {/* Type badge */}
              <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded-md text-[10px] text-white/70">
                {item.type}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
