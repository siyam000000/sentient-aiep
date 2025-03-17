"use client"

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react"
import mermaid from "mermaid"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCw, AlertTriangle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { MermaidRendererProps, MermaidRendererRef } from "@/types"
import { MERMAID_CONFIG, UI_CONFIG } from "@/config/app-config"
import { API_ROUTES } from "@/config/app-config"

/**
 * Component for rendering Mermaid diagrams with error handling and interactive controls
 */
export const MermaidRenderer = forwardRef<MermaidRendererRef, MermaidRendererProps>(
  ({ code, className = "", onCodeFix }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [renderError, setRenderError] = useState<string | null>(null)
    const [zoom, setZoom] = useState(1)
    const [orientation, setOrientation] = useState<"TD" | "LR">(MERMAID_CONFIG.DEFAULT_ORIENTATION as "TD" | "LR")
    const [isRendered, setIsRendered] = useState(false)
    const [isFixingCode, setIsFixingCode] = useState(false)

    /**
     * Attempts to fix broken Mermaid code using the API
     */
    const attemptCodeFix = useCallback(async (): Promise<boolean> => {
      if (!code) return false

      setIsFixingCode(true)

      try {
        const response = await fetch(API_ROUTES.FIX_MERMAID_CODE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fix Mermaid code")
        }

        if (data.fixedCode && data.fixedCode !== code) {
          // Notify parent component of the fixed code
          onCodeFix?.(data.fixedCode)
          setRenderError(null)
          return true
        } else {
          setRenderError("Could not fix the diagram code automatically. Please try regenerating.")
          return false
        }
      } catch (error) {
        console.error("Error fixing Mermaid code:", error)
        setRenderError(`Failed to fix diagram: ${error instanceof Error ? error.message : String(error)}`)
        return false
      } finally {
        setIsFixingCode(false)
      }
    }, [code, onCodeFix])

    /**
     * Exposes methods to parent components
     */
    useImperativeHandle(ref, () => ({
      downloadDiagram: async () => {
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
          downloadLink.download = UI_CONFIG.DOWNLOAD_FILENAME
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
      },
      fixCode: attemptCodeFix,
    }))

    /**
     * Renders the Mermaid diagram
     */
    const renderMermaid = useCallback(() => {
      if (containerRef.current && code) {
        try {
          containerRef.current.innerHTML = ""
          setIsRendered(false)

          // Clean the code by removing markdown code block markers and fixing formatting issues
          let codeToRender = code
            .replace(/```mermaid\n?/g, "")
            .replace(/```\n?/g, "")
            .trim()

          // Fix missing line breaks between node connections
          codeToRender = codeToRender.replace(/(\w+\s*-->\s*\w+)(\s+)(\w+\s*-->\s*\w+)/g, "$1\n$3")

          // Ensure proper spacing around arrows
          codeToRender = codeToRender.replace(/(\w+)\s*-->\s*(\w+)/g, "$1 --> $2")

          // Fix any malformed node definitions
          codeToRender = codeToRender.replace(/(\w+)(\["[^"]*"\])(\w+)/g, "$1$2\n$3")

          // Modify orientation if needed
          if (orientation === "LR" && codeToRender.includes("graph TD")) {
            codeToRender = codeToRender.replace("graph TD", "graph LR")
          } else if (orientation === "TD" && codeToRender.includes("graph LR")) {
            codeToRender = codeToRender.replace("graph LR", "graph TD")
          }

          mermaid.initialize({
            startOnLoad: true,
            theme: MERMAID_CONFIG.DEFAULT_THEME,
            flowchart: {
              curve: "basis",
              padding: 20,
              useMaxWidth: false,
            },
            securityLevel: "loose",
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
            })
            .catch((error) => {
              console.error("Error running mermaid:", error)
              setRenderError(`Failed to render the flowchart: ${error.message || String(error)}`)
              setIsRendered(false)
            })
        } catch (error) {
          console.error("Error rendering Mermaid diagram:", error)
          setRenderError(
            `Failed to render the flowchart. Syntax error: ${error instanceof Error ? error.message : String(error)}`,
          )
          setIsRendered(false)
        }
      }
    }, [code, orientation])

    /**
     * Re-render when code or orientation changes
     */
    useEffect(() => {
      if (code) {
        renderMermaid()
      }
    }, [code, renderMermaid])

    /**
     * Zoom in the diagram
     */
    const zoomIn = () => {
      setZoom((prev) => Math.min(prev + UI_CONFIG.ZOOM_STEP, UI_CONFIG.MAX_ZOOM))
    }

    /**
     * Zoom out the diagram
     */
    const zoomOut = () => {
      setZoom((prev) => Math.max(prev - UI_CONFIG.ZOOM_STEP, UI_CONFIG.MIN_ZOOM))
    }

    /**
     * Toggle between TD and LR orientation
     */
    const toggleOrientation = () => {
      setOrientation((prev) => (prev === "TD" ? "LR" : "TD"))
    }

    /**
     * Debug the Mermaid code
     */
    const debugMermaidCode = async () => {
      try {
        setIsFixingCode(true)

        const response = await fetch(API_ROUTES.DEBUG_MERMAID_CODE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to debug Mermaid code")
        }

        // Display diagnostic information
        console.log("Mermaid Code Diagnostics:", data.diagnostics)

        // Try to render with the cleaned code
        if (data.cleanedCode && data.cleanedCode !== code) {
          onCodeFix?.(data.cleanedCode)
          setRenderError("Code was fixed. Check console for diagnostic information.")
        }
      } catch (error) {
        console.error("Error debugging Mermaid code:", error)
      } finally {
        setIsFixingCode(false)
      }
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-end mb-2 space-x-2">
          <Button variant="outline" size="sm" onClick={zoomIn} className="bg-blue-700 hover:bg-blue-600">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={zoomOut} className="bg-blue-700 hover:bg-blue-600">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={toggleOrientation} className="bg-blue-700 hover:bg-blue-600">
            <RotateCw className="h-4 w-4" />
            <span className="ml-1">{orientation}</span>
          </Button>
        </div>

        <div
          className={`mermaid-container overflow-auto bg-white p-4 rounded flex-1 ${className}`}
          style={{
            maxHeight: "calc(100vh - 300px)",
            overflowX: "auto",
            overflowY: "auto",
          }}
          data-testid="mermaid-container"
        >
          <div
            ref={containerRef}
            className="mermaid"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              minHeight: "100%",
              width: "fit-content",
            }}
          ></div>
        </div>

        {renderError && (
          <div className="mt-4 space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>{renderError}</AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button
                onClick={attemptCodeFix}
                disabled={isFixingCode}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                {isFixingCode ? "Fixing Diagram..." : "Fix Diagram with AI"}
              </Button>

              <Button
                onClick={debugMermaidCode}
                disabled={isFixingCode}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Debug Code
              </Button>
            </div>

            <div className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap">{code}</pre>
            </div>
          </div>
        )}
      </div>
    )
  },
)

MermaidRenderer.displayName = "MermaidRenderer"

