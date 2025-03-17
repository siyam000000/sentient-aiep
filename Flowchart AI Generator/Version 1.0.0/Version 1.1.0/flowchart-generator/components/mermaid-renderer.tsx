"use client"

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react"
import mermaid from "mermaid"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCw, AlertTriangle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cleanMermaidCode, fixMermaidSyntaxIssues } from "@/utils/mermaid-helpers"

interface MermaidRendererProps {
  code: string
  className?: string
  onCodeFix?: (fixedCode: string) => void
}

// Change the component definition to use forwardRef
export const MermaidRenderer = forwardRef(({ code, className = "", onCodeFix }: MermaidRendererProps, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [renderError, setRenderError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [orientation, setOrientation] = useState<"TD" | "LR">("TD")
  const [isRendered, setIsRendered] = useState(false)
  const [isFixingCode, setIsFixingCode] = useState(false)

  // Function to attempt to fix broken Mermaid code
  const attemptCodeFix = useCallback(async () => {
    if (!code) return

    setIsFixingCode(true)

    try {
      const response = await fetch("/api/fix-mermaid-code", {
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
      } else {
        setRenderError("Could not fix the diagram code automatically. Please try regenerating.")
      }
    } catch (error) {
      console.error("Error fixing Mermaid code:", error)
      setRenderError(`Failed to fix diagram: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsFixingCode(false)
    }
  }, [code, onCodeFix])

  // Expose methods to parent components
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
    },
    fixCode: attemptCodeFix,
  }))

  // Update the renderMermaid function to clean the code before rendering
  const renderMermaid = useCallback(() => {
    if (containerRef.current && code) {
      try {
        containerRef.current.innerHTML = ""
        setIsRendered(false)

        // Clean the code by removing markdown code block markers
        let codeToRender = cleanMermaidCode(code)

        // Try to fix common syntax issues
        codeToRender = fixMermaidSyntaxIssues(codeToRender)

        // Modify orientation if needed
        if (orientation === "LR" && codeToRender.includes("graph TD")) {
          codeToRender = codeToRender.replace("graph TD", "graph LR")
        } else if (orientation === "TD" && codeToRender.includes("graph LR")) {
          codeToRender = codeToRender.replace("graph LR", "graph TD")
        }

        mermaid.initialize({
          startOnLoad: true,
          theme: "default",
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

  useEffect(() => {
    if (code) {
      renderMermaid()
    }
  }, [code, renderMermaid])

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2))
  }

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5))
  }

  const toggleOrientation = () => {
    setOrientation((prev) => (prev === "TD" ? "LR" : "TD"))
  }

  const debugMermaidCode = async () => {
    try {
      setIsFixingCode(true)

      const response = await fetch("/api/debug-mermaid-code", {
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
          <span className="ml-1">{orientation === "TD" ? "TD" : "LR"}</span>
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
            <Button onClick={attemptCodeFix} disabled={isFixingCode} className="flex-1 bg-amber-600 hover:bg-amber-700">
              {isFixingCode ? "Fixing Diagram..." : "Fix Diagram with AI"}
            </Button>

            <Button onClick={debugMermaidCode} disabled={isFixingCode} className="flex-1 bg-blue-600 hover:bg-blue-700">
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
})

MermaidRenderer.displayName = "MermaidRenderer"

