"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowRight, ArrowLeft, Lightbulb, Wand2, MessageSquare, Code, Share2, Zap } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { SupportedLanguage } from "@/config/app-config"

interface TutorialModalProps {
  isOpen: boolean
  onClose: () => void
  language: SupportedLanguage
}

interface TutorialStep {
  title: { en: string; bg: string }
  description: { en: string; bg: string }
  image?: string
  icon: React.ReactNode
  color: string
  tips?: { en: string[]; bg: string[] }
}

export function TutorialModal({ isOpen, onClose, language }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  // Reset to first step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
    }
  }, [isOpen])

  const tutorialSteps: TutorialStep[] = [
    {
      title: {
        en: "Welcome to Flowchart Generator!",
        bg: "Добре дошли в Генератора на диаграми!",
      },
      description: {
        en: "This tool helps you create beautiful flowcharts from simple text descriptions using AI. Let's walk through the main features and learn how to create professional diagrams in seconds.",
        bg: "Този инструмент ви помага да създавате красиви диаграми от прости текстови описания с помощта на AI. Нека разгледаме основните функции и научим как да създаваме професионални диаграми за секунди.",
      },
      icon: <Lightbulb className="h-10 w-10" />,
      color: "from-yellow-500 to-amber-600",
      tips: {
        en: [
          "No design skills required - just describe what you want",
          "Save time with AI-powered diagram generation",
          "Perfect for presentations, documentation, and planning",
        ],
        bg: [
          "Не са необходими дизайнерски умения - просто опишете какво искате",
          "Спестете време с генериране на диаграми с помощта на AI",
          "Идеално за презентации, документация и планиране",
        ],
      },
    },
    {
      title: {
        en: "Describe Your Flowchart",
        bg: "Опишете вашата диаграма",
      },
      description: {
        en: "Start by typing a description of the flowchart you want to create. Be as detailed as possible for better results. The AI will understand your intent and create a structured diagram.",
        bg: "Започнете, като въведете описание на диаграмата, която искате да създадете. Бъдете възможно най-подробни за по-добри резултати. AI ще разбере вашето намерение и ще създаде структурирана диаграма.",
      },
      icon: <MessageSquare className="h-10 w-10" />,
      color: "from-blue-500 to-blue-600",
      tips: {
        en: [
          "Example: 'Create a flowchart for user registration with email verification'",
          "Include key steps, decision points, and outcomes",
          "You can be specific about the type of diagram you want",
        ],
        bg: [
          "Пример: 'Създайте диаграма за регистрация на потребител с имейл верификация'",
          "Включете ключови стъпки, точки на решение и резултати",
          "Можете да бъдете конкретни за типа диаграма, която искате",
        ],
      },
    },
    {
      title: {
        en: "Enhance Your Prompt",
        bg: "Подобрете вашето описание",
      },
      description: {
        en: "Click 'Enhance Prompt' to let AI improve your description for better flowchart generation. This helps create more detailed and accurate flowcharts by refining your input.",
        bg: "Кликнете 'Подобри описанието', за да позволите на AI да подобри вашето описание за по-добро генериране на диаграми. Това помага за създаването на по-подробни и точни диаграми чрез усъвършенстване на вашия вход.",
      },
      icon: <Wand2 className="h-10 w-10" />,
      color: "from-purple-500 to-purple-600",
      tips: {
        en: [
          "Useful when you're not sure how to structure your description",
          "The AI will add missing details and improve clarity",
          "You can edit the enhanced prompt before generating",
        ],
        bg: [
          "Полезно, когато не сте сигурни как да структурирате описанието си",
          "AI ще добави липсващи детайли и ще подобри яснотата",
          "Можете да редактирате подобреното описание преди генериране",
        ],
      },
    },
    {
      title: {
        en: "Generate Your Flowchart",
        bg: "Генерирайте вашата диаграма",
      },
      description: {
        en: "Click 'Generate Flowchart' and watch as AI creates a flowchart based on your description. The AI will analyze your text and create a structured diagram that represents your process.",
        bg: "Кликнете 'Генерирай диаграма' и наблюдавайте как AI създава диаграма въз основа на вашето описание. AI ще анализира вашия текст и ще създаде структурирана диаграма, която представя вашия процес.",
      },
      icon: <Zap className="h-10 w-10" />,
      color: "from-green-500 to-green-600",
      tips: {
        en: [
          "The AI uses Mermaid syntax to create professional diagrams",
          "If you're not satisfied with the result, you can regenerate",
          "Complex processes may need to be broken down into smaller parts",
        ],
        bg: [
          "AI използва Mermaid синтаксис за създаване на професионални диаграми",
          "Ако не сте доволни от резултата, можете да регенерирате",
          "Сложните процеси може да се наложи да бъдат разбити на по-малки части",
        ],
      },
    },
    {
      title: {
        en: "Customize Your Diagram",
        bg: "Персонализирайте вашата диаграма",
      },
      description: {
        en: "Once generated, you can customize your diagram using the controls. Change the orientation, zoom in/out, or toggle the grid to make your flowchart perfect.",
        bg: "След генериране можете да персонализирате диаграмата си с помощта на контролите. Променете ориентацията, увеличете/намалете мащаба или превключете мрежата, за да направите диаграмата си перфектна.",
      },
      icon: <Code className="h-10 w-10" />,
      color: "from-indigo-500 to-indigo-600",
      tips: {
        en: [
          "Switch between vertical (TD) and horizontal (LR) layouts",
          "Zoom in to see details or zoom out for an overview",
          "The AI can fix any rendering issues automatically",
        ],
        bg: [
          "Превключвайте между вертикални (TD) и хоризонтални (LR) оформления",
          "Увеличете, за да видите детайли, или намалете за общ преглед",
          "AI може автоматично да поправи всякакви проблеми с рендерирането",
        ],
      },
    },
    {
      title: {
        en: "Download and Share",
        bg: "Изтеглете и споделете",
      },
      description: {
        en: "Once your flowchart is generated, you can download it as an SVG file or copy the Mermaid code to use in your own projects. Share your flowcharts with colleagues or include them in your documentation.",
        bg: "След като вашата диаграма е генерирана, можете да я изтеглите като SVG файл или да копирате Mermaid кода, за да го използвате в собствените си проекти. Споделете вашите диаграми с колеги или ги включете в документацията си.",
      },
      icon: <Share2 className="h-10 w-10" />,
      color: "from-blue-500 to-indigo-600",
      tips: {
        en: [
          "SVG files can be used in presentations, websites, and documents",
          "Mermaid code can be embedded in Markdown files or websites",
          "You can edit the code directly for advanced customization",
        ],
        bg: [
          "SVG файловете могат да се използват в презентации, уебсайтове и документи",
          "Mermaid кодът може да бъде вграден в Markdown файлове или уебсайтове",
          "Можете да редактирате кода директно за разширена персонализация",
        ],
      },
    },
  ]

  const currentStepData = tutorialSteps[currentStep]

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipTutorial = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-blue-950 text-white border-blue-800 shadow-2xl p-0 gap-0 overflow-hidden">
        <div className={`bg-gradient-to-r ${currentStepData.color} p-8 relative`}>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-full">{currentStepData.icon}</div>
            <DialogTitle className="text-2xl font-bold">{currentStepData.title[language]}</DialogTitle>
          </div>
        </div>

        <div className="p-6">
          <DialogDescription className="text-blue-100 text-base leading-relaxed mb-6">
            {currentStepData.description[language]}
          </DialogDescription>

          {currentStepData.tips && (
            <div className="mt-4 mb-6 bg-blue-900/50 rounded-lg border border-blue-800/50 p-4">
              <h4 className="font-semibold text-white mb-2">
                {language === "en" ? "Pro Tips:" : "Професионални съвети:"}
              </h4>
              <ul className="space-y-2">
                {currentStepData.tips[language].map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span className="text-blue-100">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentStepData.image && (
            <div className="mt-4 rounded-md overflow-hidden border border-blue-800">
              <img src={currentStepData.image || "/placeholder.svg"} alt="Tutorial step" className="w-full" />
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full mx-1 ${
                    index === currentStep ? "bg-blue-500" : index < currentStep ? "bg-blue-700" : "bg-blue-900"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={skipTutorial}
                className="text-blue-300 border-blue-800 hover:bg-blue-900 hover:text-white"
              >
                {language === "en" ? "Skip" : "Пропусни"}
              </Button>

              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="text-blue-300 border-blue-800 hover:bg-blue-900 hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {language === "en" ? "Back" : "Назад"}
                </Button>
              )}

              <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                {currentStep < tutorialSteps.length - 1
                  ? language === "en"
                    ? "Next"
                    : "Напред"
                  : language === "en"
                    ? "Finish"
                    : "Завърши"}
                {currentStep < tutorialSteps.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

