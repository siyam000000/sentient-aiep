"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Mic, Settings2, Send, Volume2 } from "lucide-react"
import { useVoiceRecognition } from "./hooks/useVoiceRecognition"
import { VoiceVisualizer } from "./components/VoiceVisualizer"
import { EditableTranscript } from "./components/EditableTranscript"
import { AIResponse } from "./components/AIResponse"
import { getAIResponse } from "./lib/api"
import { toast } from "sonner"

export default function Home() {
  const [transcript, setTranscript] = useState("")
  const [aiResponse, setAIResponse] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel()
      }
    }
  }, [])

  const handleResult = useCallback((result: string) => {
    setTranscript(result)
  }, [])

  const handleError = useCallback((error: string) => {
    console.error(error)
    toast.error(error)
  }, [])

  const { isListening, startListening, stopListening } = useVoiceRecognition({
    onResult: handleResult,
    onError: handleError,
  })

  const handleToggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  const handleSubmit = async () => {
    if (!transcript.trim()) return
    setIsProcessing(true)
    try {
      console.log("Submitting transcript:", transcript)
      const response = await getAIResponse(transcript)
      setAIResponse(response.response)
      speakResponse(response.response)
    } catch (error) {
      console.error("Error getting AI response:", error)
      setAIResponse("Sorry, I encountered an error. Please try again.")
      toast.error(`Failed to get AI response: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const speakResponse = useCallback((text: string) => {
    if (speechSynthesisRef.current) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      speechSynthesisRef.current.speak(utterance)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center relative p-4">
      <motion.button
        className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Settings2 size={24} />
      </motion.button>

      <div className="w-full max-w-2xl flex flex-col items-center space-y-8">
        <VoiceVisualizer isListening={isListening} />

        <EditableTranscript transcript={transcript} setTranscript={setTranscript} isListening={isListening} />

        <AIResponse response={aiResponse} isSpeaking={isSpeaking} />

        <div className="flex space-x-4">
          <motion.button
            onClick={handleToggleListening}
            className={`p-4 rounded-full ${
              isListening ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
            } text-white shadow-lg transition-colors`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Mic size={24} />
          </motion.button>

          <motion.button
            onClick={handleSubmit}
            disabled={isProcessing || !transcript.trim()}
            className={`p-4 rounded-full ${
              isProcessing || !transcript.trim() ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            } text-white shadow-lg transition-colors`}
            whileHover={isProcessing || !transcript.trim() ? {} : { scale: 1.1 }}
            whileTap={isProcessing || !transcript.trim() ? {} : { scale: 0.95 }}
          >
            <Send size={24} />
          </motion.button>

          {aiResponse && (
            <motion.button
              onClick={() => speakResponse(aiResponse)}
              disabled={isSpeaking}
              className={`p-4 rounded-full ${
                isSpeaking ? "bg-purple-700" : "bg-purple-500 hover:bg-purple-600"
              } text-white shadow-lg transition-colors`}
              whileHover={isSpeaking ? {} : { scale: 1.1 }}
              whileTap={isSpeaking ? {} : { scale: 0.95 }}
            >
              <Volume2 size={24} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}

