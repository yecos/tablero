import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tablero — Plataforma Creativa de IA",
  description: "La plataforma creativa de IA para dirigir tu mejor trabajo. Cada modelo de IA para vídeo, imagen y audio. Flujos de trabajo inteligentes para control profesional y colaboración.",
  keywords: ["IA", "inteligencia artificial", "generador de imágenes", "generador de vídeo", " Spaces", "Tablero", "creative AI"],
  authors: [{ name: "Tablero" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Tablero — Plataforma Creativa de IA",
    description: "La plataforma creativa de IA para dirigir tu mejor trabajo.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tablero — Plataforma Creativa de IA",
    description: "La plataforma creativa de IA para dirigir tu mejor trabajo.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
