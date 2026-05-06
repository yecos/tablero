'use client'

import { MessageSquare, Layout, Image, Palette, FileText, Share2 } from 'lucide-react'

const features = [
  {
    icon: MessageSquare,
    title: 'AI Design Agent',
    description: 'Chat with AI to create any design. From logos to campaigns, just describe what you need.',
    iconColor: 'text-purple-400',
    bgGradient: 'from-purple-500/10 to-violet-600/10',
  },
  {
    icon: Layout,
    title: 'Infinite Canvas',
    description: 'Collaborate on an unlimited canvas. Zoom, pan, and arrange your designs freely.',
    iconColor: 'text-cyan-400',
    bgGradient: 'from-cyan-400/10 to-teal-500/10',
  },
  {
    icon: Image,
    title: 'Image Generation',
    description: 'Generate stunning visuals with state-of-the-art AI models. Professional quality in seconds.',
    iconColor: 'text-pink-400',
    bgGradient: 'from-pink-500/10 to-rose-600/10',
  },
  {
    icon: Palette,
    title: 'Brand Kit',
    description: 'Create a complete brand identity. Logos, colors, fonts, and voice — all consistent.',
    iconColor: 'text-amber-400',
    bgGradient: 'from-amber-400/10 to-orange-500/10',
  },
  {
    icon: FileText,
    title: 'Smart Templates',
    description: 'Start with AI-generated templates for social media, posters, packaging and more.',
    iconColor: 'text-emerald-400',
    bgGradient: 'from-emerald-400/10 to-green-500/10',
  },
  {
    icon: Share2,
    title: 'Export & Share',
    description: 'Download in any format. Share directly to social media or collaborate with your team.',
    iconColor: 'text-violet-400',
    bgGradient: 'from-violet-400/10 to-purple-500/10',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Design with AI
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Powerful tools that transform your creative vision into reality, powered by cutting-edge AI.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-2xl bg-[#12121a] border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/5"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.bgGradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
