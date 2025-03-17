"use client"

import type React from "react"
import { motion } from "framer-motion"

interface VoiceVisualizerProps {
  isListening: boolean
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isListening }) => {
  return (
    <div className="relative w-48 h-48">
      <motion.div
        className="absolute inset-0 bg-blue-500 rounded-full opacity-20"
        animate={{
          scale: isListening ? [1, 1.2, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute inset-4 bg-blue-600 rounded-full opacity-40"
        animate={{
          scale: isListening ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 1.2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 0.2,
        }}
      />
      <motion.div
        className="absolute inset-8 bg-blue-700 rounded-full flex items-center justify-center"
        animate={{
          scale: isListening ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 0.4,
        }}
      >
        <motion.div
          className="w-16 h-16 bg-white rounded-full"
          animate={{
            scale: isListening ? [1, 0.9, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  )
}

