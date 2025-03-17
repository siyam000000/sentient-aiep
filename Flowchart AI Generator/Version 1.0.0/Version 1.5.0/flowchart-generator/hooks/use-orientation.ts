"use client"

import { useState, useEffect } from "react"

type Orientation = "portrait" | "landscape"

/**
 * Custom hook for detecting device orientation
 * @returns Current orientation and a boolean indicating if orientation is supported
 */
export function useOrientation(): { orientation: Orientation; isSupported: boolean } {
  const [orientation, setOrientation] = useState<Orientation>("portrait")
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if orientation is supported
    const supported =
      typeof window !== "undefined" &&
      (window.screen?.orientation || window.matchMedia("(orientation: portrait)").matches !== undefined)

    setIsSupported(supported)

    if (!supported) return

    // Initial orientation
    const updateOrientation = () => {
      if (window.matchMedia("(orientation: portrait)").matches) {
        setOrientation("portrait")
      } else {
        setOrientation("landscape")
      }
    }

    // Set initial orientation
    updateOrientation()

    // Add event listeners
    const portraitMql = window.matchMedia("(orientation: portrait)")
    const landscapeMql = window.matchMedia("(orientation: landscape)")

    // Modern browsers
    if (portraitMql.addEventListener) {
      portraitMql.addEventListener("change", updateOrientation)
      landscapeMql.addEventListener("change", updateOrientation)

      return () => {
        portraitMql.removeEventListener("change", updateOrientation)
        landscapeMql.removeEventListener("change", updateOrientation)
      }
    }
    // Legacy browsers
    else if (portraitMql.addListener) {
      portraitMql.addListener(updateOrientation)
      landscapeMql.addListener(updateOrientation)

      return () => {
        portraitMql.removeListener(updateOrientation)
        landscapeMql.removeListener(updateOrientation)
      }
    }
  }, [])

  return { orientation, isSupported }
}

