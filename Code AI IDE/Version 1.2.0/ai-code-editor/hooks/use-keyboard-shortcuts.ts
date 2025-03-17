"use client"

import { useEffect, useRef } from "react"

type ShortcutHandler = (e: KeyboardEvent) => void
type ShortcutMap = Record<string, ShortcutHandler>

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const shortcutsRef = useRef<ShortcutMap>(shortcuts)

  // Update ref if shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Create a key identifier based on modifiers and key
      const modifiers = []
      if (e.ctrlKey || e.metaKey) modifiers.push("ctrl")
      if (e.altKey) modifiers.push("alt")
      if (e.shiftKey) modifiers.push("shift")

      const key = e.key.toLowerCase()
      const shortcutKey = [...modifiers, key].join("+")

      // Check if we have a handler for this shortcut
      const handler = shortcutsRef.current[shortcutKey]
      if (handler) {
        e.preventDefault()
        handler(e)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])
}

// Helper function to format shortcuts for display
export function formatShortcut(shortcut: string): string {
  return shortcut
    .split("+")
    .map((part) => {
      if (part === "ctrl") return "⌘/Ctrl"
      if (part === "shift") return "⇧"
      if (part === "alt") return "Alt"
      return part.toUpperCase()
    })
    .join(" + ")
}

