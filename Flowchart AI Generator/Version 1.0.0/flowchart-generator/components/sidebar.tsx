"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

interface ChatItem {
  id: string
  title: string
}

interface SidebarProps {
  chats: ChatItem[]
  onChatSelect: (id: string) => void
  onNewChat: () => void
  currentChatId: string | null
}

export function Sidebar({ chats, onChatSelect, onNewChat, currentChatId }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={`bg-blue-800 h-screen transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}>
      <div className="flex justify-between items-center p-4">
        {!isCollapsed && <h2 className="text-xl font-bold">Chats</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white hover:bg-blue-700"
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>
      <Button onClick={onNewChat} className="w-full justify-start px-4 py-2 mb-4 bg-blue-700 hover:bg-blue-600">
        <Plus className="mr-2" />
        {!isCollapsed && "New Chat"}
      </Button>
      <div className="space-y-2">
        {chats.map((chat) => (
          <Button
            key={chat.id}
            onClick={() => onChatSelect(chat.id)}
            className={`w-full justify-start px-4 py-2 ${
              chat.id === currentChatId ? "bg-blue-600" : "bg-transparent"
            } hover:bg-blue-700`}
          >
            {isCollapsed ? (
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                {chat.title.charAt(0)}
              </div>
            ) : (
              chat.title
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}

