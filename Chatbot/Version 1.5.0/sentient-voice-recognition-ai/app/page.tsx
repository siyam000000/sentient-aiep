"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, AlertTriangle, RefreshCw, Info, X } from "lucide-react"
import { toast } from "sonner"
import { useTheme } from "./contexts/ThemeContext"
import { Settings } from "./components/Settings"
import { VoiceWaveform } from "./components/VoiceWaveform"
import { ChatHistory } from "./components/ChatHistory"
import { MicrophoneButton } from "./components/MicrophoneButton"
import { SendButton } from "./components/SendButton"
import { useSpeechRecognition } from "./hooks/useSpeechRecognition"
import { useAudioPlayer } from "./hooks/useAudioPlayer"
import { useChatHistory } from "./hooks/useChatHistory"
import { sendMessage } from "./services/apiService"
import { Navbar } from "./components/Navbar"
import { WelcomeModal } from "./components/WelcomeModal"
import { AudioPlayer } from "./components/AudioPlayer"

export default function Home() {
  // State management
  const [aiResponse, setAiResponse] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [errorDetails, setErrorDetails] = useState("")
  const [lastSuccessfulInput, setLastSuccessfulInput] = useState("")
  const [isFromCache, setIsFromCache] = useState(false)
  const [responseTime, setResponseTime] = useState<number | null>(null)
  const [audioBase64, setAudioBase64] = useState<string | null>(null)
  const [modelType, setModelType] = useState<string>("gpt-3.5-turbo") // Default model

  // Custom hooks
  const { themeColor, voiceType } = useTheme()
  const { transcript, setTranscript, isListening, toggleListening, stopListening } = useSpeechRecognition()
  const { isSpeaking, hasAudioFailed, setHasAudioFailed, playAudio, stopAudio } = useAudioPlayer()
  const { chatHistory, showChatHistory, addMessage, clearChatHistory, toggleChatHistory } = useChatHistory()

  // Stop listening when speaking starts
  useEffect(() => {
    if (isSpeaking && isListening) {
      stopListening()
    }
  }, [isSpeaking, isListening, stopListening])

  // Handle form submission
  const handleSubmit = async (inputText = transcript) => {
    if (!inputText.trim()) return

    // Reset states
    setIsPending(true)
    setHasAudioFailed(false)
    setErrorDetails("")
    setIsFromCache(false)
    setResponseTime(null)
    setAudioBase64(null)

    // Start timing
    const startTime = performance.now()

    // Add user message to chat history
    addMessage({
      role: "user",
      content: inputText,
    })

    try {
      // Send message to API with the selected model type
      const data = await sendMessage(inputText, voiceType, modelType)

      // Calculate response time
      const endTime = performance.now()
      setResponseTime(Math.round(endTime - startTime))

      if (data.response) {
        // Update UI with response
        setAiResponse(data.response)
        setLastSuccessfulInput(inputText)
        setIsFromCache(!!data.fromCache)

        // Add assistant message to chat history
        addMessage({
          role: "assistant",
          content: data.response,
        })

        // Store error details if available
        if (data.details) {
          setErrorDetails(data.details)
        }

        // Handle audio response
        if (data.audioBase64) {
          setAudioBase64(data.audioBase64)
          try {
            const success = await playAudio(data.audioBase64)
            if (!success) {
              setHasAudioFailed(true)
              toast.warning("Failed to play audio response")
            }
          } catch (audioError) {
            console.error("Audio playback error:", audioError)
            setHasAudioFailed(true)
            toast.warning("Error during audio playback")
          }
        } else {
          setHasAudioFailed(true)
          if (!data.fromCache) {
            toast.warning("Voice synthesis failed, showing text response only")
          }
        }
      }

      // Clear transcript after successful submission
      setTranscript("")
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      toast.error(error instanceof Error ? error.message : "Failed to process request")
    } finally {
      setIsPending(false)
    }
  }

  // Function to retry voice synthesis
  const retryVoiceSynthesis = () => {
    if (lastSuccessfulInput && aiResponse) {
      toast.info("Retrying voice synthesis...")
      handleSubmit(lastSuccessfulInput)
    }
  }

  // Function to show error details
  const showErrorInfo = () => {
    if (errorDetails) {
      toast.info(
        <div className="max-w-md">
          <h3 className="font-bold mb-2">Error Details</h3>
          <p className="text-sm break-words">{errorDetails}</p>
        </div>,
        { duration: 10000 },
      )
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${themeColor} text-white p-4`}>
      <Navbar
        onSettingsClick={() => setShowSettings(true)}
        onChatHistoryClick={toggleChatHistory}
        showChatHistory={showChatHistory}
      />

      <main className="max-w-2xl mx-auto pt-24">
        {chatHistory.length > 0 && showChatHistory && (
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Chat History</h2>
            <button
              onClick={clearChatHistory}
              className="text-sm bg-red-500/20 hover:bg-red-500/30 text-red-500 p-1 rounded-md flex items-center"
              aria-label="Clear chat history"
            >
              <X size={14} className="mr-1" /> Clear History
            </button>
          </div>
        )}

        <ChatHistory messages={chatHistory} isVisible={showChatHistory} />

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
                {hasAudioFailed && aiResponse && <AlertTriangle size={24} className="text-yellow-500" />}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="space-y-4">
          <textarea
            className="w-full bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Click to edit transcript..."
            aria-label="Voice transcript"
          />

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <p className="text-gray-400 font-medium">AI Response:</p>
                {isFromCache && (
                  <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Cached</span>
                )}
                {responseTime !== null && (
                  <span className="ml-2 text-xs bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded">
                    {responseTime < 1000 ? `${responseTime}ms` : `${(responseTime / 1000).toFixed(1)}s`}
                  </span>
                )}
              </div>
              {isSpeaking && <VoiceWaveform isListening={isSpeaking} />}
              {hasAudioFailed && aiResponse && (
                <div className="flex items-center">
                  <span className="text-xs text-yellow-500 flex items-center mr-2">
                    <AlertTriangle size={12} className="mr-1" /> Audio unavailable
                  </span>
                  <button
                    onClick={retryVoiceSynthesis}
                    className="text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 p-1 rounded-md flex items-center mr-1"
                    disabled={isPending}
                    aria-label="Retry voice synthesis"
                  >
                    <RefreshCw size={12} className="mr-1" /> Retry
                  </button>
                  {errorDetails && (
                    <button
                      onClick={showErrorInfo}
                      className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-500 p-1 rounded-md flex items-center"
                      aria-label="Show error details"
                    >
                      <Info size={12} className="mr-1" /> Info
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="min-h-[3rem]">{aiResponse || "Waiting for your input..."}</p>

            {/* Audio player */}
            {audioBase64 && (
              <div className="mt-4">
                <AudioPlayer
                  audioBase64={audioBase64}
                  isPlaying={isSpeaking}
                  onPlaybackEnd={() => {
                    console.log("Playback ended callback from page")
                    stopAudio()
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-4 mt-8">
            <MicrophoneButton
              isListening={isListening}
              toggleListening={toggleListening}
              disabled={isSpeaking || isPending}
            />

            <SendButton onSend={() => handleSubmit()} disabled={!transcript.trim() || isPending || isSpeaking} />
          </div>
        </div>
      </main>

      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <WelcomeModal />
    </div>
  )
}

