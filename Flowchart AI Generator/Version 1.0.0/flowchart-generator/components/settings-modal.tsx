"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
        throw new Error("Failed to set API key")
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{language === "en" ? "Settings" : "Настройки"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
              {language === "en" ? "Claude API Key" : "API ключ на Claude"}
            </label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={language === "en" ? "Enter your Claude API key" : "Въведете вашия API ключ на Claude"}
            />
          </div>
          <Button type="submit">{language === "en" ? "Save API Key" : "Запази API ключ"}</Button>
        </form>
        {message && (
          <Alert variant={message.type === "success" ? "default" : "destructive"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  )
}

