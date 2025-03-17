"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Settings, Download, AlertTriangle, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import mermaid from "mermaid"
import html2canvas from "html2canvas"
import { SettingsModal } from "@/components/settings-modal"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import confetti from "canvas-confetti"
import { Sidebar } from "@/components/sidebar"

interface SavedFlowchart {
  id: string
  description: string
  mermaidCode: string
}

interface ChatItem {
  id: string
  title: string
  flowcharts: SavedFlowchart[]
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

      setMermaidCode(data.mermaidCode)
      if (data.warning) {
        setWarning(data.warning)
      }
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      // Save the generated flowchart to the current chat
      if (currentChatId) {
        const newFlowchart: SavedFlowchart = {
          id: Date.now().toString(),
          description: input,
          mermaidCode: data.mermaidCode,
        }
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === currentChatId ? { ...chat, flowcharts: [...chat.flowcharts, newFlowchart] } : chat,
          ),
        )
      }
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

  const downloadFlowchart = async () => {
    if (mermaidRef.current) {
      try {
        const canvas = await html2canvas(mermaidRef.current)
        const dataUrl = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.href = dataUrl
        link.download = "flowchart.png"
        link.click()
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
          ? "No flowchart to download. Please generate a flowchart first."
          : "Няма диаграма за изтегляне. Моля, първо генерирайте диаграма.",
      )
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mermaidCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const createNewChat = () => {
    const newChat: ChatItem = {
      id: Date.now().toString(),
      title: language === "en" ? `New Chat ${chats.length + 1}` : `Нов чат ${chats.length + 1}`,
      flowcharts: [],
    }
    setChats((prevChats) => [...prevChats, newChat])
    setCurrentChatId(newChat.id)
    setInput("")
    setMermaidCode("")
    setError(null)
    setWarning(null)
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

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-blue-900 text-white">
        <Sidebar chats={chats} onChatSelect={selectChat} onNewChat={createNewChat} currentChatId={currentChatId} />
        <div className="flex-1 flex flex-col">
          <nav className="border-b border-blue-700">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold">
                {language === "en" ? "Sentient Flowchart Generator" : "Генератор на интелигентни диаграми"}
              </h1>
              <div className="flex items-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
                      <Settings className="h-[1.2rem] w-[1.2rem]" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{language === "en" ? "Open Settings" : "Отвори настройки"}</p>
                  </TooltipContent>
                </Tooltip>
                <Button onClick={toggleLanguage} className="bg-blue-700 hover:bg-blue-600">
                  {language === "en" ? "БГ" : "EN"}
                </Button>
              </div>
            </div>
          </nav>

          <main className="flex-1 overflow-auto container mx-auto px-4 py-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
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
                <Button
                  onClick={generateFlowchart}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {language === "en" ? "Generating..." : "Генериране..."}
                    </>
                  ) : language === "en" ? (
                    "Generate Flowchart"
                  ) : (
                    "Генерирай диаграма"
                  )}
                </Button>
              </div>

              <div className="bg-blue-800 p-6 rounded-lg min-h-[200px] flex flex-col">
                {error ? (
                  <Alert variant="destructive">
                    <AlertTitle>{language === "en" ? "Error" : "Грешка"}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : warning ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{language === "en" ? "Warning" : "Предупреждение"}</AlertTitle>
                    <AlertDescription>{warning}</AlertDescription>
                  </Alert>
                ) : null}
                {mermaidCode ? (
                  <>
                    <div ref={mermaidRef} className="mermaid overflow-auto bg-white p-4 rounded"></div>
                    {renderError && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertTitle>{language === "en" ? "Render Error" : "Грешка при визуализация"}</AlertTitle>
                        <AlertDescription>{renderError}</AlertDescription>
                        <pre className="mt-2 p-2 bg-blue-700 text-sm overflow-x-auto rounded">{mermaidCode}</pre>
                      </Alert>
                    )}
                    <div className="flex justify-between mt-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button onClick={downloadFlowchart} className="bg-green-600 hover:bg-green-700">
                            <Download className="mr-2 h-4 w-4" />{" "}
                            {language === "en" ? "Download as PNG" : "Изтегли като PNG"}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {language === "en"
                              ? "Download the flowchart as a PNG image"
                              : "Изтеглете диаграмата като PNG изображение"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button onClick={copyToClipboard} className="bg-purple-600 hover:bg-purple-700">
                            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                            {copied
                              ? language === "en"
                                ? "Copied!"
                                : "Копирано!"
                              : language === "en"
                                ? "Copy Code"
                                : "Копирай код"}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {language === "en"
                              ? "Copy the Mermaid code to clipboard"
                              : "Копирайте Mermaid кода в клипборда"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-blue-300 flex-1 flex items-center justify-center">
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

