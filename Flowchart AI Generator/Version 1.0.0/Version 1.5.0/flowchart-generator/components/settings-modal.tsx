"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Key, Check, AlertCircle } from "lucide-react"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  language: "en" | "bg"
}

export function SettingsModal({ isOpen, onClose, language }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    try {
      const response = await fetch("/api/set-claude-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      })

      if (!response.ok) {
        throw new Error("Failed to set Claude API key")
      }

      setMessage({
        type: "success",
        text: language === "en" ? "Claude API key set successfully!" : "API ключът на Claude е зададен успешно!",
      })
      setApiKey("")
    } catch (error) {
      setMessage({
        type: "error",
        text:
          language === "en"
            ? "Failed to set Claude API key. Please try again."
            : "Неуспешно задаване на API ключ на Claude. Моля, опитайте отново.",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[550px] bg-blue-950 border-blue-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5 text-blue-400" />
            <span>{language === "en" ? "Settings" : "Настройки"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 border-t border-blue-800/50 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium mb-1 text-blue-200">
                {language === "en" ? "Claude API Key" : "API ключ на Claude"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-blue-500" />
                </div>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={language === "en" ? "Enter your Claude API key" : "Въведете вашия API ключ на Claude"}
                  className="pl-10 bg-blue-900/50 border-blue-800 text-white placeholder:text-blue-400"
                />
              </div>
              <p className="mt-1 text-xs text-blue-400">
                {language === "en"
                  ? "Your API key is stored securely in your browser and never sent to our servers."
                  : "Вашият API ключ се съхранява сигурно във вашия браузър и никога не се изпраща на нашите сървъри."}
              </p>
            </div>

            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full"
            >
              {language === "en" ? "Save API Key" : "Запази API ключ"}
            </Button>
          </form>

          {message && (
            <Alert
              variant={message.type === "success" ? "default" : "destructive"}
              className={
                message.type === "success"
                  ? "mt-4 bg-green-900/30 border-green-800 text-green-100"
                  : "mt-4 bg-red-900/30 border-red-800 text-red-100"
              }
            >
              {message.type === "success" ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-400" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

