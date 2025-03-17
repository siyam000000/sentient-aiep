"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useTheme } from "../contexts/ThemeContext"
import { useEffect } from "react"

export function Settings({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { voiceType, setVoiceType } = useTheme()

  // Close settings when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    // Prevent scrolling when settings are open
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Settings panel */}
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-md p-6 shadow-lg z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 id="settings-title" className="text-2xl font-bold">
                Settings
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1 rounded-full bg-gray-800 hover:bg-gray-700"
                aria-label="Close settings"
              >
                <X size={24} />
              </motion.button>
            </div>

            <div className="space-y-6">
              <div role="radiogroup" aria-labelledby="voice-type-label">
                <label id="voice-type-label" className="block text-sm font-medium mb-2">
                  Assistant Voice
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setVoiceType("male")}
                    className={`p-3 rounded-lg transition-colors ${
                      voiceType === "male" ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-300"
                    }`}
                    aria-checked={voiceType === "male"}
                    role="radio"
                  >
                    Male
                  </button>
                  <button
                    onClick={() => setVoiceType("female")}
                    className={`p-3 rounded-lg transition-colors ${
                      voiceType === "female" ? "bg-purple-500 text-white" : "bg-gray-800 text-gray-300"
                    }`}
                    aria-checked={voiceType === "female"}
                    role="radio"
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
        </>
      )}
    </AnimatePresence>
  )
}

