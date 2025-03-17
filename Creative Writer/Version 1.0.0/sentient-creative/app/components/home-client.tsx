"use client"

import type React from "react"

import { LoaderIcon, SparklesIcon, SunIcon, MoonIcon } from "@/app/icons"
import { useCompletion } from "ai/react"
import { useState, useEffect } from "react"
import TextareaAutosize from "react-textarea-autosize"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function HomeClient() {
  const [text, setText] = useState("")
  const [isEnvironmentReady, setIsEnvironmentReady] = useState(false)
  const [isCheckingEnv, setIsCheckingEnv] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo")

  useEffect(() => {
    setIsCheckingEnv(true)
    fetch("/api/check-env")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        setIsEnvironmentReady(data.isReady)
        if (!data.isReady) {
          toast.error("OPENAI_API_KEY is not set. AI completions will not work.")
        }
      })
      .catch((err) => {
        console.error("Failed to check environment:", err)
        toast.error("Failed to check environment configuration.")
        setIsEnvironmentReady(false)
      })
      .finally(() => {
        setIsCheckingEnv(false)
      })

    // Check for user's preferred color scheme
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true)
    }
  }, [])

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode)
  }, [isDarkMode])

  const { completion, input, isLoading, handleInputChange, handleSubmit, setInput } = useCompletion({
    api: "/api/completion",
    body: { text, model: selectedModel },
    onResponse: (response) => {
      if (!response.ok) {
        return response.text().then((text) => {
          try {
            const json = JSON.parse(text)
            throw new Error(json.message || `HTTP error! status: ${response.status}`)
          } catch (e) {
            console.error("Failed to parse error response:", text)
            throw new Error(`HTTP error! status: ${response.status}`)
          }
        })
      }
    },
    onFinish: (prompt, completion) => setText(completion.trim()),
    onError: (error) => {
      console.error("Completion error:", error)
      toast.error(error.message || "An error occurred during text completion.")
    },
  })

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEnvironmentReady) {
      toast.error("OPENAI_API_KEY is not set. Please check your environment variables.")
      return
    }
    if (!text.trim()) {
      toast.error("Please enter some text to edit.")
      return
    }
    handleSubmit(e)
    setInput("")
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Sentient AI Text Editor</h1>
          <div className="flex items-center space-x-4">
            <Select onValueChange={(value) => setSelectedModel(value)} defaultValue={selectedModel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <SunIcon className="h-4 w-4" />
              <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} aria-label="Toggle dark mode" />
              <MoonIcon className="h-4 w-4" />
            </div>
          </div>
        </div>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-input">Enter your text:</Label>
            <TextareaAutosize
              id="text-input"
              value={isLoading && completion.length > 0 ? completion.trim() : text}
              onChange={(e) => {
                if (!isLoading) setText(e.target.value)
              }}
              className="w-full p-2 border rounded-md resize-none min-h-[200px]"
              placeholder="It was a dark and stormy night..."
              minRows={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prompt-input">Enter your editing prompt:</Label>
            <div className="flex items-center space-x-2">
              <input
                id="prompt-input"
                className="flex-grow p-2 border rounded-md"
                placeholder="Make the text more unique..."
                onChange={handleInputChange}
                value={input}
                required
              />
              <button
                type="submit"
                disabled={isLoading || !text || !isEnvironmentReady || isCheckingEnv}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? <LoaderIcon className="animate-spin" /> : <SparklesIcon />}
                <span className="ml-2">{isLoading ? "Processing..." : "Edit"}</span>
              </button>
            </div>
          </div>
        </form>
        {isCheckingEnv && <p className="mt-4 text-sm text-gray-500">Checking environment configuration...</p>}
        {!isCheckingEnv && !isEnvironmentReady && (
          <p className="mt-4 text-sm text-red-500">OPENAI_API_KEY is not set. AI completions will not work.</p>
        )}
      </div>
    </div>
  )
}

