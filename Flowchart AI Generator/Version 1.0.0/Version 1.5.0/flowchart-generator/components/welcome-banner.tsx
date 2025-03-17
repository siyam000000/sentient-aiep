"use client"
import { X, HelpCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SupportedLanguage } from "@/config/app-config"

interface WelcomeBannerProps {
  onStartTutorial: () => void
  onDismiss: () => void
  language: SupportedLanguage
}

export function WelcomeBanner({ onStartTutorial, onDismiss, language }: WelcomeBannerProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-4 relative overflow-hidden shadow-xl">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
        aria-label="Dismiss"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-start gap-6 relative z-10">
        <div className="bg-white/20 p-4 rounded-full">
          <HelpCircle className="h-8 w-8 text-white" />
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">
            {language === "en" ? "Welcome to Flowchart Generator!" : "Добре дошли в Генератора на диаграми!"}
          </h2>
          <p className="text-white/90 text-lg mb-4 max-w-2xl">
            {language === "en"
              ? "Create beautiful flowcharts from simple text descriptions using AI. Would you like a quick tour of the features?"
              : "Създавайте красиви диаграми от прости текстови описания с помощта на AI. Искате ли бързо разглеждане на функциите?"}
          </p>
          <Button
            onClick={onStartTutorial}
            className="bg-white text-blue-700 hover:bg-white/90 hover:text-blue-800 shadow-lg"
            size="lg"
          >
            {language === "en" ? "Take a quick tour" : "Разгледайте бързо"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

