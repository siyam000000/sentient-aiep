"use client"

import type React from "react"
import { useVoice } from "../contexts/VoiceContext"

export const TranscriptDisplay: React.FC = () => {
  const { transcript } = useVoice()

  return (
    <div className="bg-gray-100 p-4 rounded-md">
      <h2 className="text-lg font-semibold mb-2">Transcript:</h2>
      <p>{transcript || "Start speaking to see the transcript..."}</p>
    </div>
  )
}

