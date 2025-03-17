"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Send } from "lucide-react"
import { toast } from "sonner"
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition"
import { getAIResponse } from "@/lib/api"

const VoiceRecognition = () => {
  const [transcript, setTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [response, setResponse] = useState("")
  const { startListening, stopListening, resetTranscript } = useVoiceRecognition({
    onResult: (result) => setTranscript(result),
    onError: (error) => toast.error(`Error: ${error.message}`),
  })

  const handleToggleListening = () => {
    if (isListening) {
      stopListening()
      setIsListening(false)
    } else {
      startListening()
      setIsListening(true)
    }
  }

  const handleSendTranscript = async () => {
    try {
      const aiResponse = await getAIResponse(transcript)
      setResponse(aiResponse.response)
    } catch (error) {
      toast.error("Failed to process transcript")
    }
    resetTranscript()
    setIsListening(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Button size="lg" variant={isListening ? "destructive" : "default"} onClick={handleToggleListening}>
          {isListening ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
          {isListening ? "Stop Listening" : "Start Listening"}
        </Button>
      </div>
      <div className="bg-muted p-4 rounded-md min-h-[100px]">
        <p>{transcript || "Transcript will appear here..."}</p>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSendTranscript} disabled={!transcript}>
          <Send className="mr-2" /> Send
        </Button>
      </div>
      {response && (
        <div className="bg-primary text-primary-foreground p-4 rounded-md">
          <h3 className="font-bold mb-2">AI Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  )
}

export default VoiceRecognition

