/**
 * Display component for the Mermaid diagram
 */

"use client"

import { useEffect, useState } from "react"
import type { RefObject } from "react"

interface DiagramDisplayProps {
  containerRef: RefObject<HTMLDivElement>
  zoom: number
  className?: string
  theme?: "light" | "dark" | "neutral"
  showGrid?: boolean
}

export function DiagramDisplay({
  containerRef,
  zoom,
  className = "",
  theme = "light",
  showGrid = false,
}: DiagramDisplayProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Update dimensions when the diagram is rendered
  useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect
          setDimensions({ width, height })
        }
      })

      observer.observe(containerRef.current)

      return () => {
        observer.disconnect()
      }
    }
  }, [containerRef])

  // Determine background color based on theme
  const bgColor = theme === "dark" ? "bg-gray-900" : theme === "neutral" ? "bg-gray-100" : "bg-white"

  return (
    <div
      className={`mermaid-container overflow-auto ${bgColor} rounded-lg flex-1 ${className} ${
        showGrid ? "bg-grid" : ""
      } shadow-inner border border-blue-800/30`}
      style={{
        height: "100%",
        overflowX: "auto",
        overflowY: "auto",
        position: "relative",
      }}
      data-testid="mermaid-container"
    >
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
      )}

      <div
        ref={containerRef}
        className="mermaid p-4"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
          minHeight: "100%",
          width: "fit-content",
        }}
      ></div>

      {dimensions.width > 0 && (
        <div className="text-xs text-gray-400 absolute bottom-2 right-2 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-md">
          {Math.round(dimensions.width)} × {Math.round(dimensions.height)} px
        </div>
      )}
    </div>
  )
}

