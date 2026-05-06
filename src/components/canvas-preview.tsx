'use client'

export function CanvasPreview() {
  return (
    <section id="canvas" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Your Design{' '}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Workspace
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            A powerful canvas with AI chat — design has never been this intuitive.
          </p>
        </div>

        {/* Canvas Mockup */}
        <div className="relative max-w-5xl mx-auto">
          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-60" />

          {/* Mockup container */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d14] shadow-2xl">
            {/* Title bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#12121a] border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="text-xs text-slate-500 font-mono">DesignAI Workspace</div>
              <div className="w-16" />
            </div>

            <div className="flex h-[400px] sm:h-[500px]">
              {/* Canvas Area */}
              <div className="flex-1 relative overflow-hidden"
                style={{
                  backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                  backgroundSize: '24px 24px',
                  backgroundColor: '#0a0a0f',
                }}
              >
                {/* Simulated design elements on canvas */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Card 1 */}
                  <div className="absolute top-[15%] left-[10%] w-40 h-28 rounded-xl bg-gradient-to-br from-purple-600/30 to-violet-700/30 border border-purple-500/20 backdrop-blur-sm flex flex-col items-center justify-center gap-2 transform -rotate-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/40" />
                    <div className="w-20 h-2 rounded bg-purple-400/30" />
                    <div className="w-14 h-1.5 rounded bg-purple-400/20" />
                  </div>

                  {/* Main generated image */}
                  <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-2xl bg-gradient-to-br from-purple-500/40 via-violet-600/40 to-cyan-500/40 border border-white/10 flex flex-col items-center justify-center shadow-2xl shadow-purple-500/20">
                    <div className="text-4xl mb-2">🎨</div>
                    <div className="text-white/60 text-sm font-medium">AI Generated</div>
                    <div className="text-white/30 text-xs mt-1">1024 × 1024</div>
                  </div>

                  {/* Card 2 */}
                  <div className="absolute bottom-[15%] right-[10%] w-36 h-24 rounded-xl bg-gradient-to-br from-cyan-500/30 to-teal-600/30 border border-cyan-500/20 backdrop-blur-sm flex flex-col items-center justify-center gap-2 transform rotate-2">
                    <div className="w-6 h-6 rounded bg-cyan-400/40" />
                    <div className="w-16 h-2 rounded bg-cyan-400/30" />
                  </div>

                  {/* Text element */}
                  <div className="absolute top-[20%] right-[20%] text-white/40 text-lg font-bold transform rotate-6">
                    Hello World
                  </div>
                </div>

                {/* Zoom controls mockup */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-[#12121a]/90 backdrop-blur-sm rounded-lg border border-white/5 px-2 py-1">
                  <span className="text-xs text-slate-500 px-1">−</span>
                  <span className="text-xs text-slate-400 px-2">100%</span>
                  <span className="text-xs text-slate-500 px-1">+</span>
                </div>
              </div>

              {/* Chat Sidebar */}
              <div className="hidden sm:flex w-72 lg:w-80 flex-col border-l border-white/5 bg-[#0d0d14]">
                {/* Chat header */}
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center">
                      <span className="text-[10px]">✦</span>
                    </div>
                    <span className="text-sm font-medium text-white">AI Design Agent</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {/* AI message */}
                  <div className="flex gap-2">
                    <div className="w-6 h-6 shrink-0 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center text-[10px]">
                      ✦
                    </div>
                    <div className="bg-[#1a1a2e] rounded-xl rounded-tl-none p-3 text-xs text-slate-300 leading-relaxed">
                      I&apos;ll create a modern brand identity for you. Let me generate some options! 🎨
                    </div>
                  </div>

                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-purple-600/30 border border-purple-500/20 rounded-xl rounded-tr-none p-3 text-xs text-purple-100 max-w-[85%]">
                      Create a modern logo for my tech startup
                    </div>
                  </div>

                  {/* AI message with image */}
                  <div className="flex gap-2">
                    <div className="w-6 h-6 shrink-0 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center text-[10px]">
                      ✦
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-24 rounded-lg bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-white/5" />
                      <div className="text-xs text-slate-300">
                        Here&apos;s a sleek logo concept! Want me to adjust the colors?
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="p-3 border-t border-white/5">
                  <div className="flex items-center gap-2 bg-[#1a1a2e] rounded-xl px-3 py-2 border border-white/5">
                    <span className="text-xs text-slate-500 flex-1">Describe your design...</span>
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center">
                      <span className="text-[10px]">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
