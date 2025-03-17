"use client"
import { Button } from "@/components/ui/button"
import { Terminal, Play, Split, MessageSquare, X } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

interface StatusBarProps {
  currentLine: number
  currentColumn: number
  indentationSize: number
  toggleIndentationSize: () => void
  togglePreview: () => void
  showPreview: boolean
  runCode: () => void
  toggleAIAssistant: () => void
  showAITip: boolean
  setShowAITip: (show: boolean) => void
  language: string
  isSaved: boolean
}

export function StatusBar({
  currentLine,
  currentColumn,
  indentationSize,
  toggleIndentationSize,
  togglePreview,
  showPreview,
  runCode,
  toggleAIAssistant,
  showAITip,
  setShowAITip,
  language,
  isSaved,
}: StatusBarProps) {
  const { t } = useTranslation()

  const getLanguageLabel = () => {
    switch (language) {
      case "html":
        return "HTML"
      case "css":
        return "CSS"
      case "javascript":
        return "JavaScript"
      default:
        return language.toUpperCase()
    }
  }

  return (
    <div className="h-8 bg-gray-900 text-white flex items-center px-4 text-sm overflow-x-auto border-t border-gray-800">
      <div className="flex items-center gap-4 flex-shrink-0">
        <Button variant="ghost" size="sm" className="h-6 px-2 hover:bg-gray-800 rounded-md" onClick={togglePreview}>
          {showPreview ? <Split className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span className="ml-1">{t(showPreview ? "splitView" : "preview")}</span>
        </Button>
        <Button variant="ghost" size="sm" className="h-6 px-2 hover:bg-gray-800 rounded-md" onClick={runCode}>
          <Play className="w-4 h-4" />
          <span className="ml-1">{t("run")}</span>
        </Button>
      </div>
      <div className="flex items-center gap-4 ml-auto flex-shrink-0">
        <span className="px-2 py-0.5 bg-gray-800 rounded text-xs">{getLanguageLabel()}</span>
        <span>
          {t("line")} {currentLine}, {t("column")} {currentColumn}
        </span>
        <span
          className="cursor-pointer hover:underline px-2 py-0.5 bg-gray-800 rounded"
          onClick={toggleIndentationSize}
          title={t("clickToToggleIndentation")}
        >
          {t("spaces")}: {indentationSize}
        </span>
        <span className="text-gray-400">UTF-8</span>
        {!isSaved && <span className="text-yellow-400">●</span>}
        <Terminal className="w-4 h-4" />

        <div className="relative">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 hover:bg-gray-800 rounded-md relative"
                  onClick={toggleAIAssistant}
                >
                  <MessageSquare className="w-4 h-4 mr-1 text-blue-400" />
                  <span className="text-blue-400">{t("aiAssistant")}</span>

                  {/* Pulsing indicator for new users */}
                  {showAITip && (
                    <motion.span
                      className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "loop",
                      }}
                    />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-gray-800 text-white border-gray-700 p-3 max-w-xs">
                <p className="text-sm">
                  Get AI-powered coding assistance, generate code, debug issues, and learn new concepts!
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Floating tip for new users */}
          <AnimatePresence>
            {showAITip && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-full right-0 mb-2 bg-blue-600 text-white p-2 rounded-lg shadow-lg w-64"
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Try the AI Coding Helper!</p>
                    <p className="text-xs mt-1">Get code suggestions, debugging help, and more.</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 -mr-1 -mt-1 text-white/80 hover:text-white hover:bg-blue-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowAITip(false)
                      if (typeof window !== "undefined") {
                        localStorage.setItem("sentient-ai-tip-shown", "true")
                      }
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="absolute bottom-0 right-4 transform translate-y-full">
                  <div className="w-3 h-3 bg-blue-600 transform rotate-45" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

