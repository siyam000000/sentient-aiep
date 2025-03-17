"use client"

import { useEffect, useCallback } from "react"

type KeyCombination = {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
}

type ShortcutHandler = (event: KeyboardEvent) => void

type ShortcutDefinition = {
  combo: KeyCombination
  handler: ShortcutHandler
  preventDefault?: boolean
}

/**
 * Custom hook for handling keyboard shortcuts
 * @param shortcuts Array of shortcut definitions
 */
export function useKeyboardShortcuts(shortcuts: ShortcutDefinition[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const { combo, handler, preventDefault = true } = shortcut

        // Check if the key combination matches
        const keyMatches = event.key.toLowerCase() === combo.key.toLowerCase()
        const ctrlMatches = combo.ctrlKey === undefined || event.ctrlKey === combo.ctrlKey
        const altMatches = combo.altKey === undefined || event.altKey === combo.altKey
        const shiftMatches = combo.shiftKey === undefined || event.shiftKey === combo.shiftKey
        const metaMatches = combo.metaKey === undefined || event.metaKey === combo.metaKey

        if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
          if (preventDefault) {
            event.preventDefault()
          }
          handler(event)
          break
        }
      }
    },
    [shortcuts],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])
}

