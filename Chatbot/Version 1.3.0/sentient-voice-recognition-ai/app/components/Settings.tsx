"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useTheme } from "../contexts/ThemeContext"

export function Settings({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { voiceType, setVoiceType } = useTheme()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-md p-6 shadow-lg z-50"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Settings</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1 rounded-full bg-gray-800"
            >
              <X size={24} />
            </motion.button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Assistant Voice</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setVoiceType("male")}
                  className={`p-3 rounded-lg transition-colors ${
                    voiceType === "male" ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-300"
                  }`}
                >
                  Male
                </button>
                <button
                  onClick={() => setVoiceType("female")}
                  className={`p-3 rounded-lg transition-colors ${
                    voiceType === "female" ? "bg-red-500 text-white" : "bg-gray-800 text-gray-300"
                  }`}
                >
                  Female
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Male voice: Sonic (Default)
                <br />
                Female voice: Alloy
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-6 w-full bg-gray-800 text-white rounded-lg py-2 hover:bg-gray-700"
          >
            Close
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

