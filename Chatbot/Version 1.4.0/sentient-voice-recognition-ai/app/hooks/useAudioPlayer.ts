"use client"

import { useState, useRef, useEffect } from "react"

export function useAudioPlayer() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [hasAudioFailed, setHasAudioFailed] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audioElement = new Audio()
    audioRef.current = audioElement

    audioElement.onplay = () => {
      setIsSpeaking(true)
      setHasAudioFailed(false)
    }

    audioElement.onended = () => setIsSpeaking(false)
    audioElement.onpause = () => setIsSpeaking(false)

    audioElement.onerror = (e) => {
      console.error("Audio playback error:", e)
      setIsSpeaking(false)
      setHasAudioFailed(true)
    }

    return () => {
      audioElement.pause()
      audioElement.src = ""
      audioElement.onplay = null
      audioElement.onended = null
      audioElement.onpause = null
      audioElement.onerror = null
    }
  }, [])

  const playAudio = async (base64Audio: string) => {
    if (!audioRef.current) return false

    try {
      audioRef.current.src = `data:audio/mp3;base64,${base64Audio}`
      await audioRef.current.play()
      return true
    } catch (err) {
      console.error("Error playing audio:", err)
      setHasAudioFailed(true)
      return false
    }
  }

  const stopAudio = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      setIsSpeaking(false)
    }
  }

  return {
    isSpeaking,
    hasAudioFailed,
    setHasAudioFailed,
    playAudio,
    stopAudio,
  }
}

