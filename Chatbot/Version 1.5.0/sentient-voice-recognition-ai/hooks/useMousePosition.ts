"use client"

import { useState, useEffect } from "react"

export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // Throttle function to limit the rate of execution
    const throttle = (callback: Function, delay: number) => {
      let lastCall = 0
      return (...args: any[]) => {
        const now = new Date().getTime()
        if (now - lastCall < delay) {
          return
        }
        lastCall = now
        return callback(...args)
      }
    }

    const handleMouseMove = throttle((event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY })
    }, 16) // ~60fps

    const handleTouchMove = throttle((event: TouchEvent) => {
      if (event.touches.length > 0) {
        setMousePosition({
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        })
      }
    }, 16)

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleTouchMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
    }
  }, [])

  return mousePosition
}

