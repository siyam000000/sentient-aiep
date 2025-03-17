"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  Cpu,
  Sparkles,
  Code,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Files,
  Keyboard,
  Globe,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const totalSteps = 3

  useEffect(() => {
    // Force the modal to show up after a short delay to ensure proper rendering
    const timer = setTimeout(() => {
      // Check if this is the first visit - only run in browser
      if (typeof window !== "undefined") {
        const hasVisitedBefore = localStorage.getItem("sentient-ai-visited")
        if (!hasVisitedBefore) {
          setIsOpen(true)
        }
      }
    }, 500)

    return () => clearTimeout(timer) // Clean up the timer
  }, [])

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      setIsOpen(false)
      if (typeof window !== "undefined") {
        localStorage.setItem("sentient-ai-visited", "true")
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSkip = () => {
    setIsOpen(false)
    if (typeof window !== "undefined") {
      localStorage.setItem("sentient-ai-visited", "true")
    }
  }

  // For development purposes - allows testing the welcome modal
  const resetWelcomeState = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sentient-ai-visited")
      window.location.reload()
    }
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) {
            localStorage.setItem("sentient-ai-visited", "true")
          }
        }}
      >
        <DialogContent className="sm:max-w-[700px] bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800 text-white shadow-xl shadow-blue-900/20 p-0 overflow-hidden">
          {/* Header with animated background */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-indigo-900 p-6">
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              style={{
                backgroundImage:
                  'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ffffff" fillOpacity="0.1" fillRule="evenodd"/%3E%3C/svg%3E")',
                backgroundSize: "400px 400px",
              }}
            />
            <DialogHeader className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-full">
                  <Sparkles className="h-8 w-8 text-blue-300" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white">Добре дошли в Sentient AI IDE</DialogTitle>
                  <DialogDescription className="text-blue-100 mt-1">
                    Вашият интелигентен помощник за кодиране, задвижван от Llama 3.3 70B
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-3 py-4 bg-gray-900/50 border-y border-gray-800">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i + 1)}
                className={`flex flex-col items-center gap-1 ${
                  i + 1 === step ? "text-blue-400" : "text-gray-500"
                } transition-colors duration-300 px-4 py-1 rounded-md ${
                  i + 1 === step ? "bg-blue-900/20" : "hover:bg-gray-800"
                }`}
              >
                <div className={`h-1.5 w-8 rounded-full ${i + 1 === step ? "bg-blue-500" : "bg-gray-700"}`} />
                <span className="text-xs font-medium">{i === 0 ? "Въведение" : i === 1 ? "Интерфейс" : "Начало"}</span>
              </button>
            ))}
          </div>

          <div className="relative overflow-hidden px-6" style={{ height: "380px" }}>
            <AnimatePresence mode="wait">
              {/* Step 1: Introduction */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 py-4 h-full overflow-y-auto"
                >
                  <h3 className="text-xl font-medium text-blue-400 flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    Запознайте се с вашия AI асистент за кодиране
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      className="bg-gray-800/70 p-4 rounded-lg border border-gray-700 transform transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-900/20"
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)" }}
                    >
                      <div className="flex items-center gap-2 mb-2 text-blue-400">
                        <Code className="h-5 w-5" />
                        <h4 className="font-medium">Генериране на код</h4>
                      </div>
                      <p className="text-sm text-gray-300">
                        Помолете AI да генерира HTML, CSS или JavaScript код за вас. Просто опишете какво ви трябва!
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gray-800/70 p-4 rounded-lg border border-gray-700 transform transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-900/20"
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)" }}
                    >
                      <div className="flex items-center gap-2 mb-2 text-blue-400">
                        <Lightbulb className="h-5 w-5" />
                        <h4 className="font-medium">Помощ при дебъгване</h4>
                      </div>
                      <p className="text-sm text-gray-300">
                        Имате проблем с бъг? AI може да помогне за идентифициране на проблеми и да предложи решения за
                        вашия код.
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gray-800/70 p-4 rounded-lg border border-gray-700 transform transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-900/20"
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)" }}
                    >
                      <div className="flex items-center gap-2 mb-2 text-blue-400">
                        <MessageSquare className="h-5 w-5" />
                        <h4 className="font-medium">Обяснения на код</h4>
                      </div>
                      <p className="text-sm text-gray-300">
                        Получете обяснения за сложни концепции в кода или научете как работят специфични функции.
                      </p>
                    </motion.div>

                    <motion.div
                      className="bg-gray-800/70 p-4 rounded-lg border border-gray-700 transform transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-900/20"
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)" }}
                    >
                      <div className="flex items-center gap-2 mb-2 text-blue-400">
                        <CheckCircle className="h-5 w-5" />
                        <h4 className="font-medium">Добри практики</h4>
                      </div>
                      <p className="text-sm text-gray-300">
                        Научете добри практики за кодиране и получете предложения за подобряване на качеството на вашия
                        код.
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Interface Overview */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 py-4 h-full overflow-y-auto"
                >
                  <h3 className="text-xl font-medium text-blue-400 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Разгледайте интерфейса
                  </h3>

                  <div className="space-y-4">
                    <motion.div
                      className="bg-gray-800/70 p-4 rounded-lg border border-gray-700 transform transition-all hover:bg-gray-800"
                      whileHover={{ x: 5, backgroundColor: "rgba(31, 41, 55, 0.9)" }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-blue-900/50 p-2 rounded-full">
                          <Files className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-400">Файлов мениджър</h4>
                          <p className="text-sm text-gray-300">
                            Управлявайте вашите файлове, създавайте нови, преименувайте или изтривайте съществуващи.
                            Всички ваши проектни файлове са организирани тук.
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-gray-800/70 p-4 rounded-lg border border-gray-700 transform transition-all hover:bg-gray-800"
                      whileHover={{ x: 5, backgroundColor: "rgba(31, 41, 55, 0.9)" }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-blue-900/50 p-2 rounded-full">
                          <Code className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-400">Редактор на код</h4>
                          <p className="text-sm text-gray-300">
                            Мощен редактор със синтактично оцветяване, автоматично довършване и други функции, които
                            правят кодирането по-лесно и ефективно.
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="bg-gray-800/70 p-4 rounded-lg border border-gray-700 transform transition-all hover:bg-gray-800"
                      whileHover={{ x: 5, backgroundColor: "rgba(31, 41, 55, 0.9)" }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-blue-900/50 p-2 rounded-full">
                          <MessageSquare className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-400">AI Асистент</h4>
                          <p className="text-sm text-gray-300">
                            Достъпвайте AI асистента по всяко време чрез бутона в лентата на състоянието или страничната
                            лента. Получете незабавна помощ с вашите задачи за кодиране.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Getting Started */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 py-4 h-full overflow-y-auto"
                >
                  <h3 className="text-xl font-medium text-blue-400 flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    Започнете сега
                  </h3>

                  <div className="bg-blue-900/30 p-5 rounded-lg border border-blue-800/50 shadow-inner">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-800/50 p-2 rounded-full mt-1">
                        <Keyboard className="h-5 w-5 text-blue-300" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-200 font-medium mb-2">
                          Използвайте клавишни комбинации за по-бърза работа:
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-300 mt-2">
                          <div className="flex items-center">
                            <span className="bg-blue-900/50 px-2 py-0.5 rounded text-xs mr-2 font-mono border border-blue-800/50">
                              Ctrl+S
                            </span>
                            <span>Запазване на файл</span>
                          </div>
                          <div className="flex items-center">
                            <span className="bg-blue-900/50 px-2 py-0.5 rounded text-xs mr-2 font-mono border border-blue-800/50">
                              Ctrl+P
                            </span>
                            <span>Командна палитра</span>
                          </div>
                          <div className="flex items-center">
                            <span className="bg-blue-900/50 px-2 py-0.5 rounded text-xs mr-2 font-mono border border-blue-800/50">
                              Ctrl+A
                            </span>
                            <span>Отваряне на AI асистент</span>
                          </div>
                          <div className="flex items-center">
                            <span className="bg-blue-900/50 px-2 py-0.5 rounded text-xs mr-2 font-mono border border-blue-800/50">
                              Ctrl+Z
                            </span>
                            <span>Отмяна</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-5 rounded-lg border border-blue-800/50">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-800/50 p-2 rounded-full mt-1">
                        <Globe className="h-5 w-5 text-purple-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-400 mb-2 text-lg">
                          Готови ли сте да започнете да кодирате?
                        </h4>
                        <p className="text-sm text-gray-300">
                          Започнете с редактиране на HTML, CSS и JavaScript файловете или помолете AI асистента да
                          генерира нов код за вас. Вашето пътешествие в кодирането с AI започва сега!
                        </p>
                        <div className="mt-4 flex justify-center">
                          <motion.div
                            className="bg-blue-600/50 px-4 py-2 rounded-full text-white font-medium"
                            animate={{
                              scale: [1, 1.05, 1],
                              boxShadow: [
                                "0 0 0 0 rgba(59, 130, 246, 0.5)",
                                "0 0 0 10px rgba(59, 130, 246, 0)",
                                "0 0 0 0 rgba(59, 130, 246, 0.5)",
                              ],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                              repeatType: "loop",
                            }}
                          >
                            Натиснете "Започнете" по-долу
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter className="flex justify-between p-4 bg-gray-900/80 border-t border-gray-800">
            <div>
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Назад
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkip} className="text-gray-400 hover:text-white hover:bg-gray-800">
                Пропуснете
              </Button>
              <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white px-6 font-medium">
                {step < totalSteps ? "Напред" : "Започнете"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Hidden developer button to reset welcome state - only visible in development */}
      {process.env.NODE_ENV === "development" && (
        <button
          onClick={resetWelcomeState}
          className="fixed bottom-2 left-2 text-xs text-gray-500 opacity-30 hover:opacity-100"
        >
          Reset Welcome
        </button>
      )}
    </>
  )
}

