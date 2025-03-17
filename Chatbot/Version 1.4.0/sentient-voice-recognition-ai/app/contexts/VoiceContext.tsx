"use client"

import type React from "react"
import { createContext, useState, useContext, type ReactNode } from "react"
import { useVoiceRecognition } from "../hooks/useVoiceRecognition"

interface VoiceContextType {
  transcript: string
  isListening: boolean
  startListening: () => void
  stopListening: () => void
  aiResponse: string
  setAIResponse: (response: string) => void
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined)

export const VoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transcript, setTranscript] = useState("")
  const [aiResponse, setAIResponse] = useState("")

  const { isListening, startListening, stopListening } = useVoiceRecognition({
    onResult: (result) => setTranscript(result),
    onError: (error) => console.error(error),
  })

  return (
    <VoiceContext.Provider
      value={{
        transcript,
        isListening,
        startListening,
        stopListening,
        aiResponse,
        setAIResponse,
      }}
    >
      {children}
    </VoiceContext.Provider>
  )
}

export const useVoice = () => {
  const context = useContext(VoiceContext)
  if (context === undefined) {
    throw new Error("useVoice must be used within a VoiceProvider")
  }
  return context
}

