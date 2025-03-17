"use client"

import type React from "react"
import { motion } from "framer-motion"

interface VoiceWaveformProps {
  isListening: boolean
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ isListening }) => {
  return (
    <div className="flex justify-center items-center space-x-1 h-6">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-purple-500 rounded-full"
          initial={{ height: 4 }}
          animate={{
            height: isListening ? [4, 16, 4] : 4,
          }}
          transition={{
            duration: 0.5,
            repeat: isListening ? Number.POSITIVE_INFINITY : 0,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  )
}

