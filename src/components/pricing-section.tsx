'use client'

import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PricingSectionProps {
  onStartCreating: () => void
}

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    description: 'Perfect for exploring AI design',
    features: [
      '30 credits per month',
      '5 designs per month',
      'Basic templates',
      'Community support',
      'Standard image quality',
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    description: 'For serious creators and designers',
    features: [
      '500 credits per month',
      'Unlimited designs',
      'All templates',
      'Priority support',
      'Commercial license',
      'Brand kits',
      'HD image quality',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '$49',
    period: '/mo',
    description: 'For teams and organizations',
    features: [
      'Unlimited credits',
      'Everything in Pro',
      'API access',
      'Custom models',
      'Dedicated support',
      'Team collaboration',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

export function PricingSection({ onStartCreating }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-500/5 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simple, Transparent{' '}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Start for free, upgrade when you need more power.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-2xl p-6 transition-all duration-300',
                plan.highlighted
                  ? 'bg-gradient-to-b from-purple-500/10 to-cyan-500/5 border border-purple-500/30 shadow-xl shadow-purple-500/10 scale-105'
                  : 'bg-[#12121a] border border-white/5 hover:border-white/10'
              )}
            >
              {/* Popular badge */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full text-xs font-medium text-white">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className={cn('text-lg font-semibold mb-1', plan.highlighted ? 'text-purple-300' : 'text-white')}>
                  {plan.name}
                </h3>
                <p className="text-sm text-slate-500">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className={cn('text-4xl font-bold', plan.highlighted ? 'text-white' : 'text-white')}>
                  {plan.price}
                </span>
                <span className="text-slate-500">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className={cn('w-4 h-4 mt-0.5 shrink-0', plan.highlighted ? 'text-purple-400' : 'text-slate-500')} />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={onStartCreating}
                className={cn(
                  'w-full',
                  plan.highlighted
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white border-0 shadow-lg shadow-purple-500/25'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                )}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
