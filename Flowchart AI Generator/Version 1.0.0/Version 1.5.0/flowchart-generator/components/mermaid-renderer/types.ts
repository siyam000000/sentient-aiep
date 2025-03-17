import type React from "react"
/**
 * Type definitions for the MermaidRenderer component
 */

export interface MermaidRendererProps {
  /** Mermaid diagram code to render */
  code: string
  /** Optional CSS class name */
  className?: string
  /** Callback when code is fixed */
  onCodeFix?: (fixedCode: string) => void
  /** Callback when a render error occurs */
  onRenderError?: (errorMessage: string) => void
}

export interface MermaidRendererRef {
  /** Downloads the current diagram as an SVG file */
  downloadDiagram: () => Promise<boolean>
  /** Attempts to fix the current diagram code */
  fixCode: (isAutoFix?: boolean) => Promise<boolean>
  /** Copies the diagram code to clipboard */
  copyDiagramCode: () => boolean
}

export interface UseMermaidRendererOptions {
  /** Mermaid diagram code to render */
  code: string
  /** Callback when code is fixed */
  onCodeFix?: (fixedCode: string) => void
  /** Callback when a render error occurs */
  onRenderError?: (errorMessage: string) => void
}

export interface UseMermaidRendererResult {
  /** Reference to the container element */
  containerRef: React.RefObject<HTMLDivElement>
  /** Current render error message */
  renderError: string | null
  /** Current zoom level */
  zoom: number
  /** Current diagram orientation */
  orientation: "TD" | "LR"
  /** Whether the diagram has been rendered */
  isRendered: boolean
  /** Number of automatic fix attempts */
  autoFixAttempts: number
  /** Whether an automatic fix is in progress */
  autoFixInProgress: boolean
  /** Logs from automatic fix attempts */
  autoFixLogs: string[]
  /** Whether to show the logs */
  showLogs: boolean
  /** Whether a manual fix is in progress */
  isFixingCode: boolean
  /** Maximum number of automatic fix attempts */
  MAX_AUTO_FIX_ATTEMPTS: number
  /** Current theme */
  theme: "light" | "dark" | "neutral"
  /** Whether to show the grid */
  showGrid: boolean
  /** Whether the diagram is in fullscreen mode */
  isFullscreen: boolean
  /** Increases the zoom level */
  zoomIn: () => void
  /** Decreases the zoom level */
  zoomOut: () => void
  /** Toggles between TD and LR orientation */
  toggleOrientation: () => void
  /** Toggles showing the logs */
  toggleLogs: () => void
  /** Toggles showing the grid */
  toggleGrid: () => void
  /** Changes the theme */
  changeTheme: (theme: "light" | "dark" | "neutral") => void
  /** Toggles fullscreen mode */
  toggleFullscreen: () => void
  /** Copies the diagram code to clipboard */
  copyDiagramCode: () => boolean
  /** Downloads the diagram as an SVG file */
  downloadDiagram: () => Promise<boolean>
  /** Attempts to fix the code */
  attemptCodeFix: (isAutoFix?: boolean) => Promise<boolean>
}

