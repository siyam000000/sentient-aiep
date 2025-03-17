"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useChat } from "ai/react"
import { X } from "lucide-react" // Add this import

interface CodeHelperProps {
  language: string
  onInsertCode: (code: string) => void
}

export function CodeHelper({ language, onInsertCode }: CodeHelperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const { messages, handleSubmit } = useChat({
    api: "/api/chat",
    onFinish: (message) => {
      const codeBlock = extractCodeBlock(message.content)
      if (codeBlock) {
        onInsertCode(codeBlock)
      }
    },
  })

  const extractCodeBlock = (content: string) => {
    const codeBlockRegex = /```[\s\S]*?\n([\s\S]*?)```/
    const match = content.match(codeBlockRegex)
    return match ? match[1] : null
  }

  const handleQuerySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleSubmit(e, {
      options: {
        body: {
          messages: [
            {
              role: "system",
              content: `You are a helpful coding assistant for ${language}. Provide concise code snippets.`,
            },
            { role: "user", content: query },
          ],
        },
      },
    })
  }

  if (!isOpen) {
    return (
      <Button className="fixed bottom-4 right-4" onClick={() => setIsOpen(true)}>
        Code Helper
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-[#252525] border border-[#1e1e1e] rounded-lg shadow-lg">
      <div className="flex justify-between items-center p-2 border-b border-[#1e1e1e]">
        <h2 className="text-sm font-semibold">Code Helper ({language})</h2>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="p-4">
        <form onSubmit={handleQuerySubmit}>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask for coding help..."
            className="mb-2"
          />
          <Button type="submit">Ask</Button>
        </form>
      </div>
    </div>
  )
}

