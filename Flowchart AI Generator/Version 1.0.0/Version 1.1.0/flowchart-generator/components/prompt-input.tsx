"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { EnhancePromptButton } from "./enhance-prompt-button"

export function PromptInput() {
  const [prompt, setPrompt] = useState("")
  const [enhancedPrompt, setEnhancedPrompt] = useState("")

  const handleEnhance = (newPrompt: string) => {
    setEnhancedPrompt(newPrompt)
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here..."
        className="min-h-[100px]"
      />
      <div className="flex justify-end">
        <EnhancePromptButton prompt={prompt} onEnhance={handleEnhance} maxLength={500} />
      </div>
      {enhancedPrompt && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h3 className="font-semibold mb-2">Enhanced Prompt:</h3>
          <p>{enhancedPrompt}</p>
        </div>
      )}
    </div>
  )
}

