"use client"

import { motion } from "framer-motion"

export const ProcessingAnimation = () => {
  return (
    <motion.div className="flex justify-center items-center space-x-2">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-4 h-4 bg-blue-500 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            delay: index * 0.2,
          }}
        />
      ))}
    </motion.div>
  )
}

