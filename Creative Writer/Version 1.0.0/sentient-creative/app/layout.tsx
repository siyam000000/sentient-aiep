import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Sentient AI Text Editor",
  description: "AI-powered text editing for more precise and creative writing",
  metadataBase: new URL("https://sentient-ai-text-editor.vercel.app/"),
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    title: "Sentient AI Text Editor",
    description: "AI-powered text editing for more precise and creative writing",
    images: ["/opengraph-image.png"],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Toaster richColors theme="system" />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}



import './globals.css'