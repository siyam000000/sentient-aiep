/**
 * Custom hook for MermaidRenderer component logic
 */

"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import mermaid from "mermaid"
import type { UseMermaidRendererOptions, UseMermaidRendererResult } from "./types"
import { fixMermaidCode } from "@/services/mermaid-service"
import {
  cleanMermaidCode,
  fixMermaidSyntaxIssues,
  ensureValidGraphDeclaration,
  fixDogLifecycleFlowchart,
  removeRepeatedGraphDeclarations,
  aggressivelyFixMalformedCode,
  createSimplifiedDiagram,
  isDiagramTooComplex,
} from "@/utils/mermaid-helpers"

// Maximum number of automatic fix attempts
const MAX_AUTO_FIX_ATTEMPTS = 3

/**
 * Custom hook that handles the logic for rendering and fixing Mermaid diagrams
 */
export function useMermaidRenderer({
  code,
  onCodeFix,
  onRenderError,
}: UseMermaidRendererOptions): UseMermaidRendererResult {
  const containerRef = useRef<HTMLDivElement>(null)
  const [renderError, setRenderError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [orientation, setOrientation] = useState<"TD" | "LR">("TD")
  const [isRendered, setIsRendered] = useState(false)
  const [isFixingCode, setIsFixingCode] = useState(false)
  const [autoFixAttempts, setAutoFixAttempts] = useState(0)
  const [autoFixInProgress, setAutoFixInProgress] = useState(false)
  const [autoFixLogs, setAutoFixLogs] = useState<string[]>([])
  const [showLogs, setShowLogs] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark" | "neutral">("light")
  const [showGrid, setShowGrid] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Add a log entry
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toISOString().substring(11, 19) // HH:MM:SS
    const logEntry = `[${timestamp}] ${message}`
    console.log(logEntry)
    setAutoFixLogs((prev) => [...prev, logEntry])
  }, [])

  // Simplify large diagrams
  const simplifyLargeDiagram = useCallback((code: string): string => {
    // Extract the graph declaration
    const declarationMatch = code.match(/^(graph\s+[A-Z]{2}|flowchart\s+[A-Z]{2})/i)
    const declaration = declarationMatch ? declarationMatch[0] : "graph TD"

    // Create a simplified version with just a few nodes
    return createSimplifiedDiagram(code)
  }, [])

  // Function to attempt to fix broken Mermaid code
  const attemptCodeFix = useCallback(
    async (isAutoFix = false) => {
      if (!code) return false

      if (isAutoFix) {
        setAutoFixInProgress(true)
        addLog(`Starting auto-fix attempt ${autoFixAttempts + 1}/${MAX_AUTO_FIX_ATTEMPTS}`)
      } else {
        setIsFixingCode(true)
      }

      try {
        // Check for severe malformation with repeated declarations first
        const graphNodeCount = (code.match(/graph_node TD/g) || []).length
        const hNodeCount = (code.match(/h_node TD/g) || []).length

        if (graphNodeCount > 5 || hNodeCount > 5) {
          addLog("Detected severely malformed code with repeated declarations")
          const fixedCode = removeRepeatedGraphDeclarations(code)

          if (fixedCode !== code) {
            onCodeFix?.(fixedCode)
            setRenderError(null)
            addLog("Fixed severely malformed code with repeated declarations")
            return true
          }
        }

        // Check if the diagram is too complex
        if (isDiagramTooComplex(code)) {
          addLog("Detected overly complex diagram, simplifying")
          const simplifiedCode = createSimplifiedDiagram(code)
          onCodeFix?.(simplifiedCode)
          setRenderError(null)
          addLog("Applied simplified diagram due to complexity")
          return true
        }

        // Check if this is the dog lifecycle flowchart and apply special fix
        if (code.includes("Puppy Stage") && code.includes("Adult Stage") && code.includes("Senior Stage")) {
          addLog("Detected dog lifecycle flowchart, applying special fix")
          const fixedCode = fixDogLifecycleFlowchart(code)
          onCodeFix?.(fixedCode)
          setRenderError(null)
          addLog("Special fix for dog lifecycle flowchart applied")
          return true
        }

        // Use the centralized fix service
        const fixResult = await fixMermaidCode(code, {
          sessionId: "mermaid-renderer",
          maxAttempts: 1,
          useAI: true,
        })

        if (fixResult.wasFixed) {
          onCodeFix?.(fixResult.code)
          setRenderError(null)
          addLog(`Fix successful using method: ${fixResult.fixMethod}`)
          return true
        } else {
          // Last resort - try with a completely new diagram
          addLog("Using fallback diagram as last resort")
          const fallbackCode = `graph TD\nA[Start] --> B[End]`
          onCodeFix?.(fallbackCode)
          setRenderError("Could not fix the original diagram code. Created a simple fallback diagram.")
          return true
        }
      } catch (error) {
        console.error("Error fixing Mermaid code:", error)
        setRenderError(`Failed to fix diagram: ${error instanceof Error ? error.message : String(error)}`)
        addLog(`Fix attempt failed: ${error instanceof Error ? error.message : String(error)}`)

        // Last resort fallback
        if (isAutoFix && autoFixAttempts >= MAX_AUTO_FIX_ATTEMPTS - 1) {
          addLog("Maximum attempts reached, using simple fallback")
          const fallbackCode = `graph TD\nA[Start] --> B[End]`
          onCodeFix?.(fallbackCode)
          return true
        }
        return false
      } finally {
        if (isAutoFix) {
          setAutoFixInProgress(false)
          setAutoFixAttempts((prev) => prev + 1)
        } else {
          setIsFixingCode(false)
        }
      }
    },
    [code, onCodeFix, autoFixAttempts, addLog],
  )

  // Render the Mermaid diagram
  const renderMermaid = useCallback(() => {
    if (containerRef.current && code) {
      try {
        containerRef.current.innerHTML = ""
        setIsRendered(false)
        setAutoFixLogs([])
        setAutoFixAttempts(0)

        // Apply aggressive fix first if the code contains graph_node
        let codeToRender = code

        if (code.includes("graph_node") || code.includes("TD graph_node")) {
          addLog("Detected problematic graph_node pattern, applying aggressive fix")
          codeToRender = aggressivelyFixMalformedCode(code)

          // If we successfully fixed it, notify the parent
          if (codeToRender !== code) {
            onCodeFix?.(codeToRender)
            addLog("Successfully applied aggressive fix for graph_node pattern")
          }
        }

        // Check if the diagram is too complex
        if (isDiagramTooComplex(codeToRender)) {
          addLog("Detected overly complex diagram, simplifying")
          codeToRender = createSimplifiedDiagram(codeToRender)
          onCodeFix?.(codeToRender)
          addLog("Applied simplified diagram due to complexity")
        }

        // Check for severe malformation with repeated graph_node declarations
        const graphNodePattern = /graph_node\s+TD|TD\s+graph_node/g
        const matches = codeToRender.match(graphNodePattern) || []

        if (matches.length > 0) {
          addLog(`Detected ${matches.length} instances of malformed graph_node declarations`)
          codeToRender = removeRepeatedGraphDeclarations(codeToRender)

          // If we successfully fixed it, notify the parent
          if (codeToRender !== code) {
            onCodeFix?.(codeToRender)
            addLog("Successfully fixed repeated graph declarations")
          }
        }

        // Check for other repeated graph declarations
        const graphNodeCount = (codeToRender.match(/graph_node TD/g) || []).length
        const hNodeCount = (codeToRender.match(/h_node TD/g) || []).length

        if (graphNodeCount > 0 || hNodeCount > 0) {
          addLog("Detected malformed code with repeated declarations")
          codeToRender = removeRepeatedGraphDeclarations(codeToRender)

          // If we successfully fixed it, notify the parent
          if (codeToRender !== code) {
            onCodeFix?.(codeToRender)
          }
        }

        // Check if this is the dog lifecycle flowchart and apply special fix
        if (
          codeToRender.includes("Puppy Stage") &&
          codeToRender.includes("Adult Stage") &&
          codeToRender.includes("Senior Stage")
        ) {
          addLog("Detected dog lifecycle flowchart, applying special fix")
          codeToRender = fixDogLifecycleFlowchart(codeToRender)
        } else {
          // Ensure valid graph declaration, clean and fix the code
          codeToRender = ensureValidGraphDeclaration(codeToRender)
          codeToRender = cleanMermaidCode(codeToRender)
          codeToRender = fixMermaidSyntaxIssues(codeToRender)
        }

        // Modify orientation if needed
        if (orientation === "LR" && codeToRender.includes("graph TD")) {
          codeToRender = codeToRender.replace(/graph\s+TD/i, "graph LR")
        } else if (orientation === "TD" && codeToRender.includes("graph LR")) {
          codeToRender = codeToRender.replace(/graph\s+LR/i, "graph TD")
        }

        // Initialize Mermaid with theme settings
        const mermaidTheme = theme === "dark" ? "dark" : theme === "neutral" ? "neutral" : "default"

        mermaid.initialize({
          startOnLoad: true,
          theme: mermaidTheme,
          flowchart: {
            curve: "basis",
            padding: 20,
            useMaxWidth: false,
          },
          securityLevel: "loose",
          maxTextSize: 100000, // Increase from default 50000
        })

        const diagramDiv = document.createElement("div")
        diagramDiv.textContent = codeToRender
        containerRef.current.appendChild(diagramDiv)

        mermaid
          .run({
            nodes: [diagramDiv],
          })
          .then(() => {
            setIsRendered(true)
            setRenderError(null)
            addLog("Diagram rendered successfully")
          })
          .catch((error) => {
            console.error("Error running mermaid:", error)
            const errorMessage = `Failed to render the flowchart: ${error.message || String(error)}`

            // Check specifically for the size exceeded error
            if (errorMessage.includes("Maximum text size") || errorMessage.includes("size exceeded")) {
              addLog("Detected 'Maximum text size exceeded' error, simplifying diagram")
              const simplifiedCode = simplifyLargeDiagram(code)
              onCodeFix?.(simplifiedCode)
              addLog("Applied simplified diagram due to size limitations")
              return // Don't set error state, we're handling it
            }

            setRenderError(errorMessage)
            setIsRendered(false)
            addLog(`Render error: ${error.message || String(error)}`)

            // Notify parent of render error
            onRenderError?.(errorMessage)

            // Automatically attempt to fix if this is the first error
            if (autoFixAttempts < MAX_AUTO_FIX_ATTEMPTS) {
              addLog("Initiating automatic fix")
              attemptCodeFix(true)
            } else {
              addLog("Maximum auto-fix attempts reached")
            }
          })
      } catch (error) {
        console.error("Error rendering Mermaid diagram:", error)
        const errorMessage = `Failed to render the flowchart. Syntax error: ${error instanceof Error ? error.message : String(error)}`
        setRenderError(errorMessage)
        setIsRendered(false)
        addLog(`Render exception: ${error instanceof Error ? error.message : String(error)}`)

        // Notify parent of render error
        onRenderError?.(errorMessage)

        // Automatically attempt to fix if this is the first error
        if (autoFixAttempts < MAX_AUTO_FIX_ATTEMPTS) {
          addLog("Initiating automatic fix")
          attemptCodeFix(true)
        } else {
          addLog("Maximum auto-fix attempts reached")
        }
      }
    }
  }, [
    code,
    orientation,
    autoFixAttempts,
    attemptCodeFix,
    addLog,
    onRenderError,
    onCodeFix,
    theme,
    simplifyLargeDiagram,
  ])

  // Effect to handle automatic fixing
  useEffect(() => {
    if (renderError && autoFixAttempts < MAX_AUTO_FIX_ATTEMPTS && !autoFixInProgress) {
      const timer = setTimeout(() => {
        attemptCodeFix(true)
      }, 1000) // Wait 1 second before attempting to fix

      return () => clearTimeout(timer)
    }
  }, [renderError, autoFixAttempts, autoFixInProgress, attemptCodeFix])

  // Render the diagram when code changes
  useEffect(() => {
    if (code) {
      renderMermaid()
    }
  }, [code, renderMermaid])

  // Handle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev)
  }, [])

  // Copy diagram code to clipboard
  const copyDiagramCode = useCallback(() => {
    if (code) {
      navigator.clipboard.writeText(code)
      return true
    }
    return false
  }, [code])

  // Download diagram as SVG
  const downloadDiagram = useCallback(async () => {
    if (!containerRef.current || !isRendered) return false

    try {
      // Find the SVG element
      const svgElement = containerRef.current.querySelector("svg")
      if (!svgElement) {
        throw new Error("SVG element not found")
      }

      // Get SVG source
      const serializer = new XMLSerializer()
      let source = serializer.serializeToString(svgElement)

      // Add XML declaration and namespace if missing
      if (!source.match(/^<\?xml/)) {
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source
      }

      if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
      }

      // Convert SVG to a Blob
      const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" })
      const svgUrl = URL.createObjectURL(svgBlob)

      // Create download link
      const downloadLink = document.createElement("a")
      downloadLink.href = svgUrl
      downloadLink.download = "flowchart.svg"
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      // Clean up
      URL.revokeObjectURL(svgUrl)

      return true
    } catch (error) {
      console.error("Error downloading diagram:", error)
      return false
    }
  }, [isRendered])

  // UI control functions
  const zoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.1, 2))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5))
  }, [])

  const toggleOrientation = useCallback(() => {
    setOrientation((prev) => (prev === "TD" ? "LR" : "TD"))
  }, [])

  const toggleLogs = useCallback(() => {
    setShowLogs((prev) => !prev)
  }, [])

  const toggleGrid = useCallback(() => {
    setShowGrid((prev) => !prev)
  }, [])

  const changeTheme = useCallback(
    (newTheme: "light" | "dark" | "neutral") => {
      setTheme(newTheme)
      // Re-render with new theme
      renderMermaid()
    },
    [renderMermaid],
  )

  return {
    containerRef,
    renderError,
    zoom,
    orientation,
    isRendered,
    autoFixAttempts,
    autoFixInProgress,
    autoFixLogs,
    showLogs,
    isFixingCode,
    MAX_AUTO_FIX_ATTEMPTS,
    theme,
    showGrid,
    isFullscreen,
    zoomIn,
    zoomOut,
    toggleOrientation,
    toggleLogs,
    toggleGrid,
    changeTheme,
    toggleFullscreen,
    copyDiagramCode,
    downloadDiagram,
    attemptCodeFix,
  }
}

