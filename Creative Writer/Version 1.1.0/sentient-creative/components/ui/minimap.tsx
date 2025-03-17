"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { Editor } from "@tiptap/react"

interface MinimapProps {
  editor: Editor | null
}

export const Minimap: React.FC<MinimapProps> = ({ editor }) => {
  const [content, setContent] = useState("")
  const minimapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editor) {
      const updateContent = () => {
        setContent(editor.getHTML())
      }
      editor.on("update", updateContent)
      updateContent()
      return () => {
        editor.off("update", updateContent)
      }
    }
  }, [editor])

  if (!editor) {
    return null
  }

  const lines = content.split(/\r\n|\r|\n/)

  return (
    <div
      ref={minimapRef}
      className="minimap w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-gray-200 dark:border-gray-700 mt-4"
      style={{ height: "200px" }}
    >
      <div className="minimap-header bg-gray-100 dark:bg-gray-700 p-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
        Minimap
      </div>
      <div
        className="minimap-content p-2 overflow-auto"
        style={{ height: "calc(100% - 40px)", fontSize: "14px", lineHeight: "18px" }}
      >
        {lines.map((line, index) => (
          <div key={index} className="minimap-line text-gray-600 dark:text-gray-400">
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}

