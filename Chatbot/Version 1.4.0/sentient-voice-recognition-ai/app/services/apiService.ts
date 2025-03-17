"use client"

import { toast } from "sonner"

interface ApiResponse {
  response: string
  audioBase64?: string
  error?: string
  details?: string
  voiceType?: string
  voiceId?: string
}

export async function sendMessage(input: string, voiceType: string): Promise<ApiResponse> {
  const formData = new FormData()
  formData.append("input", input)
  formData.append("voiceType", voiceType)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 50000) // 50 second client-side timeout

  try {
    const response = await fetch("/api", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId))

    // Check content type before trying to parse as JSON
    const contentType = response.headers.get("content-type")

    if (!contentType || !contentType.includes("application/json")) {
      // Not JSON, read as text
      const text = await response.text()
      throw new Error(`Received non-JSON response: ${text.substring(0, 100)}...`)
    }

    const data = await response.json()

    if (!response.ok && response.status !== 206) {
      // 206 is partial content (text but no audio)
      throw new Error(data.error || data.details || "Failed to get response")
    }

    return data
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      toast.error("Request timed out. Please try again with a shorter message.")
      return { response: "Request timed out. Please try again with a shorter message." }
    } else {
      console.error("API error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to process request"
      toast.error(errorMessage)
      return { response: errorMessage, error: errorMessage }
    }
  }
}

