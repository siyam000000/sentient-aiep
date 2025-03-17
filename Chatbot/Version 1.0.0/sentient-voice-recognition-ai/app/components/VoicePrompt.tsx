"use client"

import { motion } from "framer-motion"

export function VoicePrompt({ isListening, isPending }: { isListening: boolean; isPending: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-8"
    >
      <h1 className="text-4xl font-bold mb-4">Voice AI Assistant</h1>
      <p className="text-xl">{isListening ? "Listening..." : isPending ? "Processing..." : "Speak or tap to start"}</p>
    </motion.div>
  )
}

