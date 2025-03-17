"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Wand2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EnhancePromptButtonProps {
  prompt: string
  onEnhance: (enhancedPrompt: string) => void
  language: "en" | "bg"
}

export function EnhancePromptButton({ prompt, onEnhance, language }: EnhancePromptButtonProps) {
  const [isEnhancing, setIsEnhancing] = useState(false)

  const enhancePrompt = async () => {
    if (!prompt.trim()) {
      alert(language === "en" ? "Please enter a description to enhance" : "Моля, въведете описание за подобряване")
      return
    }

    setIsEnhancing(true)

    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: prompt }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (!data.enhancedPrompt) {
        throw new Error(language === "en" ? "No enhanced prompt received" : "Не е получено подобрено описание")
      }

      onEnhance(data.enhancedPrompt)
    } catch (error) {
      console.error("Error enhancing prompt:", error)
      alert(
        language === "en"
          ? "An error occurred while enhancing the prompt. Please try again."
          : "Възникна грешка при подобряването на описанието. Моля, опитайте отново.",
      )
    } finally {
      setIsEnhancing(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={enhancePrompt}
            disabled={isEnhancing}
            className="bg-purple-600 hover:bg-purple-700 flex-grow"
          >
            {isEnhancing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === "en" ? "Enhancing..." : "Подобряване..."}
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                {language === "en" ? "Create Flowchart Prompt" : "Създай описание за диаграма"}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {language === "en"
              ? "Enhance your prompt to create a flowchart (max 30 words)"
              : "Подобрете вашето описание за създаване на диаграма (макс. 30 думи)"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

