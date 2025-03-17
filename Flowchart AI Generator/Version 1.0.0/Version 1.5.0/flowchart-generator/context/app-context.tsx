"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { SupportedLanguage } from "@/config/app-config"
import type { ChatItem } from "@/types"

interface AppContextType {
  language: SupportedLanguage
  setLanguage: (language: SupportedLanguage) => void
  chats: ChatItem[]
  currentChatId: string | null
  createNewChat: () => void
  selectChat: (id: string) => void
  updateChat: (id: string, updates: Partial<ChatItem>) => void
  addFlowchartToChat: (chatId: string, description: string, mermaidCode: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>("en")
  const [chats, setChats] = useState<ChatItem[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)

  const createNewChat = useCallback(() => {
    const newChat: ChatItem = {
      id: Date.now().toString(),
      title: language === "en" ? "New Chat" : "Нов чат",
      flowcharts: [],
      canGenerateNewChart: true,
    }
    setChats((prevChats) => [...prevChats, newChat])
    setCurrentChatId(newChat.id)
    return newChat.id
  }, [language])

  const selectChat = useCallback((id: string) => {
    setCurrentChatId(id)
  }, [])

  const updateChat = useCallback((id: string, updates: Partial<ChatItem>) => {
    setChats((prevChats) => prevChats.map((chat) => (chat.id === id ? { ...chat, ...updates } : chat)))
  }, [])

  const addFlowchartToChat = useCallback((chatId: string, description: string, mermaidCode: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === chatId) {
          const newFlowchart = {
            id: Date.now().toString(),
            description,
            mermaidCode,
          }
          return {
            ...chat,
            flowcharts: [...chat.flowcharts, newFlowchart],
            canGenerateNewChart: false,
            title: chat.flowcharts.length === 0 ? description : chat.title,
          }
        }
        return chat
      }),
    )
  }, [])

  // Initialize with a new chat if none exists
  if (chats.length === 0) {
    createNewChat()
  }

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        chats,
        currentChatId,
        createNewChat,
        selectChat,
        updateChat,
        addFlowchartToChat,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

