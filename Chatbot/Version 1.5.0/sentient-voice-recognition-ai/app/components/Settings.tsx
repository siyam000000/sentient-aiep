"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Info } from "lucide-react"
import { useTheme } from "../contexts/ThemeContext"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// Define model information
const MODEL_INFO = {
  "gemma2-9b-it": {
    name: "Gemma 2 (9B)",
    description: "Fast with good quality responses",
    color: "bg-green-500",
  },
  "llama3-70b-8192": {
    name: "Llama 3.3 (70B)",
    description: "High quality with good reasoning",
    color: "bg-blue-500",
  },
  "distil-whisper-large-v3-en": {
    name: "Distil Whisper",
    description: "Optimized for speech recognition",
    color: "bg-yellow-500",
  },
  "mixtral-8x7b-32768": {
    name: "Mixtral 8x7B",
    description: "Balanced performance with long context",
    color: "bg-purple-500",
  },
}

export function Settings({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { voiceType, setVoiceType, modelType, setModelType } = useTheme()
  const [showModelInfo, setShowModelInfo] = useState<string | null>(null)

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

  const handleModelChange = (model: string) => {
    setModelType(model as any)
    toast.success(`Model changed to ${MODEL_INFO[model as keyof typeof MODEL_INFO].name}`)
  }

  const toggleModelInfo = (model: string | null) => {
    setShowModelInfo(model)
  }

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
            className="fixed top-0 right-0 h-full w-96 bg-gray-900/95 backdrop-blur-md p-6 shadow-lg z-50 overflow-y-auto"
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

            <div className="space-y-8">
              {/* Voice Type Selection */}
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
                  Male voice: Griffin (Default)
                  <br />
                  Female voice: Sophie
                </p>
              </div>

              {/* Model Selection */}
              <div role="radiogroup" aria-labelledby="model-type-label">
                <div className="flex items-center justify-between mb-2">
                  <label id="model-type-label" className="block text-sm font-medium">
                    AI Model
                  </label>
                </div>

                <div className="space-y-2">
                  {Object.entries(MODEL_INFO).map(([model, info]) => (
                    <div key={model} className="relative">
                      <button
                        onClick={() => handleModelChange(model)}
                        className={`w-full p-3 rounded-lg transition-colors flex justify-between items-center ${
                          modelType === model
                            ? `${info.color} text-white`
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                        aria-checked={modelType === model}
                        role="radio"
                      >
                        <span>{info.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleModelInfo(model === showModelInfo ? null : model)
                          }}
                          className="p-1 rounded-full bg-gray-700/50 hover:bg-gray-600/50"
                          aria-label={`Show info about ${info.name}`}
                        >
                          <Info size={14} />
                        </button>
                      </button>

                      <AnimatePresence>
                        {showModelInfo === model && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-1 p-2 bg-gray-800 rounded-md text-xs text-gray-300"
                          >
                            {info.description}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-400 mt-2">Model selection affects response quality and speed</p>
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

