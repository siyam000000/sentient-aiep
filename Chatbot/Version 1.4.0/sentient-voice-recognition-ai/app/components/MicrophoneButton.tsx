"use client"

import { motion } from "framer-motion"
import { Mic } from "lucide-react"

interface MicrophoneButtonProps {
  isListening: boolean
  toggleListening: () => void
  disabled?: boolean
}

export function MicrophoneButton({ isListening, toggleListening, disabled = false }: MicrophoneButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleListening}
      className={`p-4 rounded-full ${isListening ? "bg-red-500" : "bg-blue-500"} transition-colors duration-200`}
      disabled={disabled}
      aria-label={isListening ? "Stop listening" : "Start listening"}
      title={isListening ? "Stop listening" : "Start listening"}
    >
      <Mic size={24} />
      <span className="sr-only">{isListening ? "Stop listening" : "Start listening"}</span>
    </motion.button>
  )
}

