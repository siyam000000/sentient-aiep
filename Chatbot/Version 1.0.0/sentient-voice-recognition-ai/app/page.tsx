"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { Waveform } from "./components/Waveform"
import { ChatMessage } from "./components/ChatMessage"
import { VoicePrompt } from "./components/VoicePrompt"
import { Settings } from "./components/Settings"

const DynamicVAD = dynamic(
  () =>
    import("@ricky0123/vad-react").then((mod) => ({
      default: mod.useMicVAD,
      utils: mod.utils,
    })),
  { ssr: false },
)

interface Message {
  role: "user" | "assistant"
  content: string
  latency?: number
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isPending, setIsPending] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const vad = DynamicVAD({
    startOnLoad: true,
    onSpeechStart: () => setIsListening(true),
    onSpeechEnd: async (audio) => {
      setIsListening(false)
      try {
        const wav = DynamicVAD.utils.encodeWAV(audio)
        const blob = new Blob([wav], { type: "audio/wav" })
        await handleSubmit(blob)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "An error occurred")
      }
    },
    onVADMisfire: () => setIsListening(false),
    workletURL: "/vad.worklet.bundle.min.js",
    modelURL: "/silero_vad.onnx",
  })

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  async function handleSubmit(data: Blob) {
    try {
      setIsPending(true)
      const formData = new FormData()
      formData.append("input", data, "audio.wav")

      for (const message of messages) {
        formData.append("message", JSON.stringify(message))
      }

      const submittedAt = Date.now()

      const response = await fetch("/api", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "An error occurred while processing your request.")
      }

      const transcript = decodeURIComponent(response.headers.get("X-Transcript") || "")
      const text = decodeURIComponent(response.headers.get("X-Response") || "")

      if (!transcript || !text || !response.body) {
        throw new Error("Invalid response from server")
      }

      const latency = Date.now() - submittedAt

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      setMessages((prev) => [
        ...prev,
        { role: "user", content: transcript },
        { role: "assistant", content: text, latency },
      ])

      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsPending(false)
    }
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [])

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <main className="flex-1 overflow-hidden p-4 flex flex-col items-center justify-center relative">
        <AnimatePresence>
          {messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              ref={chatContainerRef}
              className="absolute top-4 left-4 right-4 bottom-24 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300"
            >
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <VoicePrompt isListening={isListening} isPending={isPending} />

        <Waveform isListening={isListening} />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white text-black"
          onClick={() => setShowSettings(!showSettings)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </motion.button>
      </main>
      <audio ref={audioRef} className="hidden" />
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}

