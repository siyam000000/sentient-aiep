"use client"

import { motion } from "framer-motion"
import { Send } from "lucide-react"

interface SendButtonProps {
  onSend: () => void
  disabled?: boolean
}

export function SendButton({ onSend, disabled = false }: SendButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onSend}
      disabled={disabled}
      className={`p-4 rounded-full bg-gray-600 ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-500"}`}
      aria-label="Send message"
    >
      <Send size={24} />
    </motion.button>
  )
}

