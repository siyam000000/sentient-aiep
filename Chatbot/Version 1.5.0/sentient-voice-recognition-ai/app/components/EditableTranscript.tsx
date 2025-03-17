"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface EditableTranscriptProps {
  transcript: string
  setTranscript: (transcript: string) => void
  isListening: boolean
}

export const EditableTranscript: React.FC<EditableTranscriptProps> = ({ transcript, setTranscript, isListening }) => {
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleEdit = () => {
    if (!isListening) {
      setIsEditing(true)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(e.target.value)
  }

  return (
    <motion.div
      className="w-full bg-gray-800 rounded-lg p-4 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {isEditing ? (
        <textarea
          ref={inputRef}
          value={transcript}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      ) : (
        <p className="text-white cursor-pointer" onClick={handleEdit}>
          {transcript || "Click to edit transcript..."}
        </p>
      )}
    </motion.div>
  )
}

