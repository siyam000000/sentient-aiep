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
      <div className="flex justify-between mb-3 bg-blue-900/30 p-2 rounded-lg border border-blue-800/50">
        <div className="flex space-x-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={zoomIn}
                className="text-blue-300 hover:text-white hover:bg-blue-800/50"
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
                variant="ghost"
                size="sm"
                onClick={zoomOut}
                className="text-blue-300 hover:text-white hover:bg-blue-800/50"
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
                variant="ghost"
                size="sm"
                onClick={toggleOrientation}
                className="text-blue-300 hover:text-white hover:bg-blue-800/50"
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
                  variant="ghost"
                  size="sm"
                  onClick={onToggleGrid}
                  className={`text-blue-300 hover:text-white hover:bg-blue-800/50 ${showGrid ? "bg-blue-800/50" : ""}`}
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
                      variant="ghost"
                      size="sm"
                      className="text-blue-300 hover:text-white hover:bg-blue-800/50"
                      aria-label="Change theme"
                    >
                      <Paintbrush className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Change theme</TooltipContent>
              </Tooltip>
              <DropdownMenuContent className="bg-blue-900 border-blue-800 text-white">
                <DropdownMenuItem
                  onClick={() => onThemeChange("light")}
                  className="hover:bg-blue-800 focus:bg-blue-800"
                >
                  <Sun className="h-4 w-4 mr-2 text-yellow-400" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onThemeChange("dark")} className="hover:bg-blue-800 focus:bg-blue-800">
                  <Moon className="h-4 w-4 mr-2 text-blue-400" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onThemeChange("neutral")}
                  className="hover:bg-blue-800 focus:bg-blue-800"
                >
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
                  variant="ghost"
                  size="sm"
                  onClick={onFullscreen}
                  className="text-blue-300 hover:text-white hover:bg-blue-800/50"
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
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-blue-300 hover:text-white hover:bg-blue-800/50"
                  aria-label="Copy diagram code"
                >
                  {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copied ? "Copied!" : "Copy code"}</TooltipContent>
            </Tooltip>
          )}

          {onDownload && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDownload}
                  className="text-blue-300 hover:text-white hover:bg-blue-800/50"
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

