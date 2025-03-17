"use client"

import type React from "react"

import { useState } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

interface TextWriterProps {
  onClose: () => void
  onInsertText: (text: string) => void
}

export function TextWriter({ onClose, onInsertText }: TextWriterProps) {
  const [prompt, setPrompt] = useState("")
  const [generatedText, setGeneratedText] = useState("")
  const { messages, handleSubmit } = useChat({
    api: "/api/chat",
    onFinish: (message) => {
      setGeneratedText(message.content)
    },
  })

  const handlePromptSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleSubmit(e)
  }

  return (
    <div className="w-80 bg-[#252525] border-l border-[#1e1e1e] flex flex-col">
      <div className="flex justify-between items-center p-2 border-b border-[#1e1e1e]">
        <h2 className="text-sm font-semibold">Text Writer</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handlePromptSubmit} className="mb-4">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your writing prompt..."
            className="mb-2"
          />
          <Button type="submit">Generate</Button>
        </form>
        <Textarea
          value={generatedText}
          onChange={(e) => setGeneratedText(e.target.value)}
          placeholder="Generated text will appear here..."
          className="h-64 mb-2"
        />
        <Button onClick={() => onInsertText(generatedText)}>Insert Text</Button>
      </div>
    </div>
  )
}

