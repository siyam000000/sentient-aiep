"use client"

import type React from "react"
import { motion } from "framer-motion"

interface AIResponseProps {
  response: string
  isSpeaking: boolean
}

export const AIResponse: React.FC<AIResponseProps> = ({ response, isSpeaking }) => {
  return (
    <motion.div
      className={`w-full bg-gray-800 rounded-lg p-4 shadow-lg ${isSpeaking ? "border-2 border-purple-500" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-white font-semibold mb-2">AI Response:</h3>
      <p className="text-gray-300">{response || "Waiting for your input..."}</p>
    </motion.div>
  )
}

