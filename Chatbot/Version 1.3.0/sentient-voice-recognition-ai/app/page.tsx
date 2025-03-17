"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Send, Settings2, Volume2 } from "lucide-react"
import { toast } from "sonner"
import { useTheme } from "./contexts/ThemeContext"
import { Settings } from "./components/Settings"
import { VoiceWaveform } from "./components/VoiceWaveform"

// Declare SpeechRecognition type
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export default function Home() {
  const [transcript, setTranscript] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { themeColor, voiceId } = useTheme()

  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

  useEffect(() => {
    if ((typeof window !== "undefined" && "SpeechRecognition" in window) || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = "en-US"

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("")
        setTranscript(transcript)
      }

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error", event.error)
        setIsListening(false)
        toast.error("Speech recognition error. Please try again.")
      }

      setRecognition(recognitionInstance)
    }
  }, [])

  // Set up audio event listeners
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onplay = () => setIsSpeaking(true)
      audioRef.current.onended = () => setIsSpeaking(false)
      audioRef.current.onpause = () => setIsSpeaking(false)
      audioRef.current.onerror = () => {
        setIsSpeaking(false)
        toast.error("Error playing audio response")
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.onplay = null
        audioRef.current.onended = null
        audioRef.current.onpause = null
        audioRef.current.onerror = null
      }
    }
  }, [])

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop()
      setIsListening(false)
    } else {
      recognition?.start()
      setIsListening(true)
    }
  }

  const handleSubmit = async () => {
    if (!transcript.trim()) return
    setIsPending(true)
    try {
      const formData = new FormData()
      formData.append("input", transcript)
      formData.append("voiceId", voiceId)

      const response = await fetch("/api", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to get response")
        } else {
          const errorText = await response.text()
          throw new Error(errorText || "Failed to get response")
        }
      }

      const data = await response.json()
      setAiResponse(data.response)

      if (audioRef.current && data.audioBase64) {
        audioRef.current.src = `data:audio/mp3;base64,${data.audioBase64}`
        await audioRef.current.play()
      }

      setTranscript("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process request")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${themeColor} text-white p-4`}>
      <div className="absolute top-4 right-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-full bg-gray-800/30 hover:bg-gray-800/50"
        >
          <Settings2 size={24} />
        </motion.button>
      </div>

      <div className="max-w-2xl mx-auto pt-20">
        <AnimatePresence>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative flex justify-center items-center mb-12"
          >
            {/* Pulse Animation */}
            <div className="absolute">
              <motion.div
                className={`w-32 h-32 rounded-full ${
                  isListening ? "bg-blue-500/20" : isSpeaking ? "bg-purple-500/20" : "bg-gray-500/20"
                }`}
                animate={{
                  scale: isListening || isSpeaking ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Center Circle */}
            <motion.div
              className={`w-24 h-24 rounded-full ${
                isListening ? "bg-blue-500" : isSpeaking ? "bg-purple-500" : "bg-gray-600"
              } flex items-center justify-center`}
              animate={{
                scale: isListening || isSpeaking ? [1, 0.9, 1] : 1,
              }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                {isSpeaking && <Volume2 size={24} className="text-purple-500" />}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="space-y-4">
          <textarea
            className="w-full bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 text-white resize-none"
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Click to edit transcript..."
          />

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 font-medium">AI Response:</p>
              {isSpeaking && <VoiceWaveform isListening={isSpeaking} />}
            </div>
            <p>{aiResponse || "Waiting for your input..."}</p>
          </div>

          <div className="flex justify-center space-x-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleListening}
              className={`p-4 rounded-full ${isListening ? "bg-red-500" : "bg-blue-500"}`}
              disabled={isSpeaking}
            >
              <Mic size={24} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSubmit}
              disabled={!transcript.trim() || isPending || isSpeaking}
              className="p-4 rounded-full bg-gray-600 disabled:opacity-50"
            >
              <Send size={24} />
            </motion.button>
          </div>
        </div>
      </div>

      <audio ref={audioRef} className="hidden" />
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}

