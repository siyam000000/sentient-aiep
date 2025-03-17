/**
 * Controls for the Mermaid diagram
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Copy,
  Grid,
  Sun,
  Moon,
  Paintbrush,
  Maximize2,
  Minimize2,
  Check,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface DiagramControlsProps {
  zoomIn: () => void
  zoomOut: () => void
  toggleOrientation: () => void
  orientation: "TD" | "LR"
  onDownload?: () => void
  onCopy?: () => void
  onThemeChange?: (theme: "light" | "dark" | "neutral") => void
  onToggleGrid?: () => void
  showGrid?: boolean
  theme?: "light" | "dark" | "neutral"
  onFullscreen?: () => void
  isFullscreen?: boolean
}

export function DiagramControls({
  zoomIn,
  zoomOut,
  toggleOrientation,
  orientation,
  onDownload,
  onCopy,
  onThemeChange,
  onToggleGrid,
  showGrid = false,
  theme = "light",
  onFullscreen,
  isFullscreen = false,
}: DiagramControlsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (onCopy) {
      onCopy()
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <TooltipProvider>
      <div className="flex justify-between mb-2">
        <div className="flex space-x-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={zoomIn}
                className="bg-blue-700 hover:bg-blue-600"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom in</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={zoomOut}
                className="bg-blue-700 hover:bg-blue-600"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom out</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleOrientation}
                className="bg-blue-700 hover:bg-blue-600"
                aria-label={`Change orientation to ${orientation === "TD" ? "left-to-right" : "top-down"}`}
              >
                <RotateCw className="h-4 w-4 mr-1" />
                <span>{orientation}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Switch to {orientation === "TD" ? "left-to-right" : "top-down"} orientation</TooltipContent>
          </Tooltip>

          {onToggleGrid && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleGrid}
                  className={`${showGrid ? "bg-blue-600" : "bg-blue-700"} hover:bg-blue-600`}
                  aria-label={showGrid ? "Hide grid" : "Show grid"}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showGrid ? "Hide grid" : "Show grid"}</TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex space-x-1">
          {onThemeChange && (
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-blue-700 hover:bg-blue-600"
                      aria-label="Change theme"
                    >
                      <Paintbrush className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Change theme</TooltipContent>
              </Tooltip>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onThemeChange("light")}>
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onThemeChange("dark")}>
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onThemeChange("neutral")}>
                  <div className="h-4 w-4 mr-2 bg-gray-300 rounded-full" />
                  Neutral
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {onFullscreen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onFullscreen}
                  className="bg-blue-700 hover:bg-blue-600"
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}</TooltipContent>
            </Tooltip>
          )}

          {onCopy && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="bg-blue-700 hover:bg-blue-600"
                  aria-label="Copy diagram code"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copied ? "Copied!" : "Copy code"}</TooltipContent>
            </Tooltip>
          )}

          {onDownload && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDownload}
                  className="bg-blue-700 hover:bg-blue-600"
                  aria-label="Download diagram"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download diagram</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

