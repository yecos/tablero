'use client'

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Describe',
      description: 'Tell the AI agent what you want to create. Be as specific or as vague as you like.',
      color: 'from-purple-500 to-violet-600',
      icon: '💬',
    },
    {
      number: '02',
      title: 'Generate',
      description: 'AI creates professional designs instantly. Get multiple variations in seconds.',
      color: 'from-cyan-400 to-teal-500',
      icon: '✨',
    },
    {
      number: '03',
      title: 'Refine',
      description: 'Edit, iterate, and perfect your designs on the infinite canvas.',
      color: 'from-pink-500 to-rose-500',
      icon: '🎨',
    },
  ]

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How It{' '}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Three simple steps to transform your ideas into stunning designs.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div key={step.number} className="relative text-center">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[calc(100%-20%)] h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
              )}

              {/* Number */}
              <div className="relative inline-flex mb-6">
                <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${step.color} opacity-10 absolute inset-0 blur-xl`} />
                <div className={`relative w-32 h-32 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                  <span className="text-5xl">{step.icon}</span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed max-w-xs mx-auto">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
