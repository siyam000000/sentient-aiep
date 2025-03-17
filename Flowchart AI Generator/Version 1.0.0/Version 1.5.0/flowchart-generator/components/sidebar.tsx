"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus, Menu, MessageSquare } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({
  chats,
  onChatSelect,
  onNewChat,
  currentChatId,
  canCreateNewChat,
  language,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
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
      <div className="fixed bottom-0 left-0 right-0 bg-blue-950 border-t border-blue-800 p-2 z-10">
        <Button
          variant="ghost"
          className="w-full flex justify-between items-center text-blue-300 hover:text-white hover:bg-blue-800/50"
          onClick={onToggleCollapse}
        >
          <Menu className="h-5 w-5" />
          <span>{language === "en" ? "Chats" : "Чатове"}</span>
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
        {!isCollapsed && (
          <div className="mt-2 bg-blue-950 border border-blue-800 rounded-t-lg shadow-lg">
            <ScrollArea className="max-h-[40vh]">
              <div className="p-2 space-y-2">
                {chats.map((chat) => (
                  <Button
                    key={chat.id}
                    onClick={() => onChatSelect(chat.id)}
                    className={`w-full justify-start ${
                      chat.id === currentChatId ? "bg-blue-700" : "bg-transparent"
                    } hover:bg-blue-700/70 text-white`}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 opacity-70" />
                    <span className="truncate">{chat.title}</span>
                  </Button>
                ))}
                <Button
                  onClick={onNewChat}
                  className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  disabled={!canCreateNewChat}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {language === "en" ? "New Chat" : "Нов чат"}
                </Button>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`bg-blue-950 border-r border-blue-800/50 h-full transition-all duration-300 flex flex-col ${
        isCollapsed ? "w-16" : "w-64"
      }`}
      style={{ height: "100%" }}
    >
      <div className="flex justify-end p-2 border-b border-blue-800/50">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="text-blue-300 hover:text-white hover:bg-blue-800/50"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          <ScrollArea className="flex-grow">
            <div className="px-2 py-4 space-y-1">
              {chats.map((chat) => (
                <Button
                  key={chat.id}
                  onClick={() => onChatSelect(chat.id)}
                  className={`w-full justify-start ${
                    chat.id === currentChatId ? "bg-blue-700" : "bg-transparent"
                  } hover:bg-blue-700/70 text-white`}
                >
                  <MessageSquare className="h-4 w-4 mr-2 opacity-70" />
                  <span className="truncate">{chat.title}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>

          <div className="p-2 border-t border-blue-800/50">
            <Button
              onClick={onNewChat}
              className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
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

