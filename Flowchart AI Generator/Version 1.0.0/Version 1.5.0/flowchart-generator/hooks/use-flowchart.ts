"use client"

import { useState, useCallback } from "react"

interface FlowchartState {
  input: string
  mermaidCode: string
  error: string | null
  warning: string | null
  isLoading: boolean
  renderError: string | null
}

export function useFlowchart(language: "en" | "bg") {
  const [state, setState] = useState<FlowchartState>({
    input: "",
    mermaidCode: "",
    error: null,
    warning: null,
    isLoading: false,
    renderError: null,
  })

  const setInput = useCallback((input: string) => {
    setState((prev) => ({ ...prev, input }))
  }, [])

  const generateFlowchart = useCallback(async () => {
    if (!state.input.trim()) {
      setState((prev) => ({
        ...prev,
        error:
          language === "en"
            ? "Please enter a description for your flowchart"
            : "Моля, въведете описание за вашата диаграма",
      }))
      return null
    }

    setState((prev) => ({
      ...prev,
      error: null,
      warning: null,
      renderError: null,
      isLoading: true,
    }))

    try {
      const response = await fetch("/api/generate-flowchart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: state.input }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.mermaidCode) {
        throw new Error(language === "en" ? "No flowchart code received" : "Не е получен код за диаграма")
      }

      setState((prev) => ({
        ...prev,
        mermaidCode: data.mermaidCode,
        warning: data.warning || null,
        isLoading: false,
      }))

      return data.mermaidCode
    } catch (error) {
      console.error("Error generating flowchart:", error)
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : language === "en"
              ? "An unexpected error occurred while generating the flowchart"
              : "Възникна неочаквана грешка при генерирането на диаграмата",
        isLoading: false,
      }))
      return null
    }
  }, [state.input, language])

  const setRenderError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, renderError: error }))
  }, [])

  const resetState = useCallback(() => {
    setState({
      input: "",
      mermaidCode: "",
      error: null,
      warning: null,
      isLoading: false,
      renderError: null,
    })
  }, [])

  return {
    ...state,
    setInput,
    generateFlowchart,
    setRenderError,
    resetState,
  }
}

