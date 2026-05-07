'use client'

import { Navbar } from '@/components/navbar'
import { HeroSection, ToolsSection, SpacesSection, PricingSection, CTASection, Footer } from '@/components/landing'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ToolsSection />
        <SpacesSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
