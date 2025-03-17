"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mic, MessageSquare, Volume2, Settings2 } from "lucide-react"
import Image from "next/image"

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  useEffect(() => {
    // Check if this is the first visit
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome")
    if (!hasSeenWelcome) {
      setIsOpen(true)
    }
  }, [])

  const closeModal = () => {
    setIsOpen(false)
    // Save to localStorage so we don't show the modal again
    localStorage.setItem("hasSeenWelcome", "true")
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      closeModal()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Welcome steps content in Bulgarian
  const steps = [
    {
      title: "Добре дошли в Sentient AI",
      description: "Вашият интелигентен гласов асистент, който разбира и отговаря на вашите въпроси с естествен глас.",
      icon: (
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/me2-8HOE5vM0UkfFRySvoCd8ZQagQdjJa3.png"
          alt="Sentient AI Logo"
          width={80}
          height={80}
          className="rounded-full"
        />
      ),
    },
    {
      title: "Говорете свободно",
      description:
        "Натиснете бутона с микрофон и започнете да говорите. Вашият глас ще бъде разпознат и обработен от нашия AI.",
      icon: <Mic size={60} className="text-blue-400" />,
    },
    {
      title: "Слушайте отговорите",
      description:
        "Sentient AI ще отговори на вашите въпроси с естествен глас, използвайки най-новите технологии за синтез на реч.",
      icon: <Volume2 size={60} className="text-purple-400" />,
    },
    {
      title: "Персонализирайте опита",
      description:
        "Използвайте настройките, за да промените гласа на асистента и прегледайте историята на вашите разговори.",
      icon: (
        <div className="flex space-x-4">
          <Settings2 size={40} className="text-gray-400" />
          <MessageSquare size={40} className="text-blue-400" />
        </div>
      ),
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 relative"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              aria-label="Затвори"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center justify-center py-6">
              {/* Progress indicator */}
              <div className="flex space-x-2 mb-8">
                {[...Array(totalSteps)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i + 1 <= currentStep ? "w-8 bg-blue-500" : "w-4 bg-gray-600"
                    }`}
                  />
                ))}
              </div>

              {/* Step content */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-6 flex items-center justify-center h-24">{steps[currentStep - 1].icon}</div>
                <h2 className="text-2xl font-bold mb-4 text-white">{steps[currentStep - 1].title}</h2>
                <p className="text-gray-300 mb-8">{steps[currentStep - 1].description}</p>
              </motion.div>

              {/* Navigation buttons */}
              <div className="flex justify-between w-full mt-4">
                <button
                  onClick={prevStep}
                  className={`px-4 py-2 rounded-lg ${
                    currentStep === 1 ? "text-gray-500 cursor-not-allowed" : "text-white bg-gray-700 hover:bg-gray-600"
                  }`}
                  disabled={currentStep === 1}
                >
                  Назад
                </button>
                <button onClick={nextStep} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg">
                  {currentStep === totalSteps ? "Започнете" : "Напред"}
                </button>
              </div>

              {/* Skip button */}
              <button onClick={closeModal} className="mt-4 text-sm text-gray-400 hover:text-gray-300">
                Пропуснете въведението
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

