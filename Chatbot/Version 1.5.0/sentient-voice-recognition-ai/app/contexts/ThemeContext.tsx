"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type VoiceType = "male" | "female"
type ModelType = "gemma2-9b-it" | "llama3-70b-8192" | "distil-whisper-large-v3-en" | "mixtral-8x7b-32768"

interface ThemeContextType {
  voiceType: VoiceType
  setVoiceType: (type: VoiceType) => void
  themeColor: string
  modelType: ModelType
  setModelType: (model: ModelType) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = "voiceAssistantSettings"

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [voiceType, setVoiceType] = useState<VoiceType>("male")
  const [modelType, setModelType] = useState<ModelType>("gemma2-9b-it")

  // Load settings from localStorage on initial render
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY)
      if (savedSettings) {
        const { voiceType: savedVoiceType, modelType: savedModelType } = JSON.parse(savedSettings)
        if (savedVoiceType === "male" || savedVoiceType === "female") {
          setVoiceType(savedVoiceType)
        }
        if (savedModelType) {
          setModelType(savedModelType as ModelType)
        }
      }
    } catch (e) {
      console.error("Failed to load settings:", e)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ voiceType, modelType }))
    } catch (e) {
      console.error("Failed to save settings:", e)
    }
  }, [voiceType, modelType])

  // Theme color based on voice type
  const themeColor = voiceType === "male" ? "from-blue-950 to-blue-900" : "from-purple-950 to-purple-900"

  return (
    <ThemeContext.Provider
      value={{
        voiceType,
        setVoiceType,
        themeColor,
        modelType,
        setModelType,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}

