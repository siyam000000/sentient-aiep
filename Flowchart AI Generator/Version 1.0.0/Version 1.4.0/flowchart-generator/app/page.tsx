"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Download, AlertTriangle, Copy, Check, Wand2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import confetti from "canvas-confetti"
import { Sidebar } from "@/components/sidebar"
import { EnhancedButton } from "@/components/enhanced-button"
import { NavBar } from "@/components/nav-bar"
import { MermaidRenderer } from "@/components/mermaid-renderer"
import { SettingsModal } from "@/components/settings-modal"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cleanMermaidCode } from "@/utils/mermaid-helpers"
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

  // Refs
  const mermaidRendererRef = useRef<MermaidRendererRef>(null)

  // Hooks
  const { t } = useTranslations(language)

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

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-blue-900 text-white">
        <Sidebar
          chats={chats}
          onChatSelect={selectChat}
          onNewChat={createNewChat}
          currentChatId={currentChatId}
          canCreateNewChat={!chats.some((chat) => chat.canGenerateNewChart)}
          language={language}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <NavBar onSettingsClick={() => setIsSettingsOpen(true)} language={language} />

          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    {t("flowchartDescription")}
                  </label>
                  <Textarea
                    id="description"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t("descriptionPlaceholder")}
                    className="min-h-[200px] resize-none bg-blue-800 text-white placeholder-blue-300"
                  />
                </div>
                <div className="flex space-x-2">
                  <EnhancedButton
                    onClick={enhancePrompt}
                    isLoading={isEnhancing}
                    loadingText={t("enhancing")}
                    icon={<Wand2 className="h-4 w-4" />}
                    className="bg-purple-600 hover:bg-purple-700 flex-1"
                  >
                    {t("enhancePrompt")}
                  </EnhancedButton>
                  <EnhancedButton
                    onClick={generateFlowchart}
                    isLoading={isLoading}
                    loadingText={t("generating")}
                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                  >
                    {t("generateFlowchart")}
                  </EnhancedButton>
                </div>
                {enhancedInput && (
                  <div className="p-4 bg-blue-700 rounded-md">
                    <h3 className="font-semibold mb-2 text-white">{t("enhancedPrompt")}</h3>
                    <p className="text-blue-100 mb-2">{enhancedInput}</p>
                    <EnhancedButton onClick={useEnhancedPrompt} className="bg-green-600 hover:bg-green-700 w-full">
                      {t("useEnhancedPrompt")}
                    </EnhancedButton>
                  </div>
                )}
              </div>

              <div className="bg-blue-800 p-6 rounded-lg flex flex-col h-full">
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTitle>{t("error")}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {warning && (
                  <Alert className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{t("warning")}</AlertTitle>
                    <AlertDescription>{warning}</AlertDescription>
                  </Alert>
                )}
                {mermaidCode ? (
                  <div className="flex-1 flex flex-col">
                    <MermaidRenderer ref={mermaidRendererRef} code={mermaidCode} onCodeFix={handleCodeFix} />
                    <div className="flex justify-between mt-4 space-x-2">
                      <EnhancedButton
                        onClick={downloadFlowchart}
                        icon={<Download className="h-4 w-4" />}
                        className="bg-green-600 hover:bg-green-700 flex-1"
                      >
                        {t("downloadAsSVG")}
                      </EnhancedButton>
                      <EnhancedButton
                        onClick={copyToClipboard}
                        icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        className="bg-purple-600 hover:bg-purple-700 flex-1"
                      >
                        {copied ? t("copied") : t("copyCode")}
                      </EnhancedButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center text-blue-300">
                    <p>{t("flowchartPlaceholder")}</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} language={language} />
      </div>
    </TooltipProvider>
  )
}

