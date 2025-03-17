import type React from "react"
import "./globals.css"
import "./styles/custom.css"
import { VoiceProvider } from "./contexts/VoiceContext"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-dark text-light antialiased">
        <VoiceProvider>{children}</VoiceProvider>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
