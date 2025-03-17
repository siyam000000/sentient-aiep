"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { toast } from "sonner"

export function useAudioPlayer() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [hasAudioFailed, setHasAudioFailed] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playPromiseRef = useRef<Promise<void> | null>(null)
  const isPlayingRef = useRef(false)

  // Initialize audio element once
  useEffect(() => {
    if (!audioRef.current) {
      const audioElement = new Audio()
      audioRef.current = audioElement

      audioElement.onplay = () => {
        console.log("Audio playback started")
        setIsSpeaking(true)
        isPlayingRef.current = true
        setHasAudioFailed(false)
      }

      audioElement.onended = () => {
        console.log("Audio playback ended")
        setIsSpeaking(false)
        isPlayingRef.current = false
      }

      audioElement.onpause = () => {
        console.log("Audio playback paused")
        setIsSpeaking(false)
        isPlayingRef.current = false
      }

      audioElement.onerror = (e) => {
        console.error("Audio playback error:", e)
        setIsSpeaking(false)
        isPlayingRef.current = false
        setHasAudioFailed(true)
      }

      // Add rate change listener
      audioElement.onratechange = () => {
        console.log("Playback rate changed to:", audioElement.playbackRate)
      }
    }

    return () => {
      if (audioRef.current) {
        // Ensure we properly clean up the audio element
        const audio = audioRef.current

        // Wait for any pending play promise to resolve before cleaning up
        if (playPromiseRef.current) {
          playPromiseRef.current
            .then(() => {
              audio.pause()
              audio.src = ""
            })
            .catch(() => {
              // Ignore errors during cleanup
            })
        } else {
          audio.pause()
          audio.src = ""
        }

        audio.onplay = null
        audio.onended = null
        audio.onpause = null
        audio.onerror = null
        audio.onratechange = null
      }
    }
  }, [])

  // Safe stop function that respects the play promise
  const stopAudio = useCallback(() => {
    if (!audioRef.current || !isPlayingRef.current) return

    // If there's a pending play operation, wait for it to complete before pausing
    if (playPromiseRef.current) {
      playPromiseRef.current
        .then(() => {
          if (audioRef.current && !audioRef.current.paused) {
            console.log("Stopping audio after play promise resolved")
            audioRef.current.pause()
            setIsSpeaking(false)
            isPlayingRef.current = false
          }
        })
        .catch((err) => {
          console.error("Error in play promise during stop:", err)
          setIsSpeaking(false)
          isPlayingRef.current = false
        })
    } else if (audioRef.current && !audioRef.current.paused) {
      console.log("Stopping audio directly")
      audioRef.current.pause()
      setIsSpeaking(false)
      isPlayingRef.current = false
    }
  }, [])

  // Play audio with better error handling and state management
  const playAudio = useCallback(
    async (base64Audio: string) => {
      // First, ensure any previous playback is properly stopped
      // Wait for any pending play promise to resolve before stopping
      if (playPromiseRef.current) {
        try {
          await playPromiseRef.current
        } catch (err) {
          console.error("Error resolving previous play promise:", err)
        }
      }

      // Now safely stop any current audio
      stopAudio()

      // Wait a small amount of time to ensure any previous audio operations are complete
      await new Promise((resolve) => setTimeout(resolve, 100))

      if (!audioRef.current) return false

      try {
        // Validate the base64 string
        if (!base64Audio || base64Audio.length === 0) {
          console.error("Invalid audio data: empty base64 string")
          setHasAudioFailed(true)
          return false
        }

        // Reset state
        setHasAudioFailed(false)

        // Create a new audio source
        console.log("Setting audio source, base64 length:", base64Audio.length)

        // ElevenLabs returns audio/mpeg format
        audioRef.current.src = `data:audio/mpeg;base64,${base64Audio}`

        // Set playback rate for better clarity
        audioRef.current.playbackRate = 1.0

        // Preload the audio
        audioRef.current.load()

        // Use promise to handle play errors
        console.log("Starting audio playback")

        // Clear any existing play promise
        playPromiseRef.current = null

        // Create a new play promise
        playPromiseRef.current = audioRef.current.play()

        try {
          await playPromiseRef.current
          console.log("Audio playback started successfully")
          return true
        } catch (playError) {
          // Handle the AbortError specifically
          if (playError.name === "AbortError") {
            console.warn("Play was aborted, likely due to another play/pause operation")
            // Don't treat this as a failure
            return true
          }

          console.error("Playback error:", playError)
          setHasAudioFailed(true)
          setIsSpeaking(false)
          isPlayingRef.current = false
          toast.error("Failed to play audio response")
          return false
        } finally {
          // Don't clear the play promise here, as we need to reference it in stopAudio
        }
      } catch (err) {
        console.error("Error setting up audio:", err)
        setHasAudioFailed(true)
        setIsSpeaking(false)
        isPlayingRef.current = false
        return false
      }
    },
    [stopAudio],
  )

  return {
    isSpeaking,
    hasAudioFailed,
    setHasAudioFailed,
    playAudio,
    stopAudio,
  }
}

