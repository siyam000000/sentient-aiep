"use client"

import { useState, useEffect, useCallback } from "react"

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList
  }
  interface SpeechRecognitionResultList extends Array<SpeechRecognitionResult> {}
  interface SpeechRecognitionResult extends Array<SpeechRecognitionAlternative> {
    isFinal: boolean
  }
  interface SpeechRecognitionAlternative {
    transcript: string
    confidence: number
  }
  interface SpeechRecognitionErrorEvent extends Event {
    error: string
  }
}

export const useVoiceRecognition = (onResult: (transcript: string) => void, onError: (error: string) => void) => {
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    let recognition: SpeechRecognition | null = null

    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("")
        onResult(transcript)
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        onError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }
    } else {
      onError("Speech recognition not supported in this browser.")
    }

    return () => {
      if (recognition) {
        recognition.abort()
      }
    }
  }, [onResult, onError])

  const startListening = useCallback(() => {
    if (!isListening) {
      setIsListening(true)
      if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.start()
      }
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (isListening) {
      setIsListening(false)
      if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.stop()
      }
    }
  }, [isListening])

  return { isListening, startListening, stopListening }
}

