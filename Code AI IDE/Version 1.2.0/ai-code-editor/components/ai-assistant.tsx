"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertCircle,
  Loader2,
  Send,
  X,
  Maximize2,
  Minimize2,
  Cpu,
  Code,
  Lightbulb,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Clipboard,
  RefreshCw,
  Trash2,
  MessageSquare,
} from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import ReactMarkdown from "react-markdown"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Message = {
  role: "user" | "assistant" | "system"
  content: string
}

type AIAssistantProps = {
  currentFile: { name: string; language: string; content: string } | undefined
  onUpdateFile: (content: string) => void
  isOpen: boolean
  onClose: () => void
}

export function AIAssistant({ currentFile, onUpdateFile, isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showExamples, setShowExamples] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("chat")
  const { t } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [savedPrompts, setSavedPrompts] = useState<string[]>([])

  // Example prompts for different scenarios
  const examplePrompts = [
    {
      text: "Генерирай отзивчива навигационна лента",
      icon: Code,
      category: "Генериране на код",
    },
    {
      text: "Поправи този CSS flexbox layout",
      icon: Lightbulb,
      category: "Дебъгване",
    },
    {
      text: "Обясни как работят JavaScript promises",
      icon: HelpCircle,
      category: "Обучение",
    },
    {
      text: "Оптимизирай този код за по-добра производителност",
      icon: Sparkles,
      category: "Добри практики",
    },
  ]

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }

    // Check if user has interacted with the AI before - only run in browser
    if (typeof window !== "undefined") {
      const hasInteractedBefore = localStorage.getItem("sentient-ai-interacted")
      if (hasInteractedBefore) {
        setHasInteracted(true)
        setShowExamples(false)
      }

      // Load saved prompts
      const savedPromptsStr = localStorage.getItem("sentient-ai-saved-prompts")
      if (savedPromptsStr) {
        try {
          setSavedPrompts(JSON.parse(savedPromptsStr))
        } catch (e) {
          console.error("Failed to parse saved prompts", e)
        }
      }
    }
  }, [isOpen])

  const applyChanges = useCallback(
    (content: string) => {
      const codeBlockRegex = /```(?:\w+)?\n([\s\S]+?)\n```/
      const match = content.match(codeBlockRegex)
      const codeToApply = match ? match[1] : content

      if (currentFile) {
        onUpdateFile(codeToApply)

        // Show success notification
        const toast = document.createElement("div")
        toast.className =
          "fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-up"
        toast.textContent = `Code applied to ${currentFile.name}`
        document.body.appendChild(toast)

        setTimeout(() => {
          toast.classList.add("animate-fade-out-down")
          setTimeout(() => document.body.removeChild(toast), 500)
        }, 3000)
      }
    },
    [currentFile, onUpdateFile],
  )

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    })
  }

  const savePrompt = (prompt: string) => {
    if (!savedPrompts.includes(prompt)) {
      const newSavedPrompts = [...savedPrompts, prompt]
      setSavedPrompts(newSavedPrompts)

      if (typeof window !== "undefined") {
        localStorage.setItem("sentient-ai-saved-prompts", JSON.stringify(newSavedPrompts))
      }
    }
  }

  const removeSavedPrompt = (prompt: string) => {
    const newSavedPrompts = savedPrompts.filter((p) => p !== prompt)
    setSavedPrompts(newSavedPrompts)

    if (typeof window !== "undefined") {
      localStorage.setItem("sentient-ai-saved-prompts", JSON.stringify(newSavedPrompts))
    }
  }

  const clearConversation = () => {
    setMessages([])
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement> | string) => {
      e.preventDefault?.()

      const promptText = typeof e === "string" ? e : input
      if (!promptText.trim()) return

      // Mark as interacted
      if (!hasInteracted) {
        setHasInteracted(true)
        if (typeof window !== "undefined") {
          localStorage.setItem("sentient-ai-interacted", "true")
        }
        setShowExamples(false)
      }

      // Save prompt for future use
      savePrompt(promptText)

      setErrorMessage(null)
      setIsLoading(true)

      const userMessage: Message = { role: "user", content: promptText }
      setMessages((prev) => [...prev, userMessage])
      setInput("")

      try {
        // Add context about the current file if available
        const contextMessage = currentFile
          ? `I'm currently working on a ${currentFile.language} file named ${currentFile.name}. Here's the current content:\n\n\`\`\`${currentFile.language}\n${currentFile.content}\n\`\`\``
          : ""

        const messagesWithContext = contextMessage
          ? [...messages, { role: "system", content: contextMessage }, userMessage]
          : [...messages, userMessage]

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: messagesWithContext }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(`HTTP error! status: ${response.status}${errorData.error ? ` - ${errorData.error}` : ""}`)
        }

        const data = await response.json()
        if (!data.content) {
          throw new Error("Received empty response from AI")
        }

        setMessages((prev) => [...prev, { role: "assistant", content: data.content }])
      } catch (err) {
        console.error("Error submitting message:", err)
        let errorMessage = "An unknown error occurred"
        if (err instanceof Error) {
          errorMessage = err.message
        }
        setErrorMessage(`Failed to get response from AI. Error: ${errorMessage}`)
      } finally {
        setIsLoading(false)
      }
    },
    [messages, input, currentFile, hasInteracted],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleExampleClick = (prompt: string) => {
    handleSubmit(prompt)
  }

  return (
    <TooltipProvider>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed ${
              isFullScreen ? "inset-0" : "bottom-20 right-4 w-96 h-[70vh]"
            } bg-background shadow-2xl rounded-lg overflow-hidden z-40`}
          >
            <Card className="h-full border-none flex flex-col bg-gray-900">
              <CardHeader className="border-b px-4 py-3 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Cpu className="h-5 w-5 mr-2" />
                    {t("aiCodingHelper")}
                    <span className="ml-2 text-xs bg-blue-600 px-2 py-0.5 rounded-full">Llama 3.3 70B</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsFullScreen(!isFullScreen)}
                          className="text-white hover:bg-white/20"
                        >
                          {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        {isFullScreen ? t("exitFullScreen") : t("fullScreen")}
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                          <X className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">{t("close")}</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                  <TabsList className="bg-blue-950/50 border border-blue-800">
                    <TabsTrigger value="chat" className="data-[state=active]:bg-blue-700">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Chat
                    </TabsTrigger>
                    <TabsTrigger value="saved" className="data-[state=active]:bg-blue-700">
                      <Clipboard className="h-4 w-4 mr-1" />
                      Saved
                    </TabsTrigger>
                    <TabsTrigger value="examples" className="data-[state=active]:bg-blue-700">
                      <Lightbulb className="h-4 w-4 mr-1" />
                      Examples
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent className="p-0 flex-grow overflow-hidden flex flex-col">
                {activeTab === "chat" && (
                  <ScrollArea className="flex-grow" ref={scrollRef}>
                    <div className="p-4 space-y-4">
                      {messages.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                          <div className="bg-blue-600/10 rounded-full p-3 w-16 h-16 mx-auto mb-4">
                            <Cpu className="h-10 w-10 text-blue-500 mx-auto" />
                          </div>
                          <h3 className="text-lg font-medium mb-2 text-blue-400">Sentient AI Coding Helper</h3>
                          <p className="max-w-md mx-auto text-gray-400 mb-4">
                            Мога да помогна с кодиране, дебъгване и обяснение на концепции. С какво мога да ви помогна
                            днес?
                          </p>

                          {showExamples && (
                            <div className="mt-6">
                              <h4 className="text-sm font-medium text-gray-300 mb-3">Опитайте да попитате за:</h4>
                              <div className="grid grid-cols-1 gap-2 max-w-xs mx-auto">
                                {examplePrompts.map((prompt, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleExampleClick(prompt.text)}
                                    className="flex items-center text-left p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 group"
                                  >
                                    <div className="bg-blue-900/50 p-1.5 rounded mr-2">
                                      <prompt.icon className="h-4 w-4 text-blue-400" />
                                    </div>
                                    <div className="flex-1 text-sm text-gray-300">{prompt.text}</div>
                                    <ArrowRight className="h-4 w-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {errorMessage && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Грешка</AlertTitle>
                          <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                      )}

                      {messages.map(
                        (m, index) =>
                          m.role !== "system" && (
                            <div
                              key={index}
                              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                  m.role === "user"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-800 text-gray-100 border border-gray-700"
                                }`}
                              >
                                <ReactMarkdown
                                  components={{
                                    code({ node, inline, className, children, ...props }) {
                                      if (inline) {
                                        return (
                                          <code className="bg-black/30 rounded px-1" {...props}>
                                            {children}
                                          </code>
                                        )
                                      }
                                      return (
                                        <div className="relative group">
                                          <pre className="bg-black/20 p-4 rounded-lg overflow-x-auto my-2">
                                            <code {...props}>{children}</code>
                                          </pre>
                                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            <Button
                                              variant="secondary"
                                              size="sm"
                                              className="bg-blue-600 hover:bg-blue-700 text-white"
                                              onClick={() => applyChanges(children.toString())}
                                            >
                                              Приложи
                                            </Button>
                                            <Button
                                              variant="secondary"
                                              size="sm"
                                              className="bg-gray-700 hover:bg-gray-600 text-white"
                                              onClick={() => copyToClipboard(children.toString(), index)}
                                            >
                                              {copiedIndex === index ? (
                                                <Check className="h-3 w-3" />
                                              ) : (
                                                <Copy className="h-3 w-3" />
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                      )
                                    },
                                  }}
                                >
                                  {m.content}
                                </ReactMarkdown>
                              </div>
                            </div>
                          ),
                      )}
                    </div>
                  </ScrollArea>
                )}

                {activeTab === "saved" && (
                  <ScrollArea className="flex-grow">
                    <div className="p-4 space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium text-blue-400">Saved Prompts</h3>
                        {savedPrompts.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white"
                            onClick={() => setSavedPrompts([])}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Clear All
                          </Button>
                        )}
                      </div>

                      {savedPrompts.length === 0 ? (
                        <div className="text-center py-6 text-gray-400">
                          <p>No saved prompts yet. Your frequently used prompts will appear here.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {savedPrompts.map((prompt, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700"
                            >
                              <div className="flex-1 text-sm text-gray-300 truncate mr-2">{prompt}</div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-gray-400 hover:text-white"
                                  onClick={() => handleExampleClick(prompt)}
                                >
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-gray-400 hover:text-white"
                                  onClick={() => removeSavedPrompt(prompt)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}

                {activeTab === "examples" && (
                  <ScrollArea className="flex-grow">
                    <div className="p-4 space-y-4">
                      <h3 className="text-lg font-medium text-blue-400 mb-4">Example Prompts</h3>

                      <div className="space-y-4">
                        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                          <div className="flex items-center gap-2 mb-2 text-blue-400">
                            <Code className="h-5 w-5" />
                            <h4 className="font-medium">Code Generation</h4>
                          </div>
                          <div className="space-y-2">
                            <button
                              onClick={() =>
                                handleExampleClick("Create a responsive navigation bar with dropdown menus")
                              }
                              className="w-full text-left p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors text-sm text-gray-300"
                            >
                              Create a responsive navigation bar with dropdown menus
                            </button>
                            <button
                              onClick={() =>
                                handleExampleClick("Write a function to fetch and display data from an API")
                              }
                              className="w-full text-left p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors text-sm text-gray-300"
                            >
                              Write a function to fetch and display data from an API
                            </button>
                          </div>
                        </div>

                        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                          <div className="flex items-center gap-2 mb-2 text-blue-400">
                            <Lightbulb className="h-5 w-5" />
                            <h4 className="font-medium">Debugging</h4>
                          </div>
                          <div className="space-y-2">
                            <button
                              onClick={() => handleExampleClick("Why isn't my flexbox layout working correctly?")}
                              className="w-full text-left p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors text-sm text-gray-300"
                            >
                              Why isn't my flexbox layout working correctly?
                            </button>
                            <button
                              onClick={() => handleExampleClick("Fix this JavaScript function that's causing an error")}
                              className="w-full text-left p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors text-sm text-gray-300"
                            >
                              Fix this JavaScript function that's causing an error
                            </button>
                          </div>
                        </div>

                        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                          <div className="flex items-center gap-2 mb-2 text-blue-400">
                            <HelpCircle className="h-5 w-5" />
                            <h4 className="font-medium">Learning</h4>
                          </div>
                          <div className="space-y-2">
                            <button
                              onClick={() => handleExampleClick("Explain how JavaScript promises work")}
                              className="w-full text-left p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors text-sm text-gray-300"
                            >
                              Explain how JavaScript promises work
                            </button>
                            <button
                              onClick={() => handleExampleClick("What's the difference between var, let, and const?")}
                              className="w-full text-left p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors text-sm text-gray-300"
                            >
                              What's the difference between var, let, and const?
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                )}

                {isLoading && (
                  <div className="flex items-center justify-center p-2 bg-background/80 backdrop-blur-sm">
                    <Loader2 className="h-4 w-4 animate-spin mr-2 text-blue-500" />
                    <span className="text-sm text-blue-500">{t("thinking")}...</span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="border-t p-4 bg-gray-900">
                <div className="flex w-full gap-2">
                  {activeTab === "chat" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-white"
                        onClick={clearConversation}
                        title="Clear conversation"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>

                      <form onSubmit={(e) => handleSubmit(e)} className="flex flex-1 gap-2">
                        <Input
                          ref={inputRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={t("askForCodingHelp")}
                          className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                          aria-label={t("askForCodingHelp")}
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="submit"
                              disabled={isLoading}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              variant="gradient"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Изпрати</TooltipContent>
                        </Tooltip>
                      </form>
                    </>
                  )}

                  {activeTab === "saved" && (
                    <Button
                      onClick={() => setActiveTab("chat")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Return to Chat
                    </Button>
                  )}

                  {activeTab === "examples" && (
                    <Button
                      onClick={() => setActiveTab("chat")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Return to Chat
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  )
}

