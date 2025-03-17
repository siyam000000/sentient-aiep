import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AI-Driven Code Editor",
  description: "VS Code-inspired online code editor with AI assistance",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#1e1e1e] text-white antialiased`}>{children}</body>
    </html>
  )
}



import './globals.css'