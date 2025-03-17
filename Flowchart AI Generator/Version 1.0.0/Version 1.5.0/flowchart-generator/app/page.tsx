"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Download, AlertTriangle, Copy, Check, Wand2, HelpCircle, Lightbulb } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import confetti from "canvas-confetti"
import { Sidebar } from "@/components/sidebar"
import { EnhancedButton } from "@/components/enhanced-button"
import { NavBar } from "@/components/nav-bar"
import { MermaidRenderer } from "@/components/mermaid-renderer"
import { SettingsModal } from "@/components/settings-modal"
import { cleanMermaidCode } from "@/utils/mermaid-helpers"
import { TutorialModal } from "@/components/tutorial-modal"
import { FeatureTour, type TourStep } from "@/components/feature-tour"
import { WelcomeBanner } from "@/components/welcome-banner"
import type { ChatItem, MermaidRendererRef, SavedFlowchart } from "@/types"
import { API_ROUTES, type SupportedLanguage, UI_CONFIG } from "@/config/app-config"
import { useTranslations } from "@/hooks/use-translations"

/**
 * Main application page component
 */
export default function Home() {
  // State
  const [input, setInput] = useState("")
  const [mermaidCode, setMermaidCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [chats, setChats] = useState<ChatItem[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [renderError, setRenderError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [language, setLanguage] = useState<SupportedLanguage>("en")
  const [enhancedInput, setEnhancedInput] = useState<string | null>(null)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // New state for tutorial and onboarding
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)
  const [isFeatureTourActive, setIsFeatureTourActive] = useState(false)
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(true)

  // Refs
  const mermaidRendererRef = useRef<MermaidRendererRef>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Hooks
  const { t } = useTranslations(language)

  // Check if on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Check if this is the user's first visit
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem("hasVisitedBefore")
    if (!hasVisitedBefore) {
      setIsTutorialOpen(true)
      localStorage.setItem("hasVisitedBefore", "true")
    } else {
      // For returning users who haven't completed the tutorial
      const hasCompletedTutorial = localStorage.getItem("hasCompletedTutorial")
      if (!hasCompletedTutorial) {
        setShowWelcomeBanner(true)
      }
      setIsFirstVisit(false)
    }
  }, [])

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  // Mark tutorial as completed
  const handleTutorialComplete = () => {
    setIsTutorialOpen(false)
    localStorage.setItem("hasCompletedTutorial", "true")
  }

  // Start the feature tour
  const startFeatureTour = () => {
    setShowWelcomeBanner(false)
    setIsFeatureTourActive(true)
  }

  // Complete the feature tour
  const completeFeatureTour = () => {
    setIsFeatureTourActive(false)
    localStorage.setItem("hasCompletedTutorial", "true")
  }

  // Skip the feature tour
  const skipFeatureTour = () => {
    setIsFeatureTourActive(false)
  }

  // Dismiss the welcome banner
  const dismissWelcomeBanner = () => {
    setShowWelcomeBanner(false)
  }

  /**
   * Handles code fixes from the MermaidRenderer
   */
  const handleCodeFix = useCallback(
    (fixedCode: string) => {
      setMermaidCode(fixedCode)
      setWarning("The flowchart code was automatically fixed by AI")

      // Update the flowchart in the current chat
      if (currentChatId) {
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id === currentChatId && chat.flowcharts.length > 0) {
              const updatedFlowcharts = [...chat.flowcharts]
              const lastIndex = updatedFlowcharts.length - 1
              updatedFlowcharts[lastIndex] = {
                ...updatedFlowcharts[lastIndex],
                mermaidCode: fixedCode,
              }
              return {
                ...chat,
                flowcharts: updatedFlowcharts,
              }
            }
            return chat
          }),
        )
      }
    },
    [currentChatId],
  )

  /**
   * Creates a new chat
   */
  const createNewChat = useCallback(() => {
    const newChat: ChatItem = {
      id: Date.now().toString(),
      title: t("newChat"),
      flowcharts: [],
      canGenerateNewChart: true,
    }
    setChats((prevChats) => [...prevChats, newChat])
    setCurrentChatId(newChat.id)
    setInput("")
    setMermaidCode("")
    setError(null)
    setWarning(null)
  }, [t])

  /**
   * Initialize with a new chat if none exists
   */
  useEffect(() => {
    if (chats.length === 0) {
      createNewChat()
    }
  }, [chats.length, createNewChat])

  /**
   * Generates a flowchart from the current input
   */
  const generateFlowchart = async () => {
    if (!input.trim()) {
      setError(t("emptyInputError"))
      return
    }

    setError(null)
    setWarning(null)
    setRenderError(null)
    setIsLoading(true)

    try {
      const response = await fetch(API_ROUTES.GENERATE_FLOWCHART, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.mermaidCode) {
        throw new Error("No flowchart code received")
      }

      // Clean the mermaid code before setting it
      const cleanedCode = cleanMermaidCode(data.mermaidCode)
      setMermaidCode(cleanedCode)

      if (data.warning) {
        setWarning(data.warning)
      }

      // If the code was fixed during generation, show a warning
      if (data.wasFixed) {
        setWarning("The flowchart code was automatically fixed during generation")
      }

      // Show confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      // Save the flowchart to the current chat
      const newFlowchart: SavedFlowchart = {
        id: Date.now().toString(),
        description: input,
        mermaidCode: cleanedCode,
      }

      if (chats.length === 0 || !currentChatId) {
        createNewChat()
      }

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                flowcharts: [...chat.flowcharts, newFlowchart],
                canGenerateNewChart: false,
                title: chat.flowcharts.length === 0 ? input : chat.title,
              }
            : chat,
        ),
      )

      // Reset input after successful generation
      setInput("")
    } catch (error) {
      console.error("Error generating flowchart:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Downloads the current flowchart
   */
  const downloadFlowchart = async () => {
    if (!mermaidCode) {
      setError(t("downloadError"))
      return
    }

    if (mermaidRendererRef.current) {
      try {
        setError(null) // Clear any previous errors

        // Show a loading message
        const tempMessage = "Preparing download..."
        setWarning(tempMessage)

        // Small delay to ensure UI updates
        await new Promise((resolve) => setTimeout(resolve, 100))

        const success = await mermaidRendererRef.current.downloadDiagram()

        // Clear the temporary message
        setWarning(null)

        if (!success) {
          throw new Error("Failed to download diagram")
        }
      } catch (error) {
        console.error("Error downloading flowchart:", error)
        setError(t("rendererError"))
      }
    } else {
      setError(t("rendererError"))
    }
  }

  /**
   * Copies the Mermaid code to clipboard
   */
  const copyToClipboard = () => {
    navigator.clipboard.writeText(mermaidCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), UI_CONFIG.COPY_TIMEOUT_MS)
    })
  }

  /**
   * Selects a chat by ID
   */
  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId)
    const selectedChat = chats.find((chat) => chat.id === chatId)
    if (selectedChat && selectedChat.flowcharts.length > 0) {
      const lastFlowchart = selectedChat.flowcharts[selectedChat.flowcharts.length - 1]
      setInput(lastFlowchart.description)
      setMermaidCode(lastFlowchart.mermaidCode)
    } else {
      setInput("")
      setMermaidCode("")
    }
    setError(null)
    setWarning(null)
  }

  /**
   * Toggles between supported languages
   */
  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === "en" ? "bg" : "en"))
  }

  /**
   * Enhances the current prompt using AI
   */
  const enhancePrompt = async () => {
    setIsEnhancing(true)
    try {
      const response = await fetch(API_ROUTES.ENHANCE_PROMPT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      setEnhancedInput(data.enhancedPrompt)
    } catch (error) {
      console.error("Error enhancing prompt:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsEnhancing(false)
    }
  }

  /**
   * Uses the enhanced prompt as input
   */
  const useEnhancedPrompt = () => {
    if (enhancedInput) {
      setInput(enhancedInput)
      setEnhancedInput(null)
    }
  }

  // Feature tour steps
  const tourSteps: TourStep[] = [
    {
      target: "#description",
      title: {
        en: "Describe Your Flowchart",
        bg: "Опишете вашата диаграма",
      },
      content: {
        en: "Start by typing a description of the flowchart you want to create.",
        bg: "Започнете, като въведете описание на диаграмата, която искате да създадете.",
      },
      placement: "bottom",
    },
    {
      target: "#enhance-button",
      title: {
        en: "Enhance Your Prompt",
        bg: "Подобрете вашето описание",
      },
      content: {
        en: "Click here to let AI improve your description for better results.",
        bg: "Кликнете тук, за да позволите на AI да подобри вашето описание за по-добри резултати.",
      },
      placement: "top",
    },
    {
      target: "#generate-button",
      title: {
        en: "Generate Flowchart",
        bg: "Генерирайте диаграма",
      },
      content: {
        en: "Click here to generate a flowchart based on your description.",
        bg: "Кликнете тук, за да генерирате диаграма въз основа на вашето описание.",
      },
      placement: "top",
    },
  ]

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gradient-to-br from-blue-950 to-blue-900">
      <NavBar
        onSettingsClick={() => setIsSettingsOpen(true)}
        language={language}
        onLanguageToggle={toggleLanguage}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          chats={chats}
          onChatSelect={selectChat}
          onNewChat={createNewChat}
          currentChatId={currentChatId}
          canCreateNewChat={!chats.some((chat) => chat.canGenerateNewChart)}
          language={language}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className={`flex-1 flex flex-col overflow-hidden ${isMobile ? "pb-16" : ""}`}>
          {showWelcomeBanner && (
            <WelcomeBanner onStartTutorial={startFeatureTour} onDismiss={dismissWelcomeBanner} language={language} />
          )}

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-4 p-2 md:p-4 overflow-hidden h-full">
            {/* Input Panel */}
            <div className="flex flex-col h-full overflow-hidden bg-blue-900/50 backdrop-blur-sm rounded-xl border border-blue-800/50 shadow-xl">
              <div className="p-3 md:p-4 border-b border-blue-800/50">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-400" />
                  {t("flowchartDescription")}
                </h2>
              </div>

              <div className="flex-1 flex flex-col p-3 md:p-4 pb-4 md:pb-6 overflow-auto md:overflow-hidden">
                {/* Use ScrollArea for better mobile scrolling */}
                <ScrollArea className="flex-1 min-h-0">
                  <Textarea
                    id="description"
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t("descriptionPlaceholder")}
                    className="w-full min-h-[150px] resize-none bg-blue-800/30 border-blue-700/50 text-white placeholder-blue-300/20 rounded-lg shadow-inner"
                  />
                </ScrollArea>

                <div className="flex gap-3 mt-4">
                  <EnhancedButton
                    id="enhance-button"
                    onClick={enhancePrompt}
                    isLoading={isEnhancing}
                    loadingText={t("enhancing")}
                    icon={<Wand2 className="h-4 w-4" />}
                    className="bg-purple-600 hover:bg-purple-700 flex-1 shadow-md"
                  >
                    {t("enhancePrompt")}
                  </EnhancedButton>
                  <EnhancedButton
                    id="generate-button"
                    onClick={generateFlowchart}
                    isLoading={isLoading}
                    loadingText={t("generating")}
                    className="bg-blue-600 hover:bg-blue-700 flex-1 shadow-md"
                  >
                    {t("generateFlowchart")}
                  </EnhancedButton>
                </div>

                {enhancedInput && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-700/80 to-purple-700/80 rounded-lg shadow-lg border border-blue-600/50 backdrop-blur-sm">
                    <h3 className="font-semibold mb-2 text-white">{t("enhancedPrompt")}</h3>
                    <ScrollArea className="max-h-[150px] mb-3">
                      <p className="text-blue-100">{enhancedInput}</p>
                    </ScrollArea>
                    <EnhancedButton
                      onClick={useEnhancedPrompt}
                      className="bg-green-600 hover:bg-green-700 w-full shadow-md mt-3"
                    >
                      {t("useEnhancedPrompt")}
                    </EnhancedButton>
                  </div>
                )}
              </div>
            </div>

            {/* Output Panel */}
            <div className="flex flex-col h-full overflow-hidden bg-blue-900/50 backdrop-blur-sm rounded-xl border border-blue-800/50 shadow-xl">
              <div className="p-3 md:p-4 border-b border-blue-800/50">
                <h2 className="text-xl font-semibold text-white">{t("flowchartOutput")}</h2>
              </div>

              <div className="flex-1 flex flex-col p-3 md:p-4 overflow-hidden">
                {error && (
                  <Alert variant="destructive" className="mb-4 border-red-800 bg-red-900/50 text-white">
                    <AlertTitle className="text-white">{t("error")}</AlertTitle>
                    <AlertDescription className="text-red-100">{error}</AlertDescription>
                  </Alert>
                )}

                {warning && (
                  <Alert className="mb-4 border-amber-600 bg-amber-700/30 text-white">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <AlertTitle className="text-white">{t("warning")}</AlertTitle>
                    <AlertDescription className="text-amber-100">{warning}</AlertDescription>
                  </Alert>
                )}

                <div className="flex-1 overflow-hidden bg-blue-800/30 rounded-lg shadow-inner">
                  {mermaidCode ? (
                    <div className="h-full flex flex-col">
                      <div className="flex-1 overflow-hidden">
                        <MermaidRenderer ref={mermaidRendererRef} code={mermaidCode} onCodeFix={handleCodeFix} />
                      </div>
                      <div className="flex justify-between mt-4 gap-3">
                        <EnhancedButton
                          onClick={downloadFlowchart}
                          icon={<Download className="h-4 w-4" />}
                          className="bg-green-600 hover:bg-green-700 flex-1 shadow-md"
                        >
                          {t("downloadAsSVG")}
                        </EnhancedButton>
                        <EnhancedButton
                          onClick={copyToClipboard}
                          icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          className="bg-purple-600 hover:bg-purple-700 flex-1 shadow-md"
                        >
                          {copied ? t("copied") : t("copyCode")}
                        </EnhancedButton>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-center p-6">
                      <div className="max-w-md">
                        <div className="bg-blue-700/30 p-6 rounded-full inline-flex mb-4">
                          <Lightbulb className="h-10 w-10 text-blue-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">{t("noFlowchartTitle")}</h3>
                        <p className="text-blue-200">{t("flowchartPlaceholder")}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Help Button */}
      <button
        onClick={() => setIsTutorialOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50 group"
        aria-label={language === "en" ? "Help" : "Помощ"}
      >
        <HelpCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Modals and Tours */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} language={language} />

      <TutorialModal isOpen={isTutorialOpen} onClose={handleTutorialComplete} language={language} />

      {isFeatureTourActive && (
        <FeatureTour
          steps={tourSteps}
          isActive={isFeatureTourActive}
          onComplete={completeFeatureTour}
          onSkip={skipFeatureTour}
          language={language}
        />
      )}
    </div>
  )
}

