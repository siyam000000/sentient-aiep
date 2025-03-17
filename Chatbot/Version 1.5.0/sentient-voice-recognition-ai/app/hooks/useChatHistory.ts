"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import type { ChatMessage } from "../components/ChatHistory"

const STORAGE_KEY = "voiceAssistantChatHistory"
const MAX_HISTORY_LENGTH = 100 // Prevent localStorage from getting too large

export function useChatHistory() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [showChatHistory, setShowChatHistory] = useState(false)

  // Load chat history from localStorage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY)
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory)
        if (Array.isArray(parsed)) {
          setChatHistory(parsed)
        } else {
          throw new Error("Invalid chat history format")
        }
      }
    } catch (e) {
      console.error("Failed to parse chat history:", e)
      localStorage.removeItem(STORAGE_KEY)
      toast.error("Failed to load chat history. History has been reset.")
    }
  }, [])

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      try {
        // Limit history size to prevent localStorage quota issues
        const historyToSave = chatHistory.slice(-MAX_HISTORY_LENGTH)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(historyToSave))
      } catch (e) {
        console.error("Failed to save chat history:", e)
        toast.error("Failed to save chat history. Storage may be full.")
      }
    }
  }, [chatHistory])

  const addMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: Date.now(),
    }

    setChatHistory((prev) => {
      // Limit history size in memory
      const updatedHistory = [...prev, newMessage]
      if (updatedHistory.length > MAX_HISTORY_LENGTH) {
        return updatedHistory.slice(-MAX_HISTORY_LENGTH)
      }
      return updatedHistory
    })
  }

  const clearChatHistory = () => {
    setChatHistory([])
    localStorage.removeItem(STORAGE_KEY)
    toast.success("Chat history cleared")
  }

  const toggleChatHistory = () => {
    setShowChatHistory((prev) => !prev)
  }

  return {
    chatHistory,
    showChatHistory,
    addMessage,
    clearChatHistory,
    toggleChatHistory,
  }
}

