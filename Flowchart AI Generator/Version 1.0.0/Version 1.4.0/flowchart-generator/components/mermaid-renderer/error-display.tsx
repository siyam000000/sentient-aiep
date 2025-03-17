/**
 * Error display component for the MermaidRenderer
 */

"use client"

import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface ErrorDisplayProps {
  renderError: string
  autoFixInProgress: boolean
  autoFixAttempts: number
  maxAutoFixAttempts: number
  isFixingCode: boolean
  showLogs: boolean
  autoFixLogs: string[]
  toggleLogs: () => void
  onRetryAutoFix: () => void
  onManualFix: () => void
}

export function ErrorDisplay({
  renderError,
  autoFixInProgress,
  autoFixAttempts,
  maxAutoFixAttempts,
  isFixingCode,
  showLogs,
  autoFixLogs,
  toggleLogs,
  onRetryAutoFix,
  onManualFix,
}: ErrorDisplayProps) {
  return (
    <div className="mt-4 space-y-4">
      <Alert variant={autoFixInProgress ? "default" : "destructive"}>
        <AlertTriangle className="h-4 w-4 mr-2" />
        <AlertDescription>
          {autoFixInProgress
            ? `Automatically fixing diagram (Attempt ${autoFixAttempts + 1}/${maxAutoFixAttempts})...`
            : renderError}
        </AlertDescription>
      </Alert>

      {autoFixInProgress && (
        <Progress value={(autoFixAttempts / maxAutoFixAttempts) * 100} className="h-2" aria-label="Auto-fix progress" />
      )}

      {autoFixAttempts >= maxAutoFixAttempts && !autoFixInProgress && (
        <div className="flex space-x-2">
          <Button onClick={onRetryAutoFix} className="flex-1 bg-amber-600 hover:bg-amber-700">
            Try Auto-Fix Again
          </Button>

          <Button onClick={onManualFix} disabled={isFixingCode} className="flex-1 bg-blue-600 hover:bg-blue-700">
            Manual Fix
          </Button>
        </div>
      )}

      <Button
        onClick={toggleLogs}
        variant="outline"
        className="w-full text-sm"
        aria-expanded={showLogs}
        aria-controls="debug-logs"
      >
        {showLogs ? "Hide Debug Logs" : "Show Debug Logs"}
      </Button>

      {showLogs && (
        <div id="debug-logs" className="bg-gray-100 p-3 rounded text-sm overflow-x-auto max-h-40 overflow-y-auto">
          {autoFixLogs.length > 0 ? (
            <pre className="whitespace-pre-wrap text-xs">{autoFixLogs.join("\n")}</pre>
          ) : (
            <p className="text-gray-500 italic">No logs available</p>
          )}
        </div>
      )}
    </div>
  )
}

