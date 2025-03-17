"use client"

import { motion } from "framer-motion"
import { Slider } from "@/components/ui/slider"

interface ControlsProps {
  isAnimating: boolean
  toggleAnimation: () => void
  intensity: number
  setIntensity: (value: number) => void
  particleColor: string
  setParticleColor: (color: string) => void
}

export function Controls({
  isAnimating,
  toggleAnimation,
  intensity,
  setIntensity,
  particleColor,
  setParticleColor,
}: ControlsProps) {
  const colorOptions = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // purple
  ]

  return (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 w-full max-w-md"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <div className="space-y-6">
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleAnimation}
            className={`px-8 py-4 rounded-full font-bold text-lg transition-colors ${
              isAnimating ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isAnimating ? "Stop Animation" : "Start Animation"}
          </motion.button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Particle Intensity: {intensity}</label>
          <Slider value={[intensity]} min={10} max={200} step={1} onValueChange={(value) => setIntensity(value[0])} />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Particle Color</label>
          <div className="flex justify-between gap-2">
            {colorOptions.map((color) => (
              <motion.button
                key={color}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setParticleColor(color)}
                className={`w-10 h-10 rounded-full ${particleColor === color ? "ring-2 ring-white" : ""}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

