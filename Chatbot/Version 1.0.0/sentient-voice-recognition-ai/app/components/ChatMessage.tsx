"use client"

import { motion } from "framer-motion"

interface Message {
  role: "user" | "assistant"
  content: string
  latency?: number
}

export function ChatMessage({ message }: { message: Message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-3/4 p-3 rounded-lg ${
          message.role === "user" ? "bg-white text-black" : "bg-gray-800 text-white"
        }`}
      >
        <p>{message.content}</p>
        {message.latency && <span className="text-xs text-gray-500 mt-1 block">{message.latency}ms</span>}
      </div>
    </motion.div>
  )
}

