"use client"

import { motion, AnimatePresence } from "framer-motion"
import { User, Bot } from "lucide-react"
import { useRef, useEffect } from "react"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

interface ChatHistoryProps {
  messages: ChatMessage[]
  isVisible: boolean
}

export function ChatHistory({ messages, isVisible }: ChatHistoryProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (isVisible && scrollContainerRef.current && messages.length > 0) {
      const scrollContainer = scrollContainerRef.current
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    }
  }, [messages, isVisible])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full mb-6 rounded-lg bg-gray-800/30 backdrop-blur-sm"
    >
      {messages.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          <p>No conversation history yet.</p>
          <p className="text-sm mt-2">Your chat history will appear here.</p>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300 p-4 space-y-4"
          aria-live="polite"
          aria-label="Chat history"
        >
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  } items-start gap-2`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "user" ? "bg-blue-500" : "bg-purple-500"
                    }`}
                    aria-hidden="true"
                  >
                    {message.role === "user" ? (
                      <User size={16} className="text-white" />
                    ) : (
                      <Bot size={16} className="text-white" />
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${message.role === "user" ? "bg-blue-500/80" : "bg-gray-700/80"}`}>
                    <p className="text-white break-words">{message.content}</p>
                    <p className="text-xs text-gray-300 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

