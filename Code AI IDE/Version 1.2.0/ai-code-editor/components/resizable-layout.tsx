"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ResizableLayoutProps {
  direction: "horizontal" | "vertical"
  defaultSizes: number[] // Percentages
  minSizes?: number[] // Pixels
  children: React.ReactNode[]
  className?: string
}

export function ResizableLayout({ direction, defaultSizes, minSizes = [], children, className }: ResizableLayoutProps) {
  const [sizes, setSizes] = useState(defaultSizes)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const activeSeparatorIndex = useRef<number | null>(null)

  // Ensure we have min sizes for all panels
  const normalizedMinSizes = minSizes.length === children.length ? minSizes : Array(children.length).fill(50)

  // Handle resize
  const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingRef.current = true
    activeSeparatorIndex.current = index
    document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize"
    document.body.style.userSelect = "none"

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current || activeSeparatorIndex.current === null || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const index = activeSeparatorIndex.current

    // Calculate new sizes
    const newSizes = [...sizes]

    if (direction === "horizontal") {
      const containerWidth = containerRect.width
      const mouseX = e.clientX - containerRect.left
      const percentX = (mouseX / containerWidth) * 100

      // Ensure minimum sizes
      const minSizePercent1 = (normalizedMinSizes[index] / containerWidth) * 100
      const minSizePercent2 = (normalizedMinSizes[index + 1] / containerWidth) * 100

      // Calculate the sum of all panels before the current one
      const previousSum = sizes.slice(0, index).reduce((sum, size) => sum + size, 0)

      // Ensure we don't go below minimum sizes
      if (percentX - previousSum < minSizePercent1) {
        newSizes[index] = minSizePercent1
        newSizes[index + 1] = sizes[index] + sizes[index + 1] - minSizePercent1
      } else if (sizes[index] + sizes[index + 1] - (percentX - previousSum) < minSizePercent2) {
        newSizes[index] = sizes[index] + sizes[index + 1] - minSizePercent2
        newSizes[index + 1] = minSizePercent2
      } else {
        newSizes[index] = percentX - previousSum
        newSizes[index + 1] = sizes[index] + sizes[index + 1] - newSizes[index]
      }
    } else {
      const containerHeight = containerRect.height
      const mouseY = e.clientY - containerRect.top
      const percentY = (mouseY / containerHeight) * 100

      // Ensure minimum sizes
      const minSizePercent1 = (normalizedMinSizes[index] / containerHeight) * 100
      const minSizePercent2 = (normalizedMinSizes[index + 1] / containerHeight) * 100

      // Calculate the sum of all panels before the current one
      const previousSum = sizes.slice(0, index).reduce((sum, size) => sum + size, 0)

      // Ensure we don't go below minimum sizes
      if (percentY - previousSum < minSizePercent1) {
        newSizes[index] = minSizePercent1
        newSizes[index + 1] = sizes[index] + sizes[index + 1] - minSizePercent1
      } else if (sizes[index] + sizes[index + 1] - (percentY - previousSum) < minSizePercent2) {
        newSizes[index] = sizes[index] + sizes[index + 1] - minSizePercent2
        newSizes[index + 1] = minSizePercent2
      } else {
        newSizes[index] = percentY - previousSum
        newSizes[index + 1] = sizes[index] + sizes[index + 1] - newSizes[index]
      }
    }

    setSizes(newSizes)
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
    activeSeparatorIndex.current = null
    document.body.style.cursor = ""
    document.body.style.userSelect = ""

    // Remove event listeners
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
  }

  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  return (
    <div ref={containerRef} className={cn("flex", direction === "horizontal" ? "flex-row" : "flex-col", className)}>
      {children.map((child, i) => (
        <div
          key={i}
          style={{
            flexBasis: `${sizes[i]}%`,
            flexGrow: 0,
            flexShrink: 0,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {child}

          {/* Resize handle */}
          {i < children.length - 1 && (
            <div
              className={cn(
                "absolute z-10 bg-transparent hover:bg-blue-500/30 transition-colors",
                direction === "horizontal"
                  ? "cursor-col-resize right-0 top-0 w-1 h-full"
                  : "cursor-row-resize bottom-0 left-0 h-1 w-full",
              )}
              onMouseDown={handleMouseDown(i)}
            />
          )}
        </div>
      ))}
    </div>
  )
}

