"use client"

import { motion } from "framer-motion"

export function VoicePrompt({ isListening, isPending }: { isListening: boolean; isPending: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-4"
    >
      <motion.p
        key={isListening ? "listening" : isPending ? "processing" : "idle"}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="text-2xl font-semibold"
      >
        {isListening ? "Listening..." : isPending ? "Processing..." : "Tap the mic to start speaking"}
      </motion.p>
      {!isListening && !isPending && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-gray-400 mt-2"
        >
          Make sure your microphone is connected and permissions are granted
        </motion.p>
      )}
    </motion.div>
  )
}

