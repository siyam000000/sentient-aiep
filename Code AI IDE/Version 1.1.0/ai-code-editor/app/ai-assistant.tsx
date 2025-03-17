"use client"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AIAssistant() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  return (
    <div className="border-t p-4">
      <h2 className="text-xl font-semibold mb-2">AI Assistant</h2>
      <div className="h-40 overflow-y-auto mb-4">
        {messages.map((m) => (
          <div key={m.id} className={`mb-2 ${m.role === "user" ? "text-blue-600" : "text-green-600"}`}>
            <strong>{m.role === "user" ? "You: " : "AI: "}</strong>
            {m.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input value={input} onChange={handleInputChange} placeholder="Ask for coding help..." />
        <Button type="submit">Send</Button>
      </form>
    </div>
  )
}

