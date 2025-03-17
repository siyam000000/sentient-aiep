"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Download, AlertTriangle, Copy, Check, Wand2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import mermaid from "mermaid"
import { SettingsModal } from "@/components/settings-modal"
import { TooltipProvider } from "@/components/ui/tooltip"
import confetti from "canvas-confetti"
import { Sidebar } from "@/components/sidebar"
import { EnhancedButton } from "@/components/enhanced-button"
import { NavBar } from "@/components/nav-bar"
import { MermaidRenderer } from "@/components/mermaid-renderer"
// Add import for the new helper functions
import { cleanMermaidCode } from "@/utils/mermaid-helpers"

interface SavedFlowchart {
  id: string
  description: string
  mermaidCode: string
}

interface ChatItem {
  id: string
  title: string
  flowcharts: SavedFlowchart[]
  canGenerateNewChart: boolean
}

export default function Home() {
  const [input, setInput] = useState("")
  const [mermaidCode, setMermaidCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const mermaidRef = useRef<HTMLDivElement>(null)
  const [chats, setChats] = useState<ChatItem[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [renderError, setRenderError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [language, setLanguage] = useState<"en" | "bg">("en")
  const [enhancedInput, setEnhancedInput] = useState<string | null>(null)
  const [isEnhancing, setIsEnhancing] = useState(false)

  // Add ref for MermaidRenderer
  const mermaidRendererRef = useRef<any>(null)

  const handleCodeFix = (fixedCode: string) => {
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
  }

  const renderMermaid = useCallback(() => {
    if (mermaidRef.current && mermaidCode) {
      try {
        mermaidRef.current.innerHTML = ""
        mermaid.initialize({
          startOnLoad: true,
          theme: "default",
          flowchart: {
            curve: "basis",
            padding: 20,
          },
        })
        const diagramDiv = document.createElement("div")
        diagramDiv.textContent = mermaidCode
        mermaidRef.current.appendChild(diagramDiv)
        mermaid.run({
          nodes: [diagramDiv],
        })
        setRenderError(null)
      } catch (error) {
        console.error("Error rendering Mermaid diagram:", error)
        setRenderError(
          `Failed to render the flowchart. Syntax error: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }
  }, [mermaidCode])

  useEffect(() => {
    if (mermaidCode) {
      renderMermaid()
    }
  }, [mermaidCode, renderMermaid])

  const createNewChat = useCallback(() => {
    const newChat: ChatItem = {
      id: Date.now().toString(),
      title: language === "en" ? "New Chat" : "Нов чат",
      flowcharts: [],
      canGenerateNewChart: true,
    }
    setChats((prevChats) => [...prevChats, newChat])
    setCurrentChatId(newChat.id)
    setInput("")
    setMermaidCode("")
    setError(null)
    setWarning(null)
  }, [language])

  useEffect(() => {
    if (chats.length === 0) {
      createNewChat()
    }
  }, [chats.length, createNewChat])

  // Update the generateFlowchart function to clean the mermaid code
  const generateFlowchart = async () => {
    if (!input.trim()) {
      setError(
        language === "en"
          ? "Please enter a description for your flowchart"
          : "Моля, въведете описание за вашата диаграма",
      )
      return
    }

    setError(null)
    setWarning(null)
    setRenderError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/generate-flowchart", {
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
        throw new Error(language === "en" ? "No flowchart code received" : "Не е получен код за диаграма")
      }

      // Clean the mermaid code before setting it
      const cleanedCode = cleanMermaidCode(data.mermaidCode)
      setMermaidCode(cleanedCode)

      if (data.warning) {
        setWarning(data.warning)
      }

      // If the code was fixed during generation, show a warning
      if (data.wasFixed) {
        setWarning(
          language === "en"
            ? "The flowchart code was automatically fixed during generation"
            : "Кодът на диаграмата беше автоматично поправен по време на генерирането",
        )
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

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
      setError(
        error instanceof Error
          ? error.message
          : language === "en"
            ? "An unexpected error occurred while generating the flowchart"
            : "Възникна неочаквана грешка при генерирането на диаграмата",
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Update the downloadFlowchart function
  const downloadFlowchart = async () => {
    if (!mermaidCode) {
      setError(
        language === "en"
          ? "No flowchart to download. Please generate a flowchart first."
          : "Няма диаграма за изтегляне. Моля, първо генерирайте диаграма.",
      )
      return
    }

    if (mermaidRendererRef.current) {
      try {
        setError(null) // Clear any previous errors

        // Show a loading message
        const tempMessage = language === "en" ? "Preparing download..." : "Подготовка за изтегляне..."
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
        setError(
          language === "en"
            ? "Failed to download the flowchart. Please try again."
            : "Неуспешно изтегляне на диаграмата. Моля, опитайте отново.",
        )
      }
    } else {
      setError(
        language === "en"
          ? "Diagram renderer not initialized. Please try refreshing the page."
          : "Рендерът на диаграмата не е инициализиран. Моля, опитайте да опресните страницата.",
      )
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mermaidCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

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

  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === "en" ? "bg" : "en"))
  }

  const enhancePrompt = async () => {
    setIsEnhancing(true)
    try {
      const response = await fetch("/api/enhance-prompt", {
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
      setError(
        error instanceof Error
          ? error.message
          : language === "en"
            ? "An unexpected error occurred while enhancing the prompt"
            : "Възникна неочаквана грешка при подобряване на описанието",
      )
    } finally {
      setIsEnhancing(false)
    }
  }

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
                    {language === "en" ? "Flowchart Description" : "Описание на диаграмата"}
                  </label>
                  <Textarea
                    id="description"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      language === "en"
                        ? "Describe your flowchart (e.g., 'Create a flowchart for a user login process')"
                        : "Опишете вашата диаграма (напр., 'Създайте диаграма за процеса на вход на потребител')"
                    }
                    className="min-h-[200px] resize-none bg-blue-800 text-white placeholder-blue-300"
                  />
                </div>
                <div className="flex space-x-2">
                  <EnhancedButton
                    onClick={enhancePrompt}
                    isLoading={isEnhancing}
                    loadingText={language === "en" ? "Enhancing..." : "Подобряване..."}
                    icon={<Wand2 className="h-4 w-4" />}
                    className="bg-purple-600 hover:bg-purple-700 flex-1"
                  >
                    {language === "en" ? "Enhance Prompt" : "Подобри описанието"}
                  </EnhancedButton>
                  <EnhancedButton
                    onClick={generateFlowchart}
                    isLoading={isLoading}
                    loadingText={language === "en" ? "Generating..." : "Генериране..."}
                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                  >
                    {language === "en" ? "Generate Flowchart" : "Генерирай диаграма"}
                  </EnhancedButton>
                </div>
                {enhancedInput && (
                  <div className="p-4 bg-blue-700 rounded-md">
                    <h3 className="font-semibold mb-2 text-white">
                      {language === "en" ? "Enhanced Prompt:" : "Подобрено описание:"}
                    </h3>
                    <p className="text-blue-100 mb-2">{enhancedInput}</p>
                    <EnhancedButton onClick={useEnhancedPrompt} className="bg-green-600 hover:bg-green-700 w-full">
                      {language === "en" ? "Use Enhanced Prompt" : "Използвай подобреното описание"}
                    </EnhancedButton>
                  </div>
                )}
              </div>

              <div className="bg-blue-800 p-6 rounded-lg flex flex-col h-full">
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTitle>{language === "en" ? "Error" : "Грешка"}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {warning && (
                  <Alert className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{language === "en" ? "Warning" : "Предупреждение"}</AlertTitle>
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
                        {language === "en" ? "Download as SVG" : "Изтегли като SVG"}
                      </EnhancedButton>
                      <EnhancedButton
                        onClick={copyToClipboard}
                        icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        className="bg-purple-600 hover:bg-purple-700 flex-1"
                      >
                        {copied
                          ? language === "en"
                            ? "Copied!"
                            : "Копирано!"
                          : language === "en"
                            ? "Copy Code"
                            : "Копирай код"}
                      </EnhancedButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center text-blue-300">
                    <p>
                      {language === "en"
                        ? "Your generated flowchart will appear here"
                        : "Вашата генерирана диаграма ще се появи тук"}
                    </p>
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

