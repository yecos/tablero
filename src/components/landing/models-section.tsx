"use client";

const models = [
  { name: "GPT-4o", color: "from-emerald-500 to-green-600" },
  { name: "Flux Pro", color: "from-violet-500 to-purple-600" },
  { name: "Hunyuan3D", color: "from-cyan-500 to-blue-600" },
  { name: "Stable Diffusion XL", color: "from-orange-500 to-red-600" },
  { name: "DALL·E 3", color: "from-pink-500 to-rose-600" },
  { name: "Midjourney", color: "from-blue-500 to-indigo-600" },
  { name: "Kling Video", color: "from-amber-500 to-yellow-600" },
  { name: "Runway Gen-3", color: "from-teal-500 to-emerald-600" },
  { name: "ElevenLabs", color: "from-fuchsia-500 to-pink-600" },
  { name: "Suno AI", color: "from-lime-500 to-green-600" },
  { name: "Luma AI", color: "from-sky-500 to-blue-600" },
  { name: "Ideogram", color: "from-rose-500 to-red-600" },
  { name: "PlayHT", color: "from-purple-500 to-violet-600" },
  { name: "Leonardo AI", color: "from-yellow-500 to-amber-600" },
  { name: "Pika", color: "from-indigo-500 to-purple-600" },
  { name: "Tripo3D", color: "from-emerald-500 to-teal-600" },
];

export function ModelsSection() {
  return (
    <section id="modelos" className="relative bg-[#0a0a0f] py-24 sm:py-32 overflow-hidden">
      {/* Background accent */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-cyan-600/5 blur-[120px]" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Con los últimos
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              modelos de IA
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
            Acceso a las mejores empresas de IA del mundo. Un solo plan, todos los modelos.
          </p>
        </div>

        {/* Scrolling Models Row - First Row */}
        <div className="mt-16 relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-[#0a0a0f] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none" />

          <div className="scroll-row flex gap-4" style={{ animationDuration: "30s" }}>
            {[...models, ...models].map((model, i) => (
              <div
                key={`${model.name}-${i}`}
                className="flex shrink-0 items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-5 py-3.5 transition-all hover:border-white/10 hover:bg-white/[0.05]"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${model.color} text-white text-xs font-bold`}>
                  {model.name.charAt(0)}
                </div>
                <span className="whitespace-nowrap text-sm font-medium text-zinc-300">{model.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scrolling Models Row - Second Row (reverse direction) */}
        <div className="mt-4 relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-[#0a0a0f] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none" />

          <div className="scroll-row-reverse flex gap-4" style={{ animationDuration: "35s" }}>
            {[...models.slice().reverse(), ...models.slice().reverse()].map((model, i) => (
              <div
                key={`${model.name}-rev-${i}`}
                className="flex shrink-0 items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-5 py-3.5 transition-all hover:border-white/10 hover:bg-white/[0.05]"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${model.color} text-white text-xs font-bold`}>
                  {model.name.charAt(0)}
                </div>
                <span className="whitespace-nowrap text-sm font-medium text-zinc-300">{model.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
