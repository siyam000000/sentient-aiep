import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../src/index.css"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "Sentient AIEP",
  description: "Artificial Intelligence Experimental Prototyping",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}



import './globals.css'