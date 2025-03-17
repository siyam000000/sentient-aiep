"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if browser supports speech recognition
    const supported =
      typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)

    setIsSupported(supported)

    if (supported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = "en-US"

      recognitionInstance.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("")
        setTranscript(transcript)
      }

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error", event.error)
        setIsListening(false)

        // Provide more specific error messages
        if (event.error === "not-allowed") {
          toast.error("Microphone access denied. Please enable microphone permissions.")
        } else if (event.error === "network") {
          toast.error("Network error. Please check your connection.")
        } else {
          toast.error(`Speech recognition error: ${event.error}. Please try again.`)
        }
      }

      setRecognition(recognitionInstance)
    } else {
      toast.error("Speech recognition is not supported in this browser.")
    }

    // Cleanup
    return () => {
      if (recognition) {
        try {
          recognition.stop()
        } catch (e) {
          console.error("Error stopping recognition:", e)
        }
      }
    }
  }, [])

  const toggleListening = useCallback(() => {
    if (!isSupported) {
      toast.error("Speech recognition is not supported in this browser.")
      return
    }

    if (isListening) {
      recognition?.stop()
      setIsListening(false)
    } else {
      try {
        recognition?.start()
        setIsListening(true)
      } catch (error) {
        console.error("Error starting recognition:", error)
        toast.error("Failed to start speech recognition. Please try again.")
      }
    }
  }, [isListening, recognition, isSupported])

  const stopListening = useCallback(() => {
    if (isListening && recognition) {
      recognition.stop()
      setIsListening(false)
    }
  }, [isListening, recognition])

  return {
    transcript,
    setTranscript,
    isListening,
    toggleListening,
    stopListening,
    isSupported,
  }
}

