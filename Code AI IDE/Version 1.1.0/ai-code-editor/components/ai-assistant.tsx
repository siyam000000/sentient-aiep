"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, MessageSquare, Send, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import ReactMarkdown from "react-markdown"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"

type Message = {
  role: "user" | "assistant"
  content: string
}

type AIAssistantProps = {
  isOpen: boolean
  onClose: () => void
  currentFile: { name: string; language: string; content: string } | undefined
  onUpdateFile: (content: string) => void
}

export function AIAssistant({ isOpen, onClose, currentFile, onUpdateFile }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { t } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const applyChanges = useCallback(
    (content: string) => {
      const codeBlockRegex = /```(?:\w+)?\n([\s\S]+?)\n```/
      const match = content.match(codeBlockRegex)
      const codeToApply = match ? match[1] : content

      if (currentFile) {
        onUpdateFile(codeToApply)
      }
    },
    [currentFile, onUpdateFile],
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setErrorMessage(null)
      setIsLoading(true)

      const userMessage: Message = { role: "user", content: input }
      setMessages((prev) => [...prev, userMessage])
      setInput("")

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [...messages, userMessage] }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
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
    [messages, input],
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 h-full bg-background shadow-lg z-50 flex"
        >
          <Card
            className={`h-full border-none rounded-none transition-all duration-300 ${isCollapsed ? "w-12" : "w-96"}`}
          >
            <CardHeader className="border-b px-4 py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  {!isCollapsed && t("aiAssistant")}
                </CardTitle>
                <div className="flex items-center">
                  <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  {!isCollapsed && (
                    <Button variant="ghost" size="icon" onClick={onClose}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            {!isCollapsed && (
              <>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-8rem)]" ref={scrollRef}>
                    <div className="p-4 space-y-4">
                      {errorMessage && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                      )}

                      {messages.map((m, index) => (
                        <div key={index} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <ReactMarkdown
                              components={{
                                code({ node, inline, className, children, ...props }) {
                                  if (inline) {
                                    return (
                                      <code className="bg-background/50 rounded px-1" {...props}>
                                        {children}
                                      </code>
                                    )
                                  }
                                  return (
                                    <div className="relative group">
                                      <pre className="bg-background/50 p-4 rounded-lg overflow-x-auto">
                                        <code {...props}>{children}</code>
                                      </pre>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => applyChanges(children.toString())}
                                      >
                                        Apply
                                      </Button>
                                    </div>
                                  )
                                },
                              }}
                            >
                              {m.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t("thinking")}...
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>

                <CardFooter className="border-t p-4">
                  <form onSubmit={handleSubmit} className="flex w-full gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t("askForCodingHelp")}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </CardFooter>
              </>
            )}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

