"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useVoiceRecognition } from "../hooks/useVoiceRecognition"
import { Button } from "./ui/Button"
import { getAIResponse } from "../lib/api"

export const VoiceRecognition: React.FC = () => {
  const [transcript, setTranscript] = useState("")
  const [aiResponse, setAIResponse] = useState("")

  const handleResult = useCallback((result: string) => {
    setTranscript(result)
  }, [])

  const handleError = useCallback((error: string) => {
    console.error(error)
    // You might want to show this error to the user
  }, [])

  const { isListening, startListening, stopListening } = useVoiceRecognition({
    onResult: handleResult,
    onError: handleError,
  })

  const handleToggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await getAIResponse(transcript)
      setAIResponse(response.response)
    } catch (error) {
      console.error("Error getting AI response:", error)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleToggleListening}>{isListening ? "Stop Listening" : "Start Listening"}</Button>
      <Button onClick={handleSubmit} disabled={!transcript} variant="secondary">
        Get AI Response
      </Button>
      <div>
        <h3>Transcript:</h3>
        <p>{transcript}</p>
      </div>
      <div>
        <h3>AI Response:</h3>
        <p>{aiResponse}</p>
      </div>
    </div>
  )
}

