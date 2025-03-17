"use client"

import { useState, useCallback } from "react"
import { API_ROUTES } from "@/config/app-config"
import { useTranslations } from "./use-translations"

/**
 * Custom hook for prompt enhancement
 */
export function usePromptEnhancement() {
  const [enhancedInput, setEnhancedInput] = useState<string | null>(null)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslations()

  /**
   * Enhances a prompt using AI
   *
   * @param input - The prompt to enhance
   * @returns The enhanced prompt or null if enhancement failed
   */
  const enhancePrompt = useCallback(
    async (input: string): Promise<string | null> => {
      if (!input.trim()) {
        setError(t("emptyInputError"))
        return null
      }

      setIsEnhancing(true)
      setError(null)

      try {
        const response = await fetch(API_ROUTES.ENHANCE_PROMPT, {
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

        setEnhancedInput(data.enhancedPrompt)
        return data.enhancedPrompt
      } catch (error) {
        console.error("Error enhancing prompt:", error)
        setError(error instanceof Error ? error.message : "An unexpected error occurred")
        return null
      } finally {
        setIsEnhancing(false)
      }
    },
    [t],
  )

  /**
   * Clears the enhanced input
   */
  const clearEnhancedInput = useCallback(() => {
    setEnhancedInput(null)
  }, [])

  return {
    enhancedInput,
    isEnhancing,
    error,
    enhancePrompt,
    clearEnhancedInput,
    setError,
  }
}

