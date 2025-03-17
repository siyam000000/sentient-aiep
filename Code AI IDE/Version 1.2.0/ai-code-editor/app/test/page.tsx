"use client"

import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function TestChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Chat with Groq API</h1>

      <div className="h-[400px] overflow-y-auto mb-4 border rounded-lg p-4">
        {messages.map((m) => (
          <div key={m.id} className={`mb-4 ${m.role === "user" ? "text-blue-600" : "text-green-600"}`}>
            <strong>{m.role === "user" ? "You: " : "AI: "}</strong>
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {isLoading && <div className="text-gray-500">AI is thinking...</div>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask something about coding..."
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          Send
        </Button>
      </form>
    </div>
  )
}

