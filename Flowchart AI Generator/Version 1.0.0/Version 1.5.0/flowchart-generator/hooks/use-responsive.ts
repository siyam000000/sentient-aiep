"use client"

import { useState, useEffect } from "react"
import { UI_CONFIG } from "@/config/app-config"

type DeviceType = "mobile" | "tablet" | "desktop"
type Orientation = "portrait" | "landscape"

interface ResponsiveState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  deviceType: DeviceType
  orientation: Orientation
  width: number
  height: number
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    deviceType: "desktop",
    orientation: "landscape",
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const orientation: Orientation = height > width ? "portrait" : "landscape"

      let deviceType: DeviceType
      let isMobile = false
      let isTablet = false
      let isDesktop = false

      if (width < UI_CONFIG.MOBILE_BREAKPOINT) {
        deviceType = "mobile"
        isMobile = true
      } else if (width < UI_CONFIG.TABLET_BREAKPOINT) {
        deviceType = "tablet"
        isTablet = true
      } else {
        deviceType = "desktop"
        isDesktop = true
      }

      setState({
        isMobile,
        isTablet,
        isDesktop,
        deviceType,
        orientation,
        width,
        height,
      })
    }

    // Initial check
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return state
}

