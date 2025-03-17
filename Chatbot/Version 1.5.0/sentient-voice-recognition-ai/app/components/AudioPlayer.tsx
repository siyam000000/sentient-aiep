"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Volume2, VolumeX, Pause, Play, SkipBack, SkipForward } from "lucide-react"
import { motion } from "framer-motion"

interface AudioPlayerProps {
  audioBase64: string | null
  isPlaying: boolean
  onPlaybackEnd: () => void
}

export function AudioPlayer({ audioBase64, isPlaying, onPlaybackEnd }: AudioPlayerProps) {
  // Create refs and state
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isAudioReady, setIsAudioReady] = useState(false)
  const [isUserSeeking, setIsUserSeeking] = useState(false)

  // Set up audio source when it changes
  useEffect(() => {
    if (!audioRef.current || !audioBase64) return

    try {
      audioRef.current.src = `data:audio/mpeg;base64,${audioBase64}`
      audioRef.current.load()
      console.log("Audio source set")
    } catch (error) {
      console.error(`Error setting source: ${error}`)
    }
  }, [audioBase64])

  // Handle play/pause from parent
  useEffect(() => {
    if (!audioRef.current || !isAudioReady) return

    try {
      if (isPlaying) {
        console.log("Parent requested play")
        audioRef.current.play()
      } else {
        console.log("Parent requested pause")
        audioRef.current.pause()
      }
    } catch (error) {
      console.error(`Play/pause error: ${error}`)
    }
  }, [isPlaying, isAudioReady])

  // Update time display
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      if (!isUserSeeking) {
        setCurrentTime(audio.currentTime)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsAudioReady(true)
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("durationchange", () => setDuration(audio.duration))

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("durationchange", () => setDuration(audio.duration))
    }
  }, [isUserSeeking])

  // Format time display (mm:ss)
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Handle mute toggle
  const handleMuteToggle = () => {
    if (!audioRef.current) return

    try {
      const newMuteState = !isMuted
      audioRef.current.muted = newMuteState
      setIsMuted(newMuteState)
      console.log(`Mute set to: ${newMuteState}`)
    } catch (error) {
      console.error(`Mute error: ${error}`)
    }
  }

  // Handle playback rate change
  const handleRateChange = (rate: number) => {
    if (!audioRef.current) return

    try {
      audioRef.current.playbackRate = rate
      setPlaybackRate(rate)
      console.log(`Playback rate set to: ${rate}`)
    } catch (error) {
      console.error(`Rate change error: ${error}`)
    }
  }

  // Handle play/pause toggle
  const handlePlayPauseToggle = () => {
    if (!audioRef.current) return

    try {
      if (audioRef.current.paused) {
        audioRef.current.play()
        console.log("Manual play")
      } else {
        audioRef.current.pause()
        console.log("Manual pause")
        onPlaybackEnd()
      }
    } catch (error) {
      console.error(`Play/pause toggle error: ${error}`)
    }
  }

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return

    const newTime = Number.parseFloat(e.target.value)
    setCurrentTime(newTime)
    audioRef.current.currentTime = newTime
  }

  // Skip forward/backward
  const handleSkip = (seconds: number) => {
    if (!audioRef.current) return

    const newTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, duration))
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  return (
    <div className="audio-player">
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        className="hidden"
        onEnded={() => {
          console.log("Audio ended")
          onPlaybackEnd()
        }}
        onPlay={() => console.log("Audio started playing")}
        onPause={() => console.log("Audio paused")}
        onError={(e) => console.error(`Audio error: ${e}`)}
      />

      {/* Custom player UI */}
      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30">
        {/* Waveform visualization (decorative) */}
        <div className="flex items-center justify-center h-8 mb-2 space-x-1">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
              animate={{
                height: isPlaying ? [4 + Math.random() * 12, 8 + Math.random() * 16, 4 + Math.random() * 12] : 4,
              }}
              transition={{
                duration: 0.8,
                repeat: isPlaying ? Number.POSITIVE_INFINITY : 0,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: i * 0.05,
              }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              step="0.01"
              onChange={handleSeek}
              onMouseDown={() => setIsUserSeeking(true)}
              onMouseUp={() => setIsUserSeeking(false)}
              onTouchStart={() => setIsUserSeeking(true)}
              onTouchEnd={() => setIsUserSeeking(false)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              aria-label="Seek audio position"
            />
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            <div
              className="absolute top-0 h-full w-3 h-3 bg-white rounded-full shadow-md -ml-1.5"
              style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Skip backward */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSkip(-10)}
              className="p-2 rounded-full bg-gray-800/60 hover:bg-gray-700/60 transition-colors"
              type="button"
              aria-label="Skip backward 10 seconds"
            >
              <SkipBack size={18} />
            </motion.button>

            {/* Play/Pause */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlayPauseToggle}
              className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-colors"
              type="button"
              aria-label={audioRef.current?.paused ? "Play" : "Pause"}
            >
              {audioRef.current?.paused ? <Play size={20} /> : <Pause size={20} />}
            </motion.button>

            {/* Skip forward */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSkip(10)}
              className="p-2 rounded-full bg-gray-800/60 hover:bg-gray-700/60 transition-colors"
              type="button"
              aria-label="Skip forward 10 seconds"
            >
              <SkipForward size={18} />
            </motion.button>
          </div>

          <div className="flex items-center space-x-3">
            {/* Mute toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleMuteToggle}
              className="p-2 rounded-full bg-gray-800/60 hover:bg-gray-700/60 transition-colors"
              type="button"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </motion.button>

            {/* Playback rate */}
            <div className="flex space-x-1">
              {[0.8, 1.0, 1.2].map((rate) => (
                <motion.button
                  key={rate}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRateChange(rate)}
                  className={`px-2 py-1 rounded-md text-xs transition-colors ${
                    Math.abs(playbackRate - rate) < 0.01
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "bg-gray-800/60 hover:bg-gray-700/60 text-gray-300"
                  }`}
                  type="button"
                  aria-label={`Set playback speed to ${rate}x`}
                >
                  {rate}x
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

