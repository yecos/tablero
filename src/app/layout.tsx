import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DesignAI - The AI Design Agent That Creates For You",
  description: "From logo to full marketing campaign in one conversation. Describe your vision, get professional designs instantly.",
  keywords: ["AI", "design", "logo", "brand kit", "image generation", "canvas", "creative"],
  authors: [{ name: "DesignAI Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "DesignAI - The AI Design Agent That Creates For You",
    description: "From logo to full marketing campaign in one conversation.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DesignAI - The AI Design Agent That Creates For You",
    description: "From logo to full marketing campaign in one conversation.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
