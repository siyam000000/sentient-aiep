"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, Menu } from "lucide-react"

interface ChatItem {
  id: string
  title: string
  canGenerateNewChart: boolean
}

interface SidebarProps {
  chats: ChatItem[]
  onChatSelect: (id: string) => void
  onNewChat: () => void
  currentChatId: string | null
  canCreateNewChat: boolean
  language: "en" | "bg"
}

export function Sidebar({ chats, onChatSelect, onNewChat, currentChatId, canCreateNewChat, language }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-blue-800 p-2 z-10">
        <Button
          variant="ghost"
          className="w-full flex justify-between items-center text-white"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu className="h-5 w-5" />
          <span>{language === "en" ? "Chats" : "Чатове"}</span>
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
        {!isCollapsed && (
          <div className="mt-2 space-y-2">
            {chats.map((chat) => (
              <Button
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`w-full justify-start ${
                  chat.id === currentChatId ? "bg-blue-600" : "bg-transparent"
                } hover:bg-blue-700 text-white`}
              >
                <span className="truncate">{chat.title}</span>
              </Button>
            ))}
            <Button
              onClick={onNewChat}
              className="w-full justify-start bg-blue-700 hover:bg-blue-600 text-white"
              disabled={!canCreateNewChat}
            >
              <Plus className="mr-2 h-4 w-4" />
              {language === "en" ? "New Chat" : "Нов чат"}
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-blue-800 h-screen transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"} flex flex-col`}>
      <div className="flex justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white hover:bg-blue-700"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      {!isCollapsed && (
        <>
          <div className="flex-grow overflow-y-auto px-2 space-y-2">
            {chats.map((chat) => (
              <Button
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`w-full justify-start ${
                  chat.id === currentChatId ? "bg-blue-600" : "bg-transparent"
                } hover:bg-blue-700 text-white`}
              >
                <span className="truncate">{chat.title}</span>
              </Button>
            ))}
          </div>
          <div className="p-2">
            <Button
              onClick={onNewChat}
              className="w-full justify-start bg-blue-700 hover:bg-blue-600 text-white"
              disabled={!canCreateNewChat}
            >
              <Plus className="mr-2 h-4 w-4" />
              {language === "en" ? "New Chat" : "Нов чат"}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

