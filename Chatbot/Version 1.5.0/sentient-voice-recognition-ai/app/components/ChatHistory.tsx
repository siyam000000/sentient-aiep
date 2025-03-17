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
        <AnimatePresence mode="wait">
          <motion.div
            className="p-8 text-center text-gray-400 overflow-hidden"
            key="empty-history"
            initial={{ opacity: 0, y: -20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.5,
                ease: "easeOut",
              },
            }}
            exit={{
              opacity: 0,
              height: 0,
              marginTop: 0,
              marginBottom: 0,
              padding: 0,
              transition: {
                height: { delay: 0.1, duration: 0.3 },
                opacity: { duration: 0.2 },
                padding: { delay: 0.1, duration: 0.3 },
              },
            }}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: 0.2, duration: 0.4 },
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.15 },
              }}
            >
              No conversation history yet.
            </motion.p>
            <motion.p
              className="text-sm mt-2"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: 0.4, duration: 0.4 },
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.15 },
              }}
            >
              Your chat history will appear here.
            </motion.p>
          </motion.div>
        </AnimatePresence>
      ) : (
        <motion.div
          ref={scrollContainerRef}
          className="max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300 p-4 space-y-4"
          aria-live="polite"
          aria-label="Chat history"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{
                  opacity: 0,
                  x: message.role === "user" ? 10 : -10,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 350,
                    damping: 25,
                    delay: index > messages.length - 3 ? 0.05 * (index % 3) : 0,
                  },
                }}
                exit={{
                  opacity: 0,
                  x: message.role === "user" ? 10 : -10,
                  transition: { duration: 0.2 },
                }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <motion.div
                  className={`flex max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  } items-start gap-2 will-change-transform`}
                  whileHover={{
                    scale: 1.01,
                    transition: { duration: 0.2 },
                  }}
                >
                  <motion.div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === "user" ? "bg-blue-500" : "bg-purple-500"
                    }`}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      transition: { delay: 0.1, duration: 0.2 },
                    }}
                    aria-hidden="true"
                  >
                    {message.role === "user" ? (
                      <User size={16} className="text-white" />
                    ) : (
                      <Bot size={16} className="text-white" />
                    )}
                  </motion.div>
                  <motion.div
                    className={`p-3 rounded-lg ${message.role === "user" ? "bg-blue-500/80" : "bg-gray-700/80"}`}
                    initial={{ opacity: 0.7 }}
                    animate={{
                      opacity: 1,
                      transition: { duration: 0.3 },
                    }}
                  >
                    <p className="text-white break-words">{message.content}</p>
                    <motion.p
                      className="text-xs text-gray-300 mt-1"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        transition: { delay: 0.3, duration: 0.3 },
                      }}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </motion.p>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}

