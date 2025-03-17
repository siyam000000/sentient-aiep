/**
 * MermaidRenderer Component
 *
 * Renders Mermaid diagrams with error handling, auto-fixing, and interactive controls.
 */

"use client"

import { useImperativeHandle } from "react"

import { forwardRef } from "react"
import type { MermaidRendererProps, MermaidRendererRef } from "./types"
import { useMermaidRenderer } from "./use-mermaid-renderer"
import { DiagramControls } from "./diagram-controls"
import { DiagramDisplay } from "./diagram-display"
import { ErrorDisplay } from "./error-display"

/**
 * Component for rendering Mermaid diagrams with error handling and interactive controls
 */
export const MermaidRenderer = forwardRef<MermaidRendererRef, MermaidRendererProps>(
  ({ code, className = "", onCodeFix, onRenderError }, ref) => {
    const {
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
    } = useMermaidRenderer({ code, onCodeFix, onRenderError })

    // Expose methods to parent components via ref
    useImperativeHandle(ref, () => ({
      downloadDiagram,
      fixCode: attemptCodeFix,
      copyDiagramCode,
    }))

    // Apply fullscreen class if needed
    const containerClass = isFullscreen ? "fixed inset-0 z-50 bg-blue-950/95 p-4 flex flex-col" : "flex flex-col h-full"

    return (
      <div className={containerClass}>
        {/* Diagram Controls */}
        <DiagramControls
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          toggleOrientation={toggleOrientation}
          orientation={orientation}
          onDownload={downloadDiagram}
          onCopy={copyDiagramCode}
          onThemeChange={changeTheme}
          onToggleGrid={toggleGrid}
          showGrid={showGrid}
          theme={theme}
          onFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />

        {/* Diagram Display */}
        <DiagramDisplay
          containerRef={containerRef}
          zoom={zoom}
          className={className}
          theme={theme}
          showGrid={showGrid}
        />

        {/* Error Display */}
        {renderError && (
          <ErrorDisplay
            renderError={renderError}
            autoFixInProgress={autoFixInProgress}
            autoFixAttempts={autoFixAttempts}
            maxAutoFixAttempts={MAX_AUTO_FIX_ATTEMPTS}
            isFixingCode={isFixingCode}
            showLogs={showLogs}
            autoFixLogs={autoFixLogs}
            toggleLogs={toggleLogs}
            onRetryAutoFix={() => {
              attemptCodeFix(true)
            }}
            onManualFix={() => attemptCodeFix(false)}
          />
        )}
      </div>
    )
  },
)

MermaidRenderer.displayName = "MermaidRenderer"

