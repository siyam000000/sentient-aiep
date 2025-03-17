"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type VoiceType = "male" | "female"

interface ThemeContextType {
  voiceType: VoiceType
  setVoiceType: (type: VoiceType) => void
  themeColor: string
  voiceId: string
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [voiceType, setVoiceType] = useState<VoiceType>("male")

  // Theme color based on voice type
  const themeColor = voiceType === "male" ? "from-blue-950 to-blue-900" : "from-purple-950 to-purple-900"

  // Cartesia voice IDs
  const voiceId =
    voiceType === "male"
      ? "79a125e8-cd45-4c13-8a67-188112f4dd22" // Male voice ID (Sonic)
      : "b826c3a8-3e1a-4f51-9822-6960b1b89d6f" // Female voice ID (Alloy)

  return (
    <ThemeContext.Provider value={{ voiceType, setVoiceType, themeColor, voiceId }}>{children}</ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}

