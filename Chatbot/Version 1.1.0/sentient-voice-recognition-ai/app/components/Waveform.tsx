"use client"

import { motion } from "framer-motion"

export function Waveform({ isListening }: { isListening: boolean }) {
  return (
    <div className="flex justify-center items-center mt-4 space-x-1">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-blue-500 rounded-full"
          initial={{ height: 8 }}
          animate={{
            height: isListening ? [8, 32, 8] : 8,
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

