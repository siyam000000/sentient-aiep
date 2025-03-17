import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin", "cyrillic"] }) // Added Cyrillic subset for Bulgarian

export const metadata = {
  title: "Sentient AI IDE",
  description: "Next-generation AI-powered code editor with intelligent assistance",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bg" className="dark">
      {/* Removed whitespace */}
      <body className={`${inter.className} bg-[#1e1e1e] text-white antialiased`}>{children}</body>
    </html>
  )
}



import './globals.css'