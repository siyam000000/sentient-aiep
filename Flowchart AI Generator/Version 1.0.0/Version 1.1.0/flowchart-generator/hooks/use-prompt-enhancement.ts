"use client"

import { useState, useCallback } from "react"

export function usePromptEnhancement(language: "en" | "bg") {
  const [enhancedInput, setEnhancedInput] = useState<string | null>(null)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enhancePrompt = useCallback(
    async (input: string) => {
      if (!input.trim()) {
        setError(language === "en" ? "Please enter a description to enhance" : "Моля, въведете описание за подобряване")
        return null
      }

      setIsEnhancing(true)
      setError(null)

      try {
        const response = await fetch("/api/enhance-prompt", {
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
        setError(
          error instanceof Error
            ? error.message
            : language === "en"
              ? "An unexpected error occurred while enhancing the prompt"
              : "Възникна неочаквана грешка при подобряване на описанието",
        )
        return null
      } finally {
        setIsEnhancing(false)
      }
    },
    [language],
  )

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

