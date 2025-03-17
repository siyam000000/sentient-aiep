"use client"

import { useState, useCallback } from "react"
import { API_ROUTES } from "@/config/app-config"
import { cleanMermaidCode } from "@/utils/mermaid-helpers"
import confetti from "canvas-confetti"
import { useAppContext } from "@/context/app-context"
import { useTranslations } from "./use-translations"

/**
 * Custom hook for flowchart generation
 */
export function useFlowchartGeneration() {
  const [input, setInput] = useState("")
  const [mermaidCode, setMermaidCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { currentChatId, addFlowchartToChat } = useAppContext()
  const { language, t } = useTranslations()

  /**
   * Generates a flowchart from the current input
   */
  const generateFlowchart = useCallback(async () => {
    if (!input.trim()) {
      setError(t("emptyInputError"))
      return null
    }

    setError(null)
    setWarning(null)
    setIsLoading(true)

    try {
      const response = await fetch(API_ROUTES.GENERATE_FLOWCHART, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.mermaidCode) {
        throw new Error("No flowchart code received")
      }

      // Clean the mermaid code before setting it
      const cleanedCode = cleanMermaidCode(data.mermaidCode)
      setMermaidCode(cleanedCode)

      if (data.warning) {
        setWarning(data.warning)
      }

      // If the code was fixed during generation, show a warning
      if (data.wasFixed) {
        setWarning("The flowchart code was automatically fixed during generation")
      }

      // Show confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      // Save the flowchart to the current chat
      if (currentChatId) {
        addFlowchartToChat(currentChatId, input, cleanedCode)
      }

      // Reset input after successful generation
      setInput("")

      return cleanedCode
    } catch (error) {
      console.error("Error generating flowchart:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [input, currentChatId, addFlowchartToChat, t])

  /**
   * Handles code fixes from the MermaidRenderer
   */
  const handleCodeFix = useCallback((fixedCode: string) => {
    setMermaidCode(fixedCode)
    setWarning("The flowchart code was automatically fixed by AI")
  }, [])

  return {
    input,
    setInput,
    mermaidCode,
    setMermaidCode,
    error,
    setError,
    warning,
    setWarning,
    isLoading,
    generateFlowchart,
    handleCodeFix,
  }
}

