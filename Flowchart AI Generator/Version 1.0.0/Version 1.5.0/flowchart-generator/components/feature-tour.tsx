"use client"

import { useState, useEffect } from "react"
import { X, ArrowRight, ArrowLeft } from "lucide-react"
import type { SupportedLanguage } from "@/config/app-config"
import { Button } from "@/components/ui/button"

interface FeatureTourProps {
  steps: TourStep[]
  isActive: boolean
  onComplete: () => void
  onSkip: () => void
  language: SupportedLanguage
}

export interface TourStep {
  target: string
  title: { en: string; bg: string }
  content: { en: string; bg: string }
  placement?: "top" | "bottom" | "left" | "right"
}

export function FeatureTour({ steps, isActive, onComplete, onSkip, language }: FeatureTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [tooltipSize, setTooltipSize] = useState({ width: 320, height: 200 })

  useEffect(() => {
    if (!isActive) return

    const updatePosition = () => {
      const currentStepData = steps[currentStep]
      const targetElement = document.querySelector(currentStepData.target)

      if (targetElement) {
        const rect = targetElement.getBoundingClientRect()
        const placement = currentStepData.placement || "bottom"

        let top = 0
        let left = 0

        switch (placement) {
          case "top":
            top = rect.top - tooltipSize.height - 16
            left = rect.left + rect.width / 2 - tooltipSize.width / 2
            break
          case "bottom":
            top = rect.bottom + 16
            left = rect.left + rect.width / 2 - tooltipSize.width / 2
            break
          case "left":
            top = rect.top + rect.height / 2 - tooltipSize.height / 2
            left = rect.left - tooltipSize.width - 16
            break
          case "right":
            top = rect.top + rect.height / 2 - tooltipSize.height / 2
            left = rect.right + 16
            break
        }

        // Ensure tooltip stays within viewport
        if (left < 16) left = 16
        if (left + tooltipSize.width > window.innerWidth - 16) left = window.innerWidth - tooltipSize.width - 16
        if (top < 16) top = 16
        if (top + tooltipSize.height > window.innerHeight - 16) top = window.innerHeight - tooltipSize.height - 16

        setPosition({ top, left })

        // Highlight the target element
        targetElement.classList.add(
          "ring-4",
          "ring-blue-500",
          "ring-opacity-70",
          "ring-offset-4",
          "ring-offset-blue-950",
          "z-50",
        )

        // Add a pulse animation
        targetElement.classList.add("animate-pulse")
      }
    }

    updatePosition()

    // Add resize listener
    window.addEventListener("resize", updatePosition)

    // Cleanup
    return () => {
      window.removeEventListener("resize", updatePosition)
      // Remove highlight from all elements
      document.querySelectorAll(".ring-4").forEach((el) => {
        el.classList.remove(
          "ring-4",
          "ring-blue-500",
          "ring-opacity-70",
          "ring-offset-4",
          "ring-offset-blue-950",
          "z-50",
          "animate-pulse",
        )
      })
    }
  }, [currentStep, isActive, steps, tooltipSize])

  if (!isActive) return null

  const currentStepData = steps[currentStep]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-blue-950/70 z-40" onClick={onSkip} />

      {/* Tooltip */}
      <div
        className="fixed z-50 bg-blue-950 border border-blue-800 rounded-xl shadow-2xl overflow-hidden"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: `${tooltipSize.width}px`,
        }}
        ref={(el) => {
          if (el) {
            setTooltipSize({
              width: el.offsetWidth,
              height: el.offsetHeight,
            })
          }
        }}
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">{currentStepData.title[language]}</h3>
            <button
              onClick={onSkip}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <p className="text-blue-100 mb-6">{currentStepData.content[language]}</p>

          <div className="flex justify-between items-center">
            <div className="text-sm text-blue-400">
              {language === "en" ? "Step" : "Стъпка"} {currentStep + 1}/{steps.length}
            </div>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  className="border-blue-800 text-blue-300 hover:bg-blue-900 hover:text-white"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  {language === "en" ? "Back" : "Назад"}
                </Button>
              )}
              <Button size="sm" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                {currentStep < steps.length - 1
                  ? language === "en"
                    ? "Next"
                    : "Напред"
                  : language === "en"
                    ? "Finish"
                    : "Завърши"}
                {currentStep < steps.length - 1 && <ArrowRight className="ml-1 h-3 w-3" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

