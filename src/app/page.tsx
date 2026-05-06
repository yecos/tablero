'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/hero-section'
import { FeaturesSection } from '@/components/features-section'
import { HowItWorks } from '@/components/how-it-works'
import { CanvasPreview } from '@/components/canvas-preview'
import { PricingSection } from '@/components/pricing-section'
import { GallerySection } from '@/components/gallery-section'
import { CtaSection } from '@/components/cta-section'
import { Footer } from '@/components/footer'
import { DesignWorkspace } from '@/components/design-workspace'

export default function Home() {
  const [workspaceOpen, setWorkspaceOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      <Navbar onStartCreating={() => setWorkspaceOpen(true)} />
      <main className="flex-1">
        <HeroSection onStartCreating={() => setWorkspaceOpen(true)} />
        <FeaturesSection />
        <HowItWorks />
        <CanvasPreview />
        <PricingSection onStartCreating={() => setWorkspaceOpen(true)} />
        <GallerySection />
        <CtaSection onStartCreating={() => setWorkspaceOpen(true)} />
      </main>
      <Footer />

      {/* Design Workspace Overlay */}
      {workspaceOpen && (
        <DesignWorkspace onClose={() => setWorkspaceOpen(false)} />
      )}
    </div>
  )
}
