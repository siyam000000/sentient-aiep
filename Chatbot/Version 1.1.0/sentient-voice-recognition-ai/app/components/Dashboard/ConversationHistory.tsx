"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

const mockConversations = [
  { id: 1, date: "2023-04-01", summary: "Discussed project timeline" },
  { id: 2, date: "2023-04-02", summary: "Reviewed marketing strategy" },
  { id: 3, date: "2023-04-03", summary: "Planned team building event" },
]

const ConversationHistory = () => {
  const [conversations] = useState(mockConversations)

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => (
        <div key={conversation.id} className="bg-muted p-4 rounded-md">
          <p className="font-semibold">{conversation.date}</p>
          <p>{conversation.summary}</p>
          <div className="mt-2">
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ConversationHistory

