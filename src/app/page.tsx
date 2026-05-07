"use client";

import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { ToolsSection } from "@/components/landing/tools-section";
import { SpacesSection } from "@/components/landing/spaces-section";
import { ModelsSection } from "@/components/landing/models-section";
import { ShowcaseSection } from "@/components/landing/showcase-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <main>
        <HeroSection />
        <ToolsSection />
        <SpacesSection />
        <ModelsSection />
        <ShowcaseSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
