"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseVoiceRecognitionProps {
  onResult: (transcript: string) => void
  onError: (error: string) => void
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList
  }
  interface SpeechRecognitionResultList extends Array<SpeechRecognitionResult> {
    item(index: number): SpeechRecognitionResult
  }
  interface SpeechRecognitionResult extends Array<SpeechRecognitionAlternative> {
    transcript: string
  }
  interface SpeechRecognitionAlternative {
    transcript: string
    confidence: number
  }
  interface SpeechRecognitionErrorEvent extends Event {
    error: string
  }
}

export const useVoiceRecognition = ({ onResult, onError }: UseVoiceRecognitionProps) => {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("")
        onResult(transcript)
      }

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        onError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }
    } else {
      onError("Speech recognition not supported in this browser.")
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [onResult, onError])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [isListening])

  return { isListening, startListening, stopListening }
}

