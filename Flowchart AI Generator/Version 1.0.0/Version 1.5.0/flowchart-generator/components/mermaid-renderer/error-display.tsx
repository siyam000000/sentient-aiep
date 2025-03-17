/**
 * Error display component for the MermaidRenderer
 */

"use client"

import { AlertTriangle, Bug } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

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
      <Alert
        variant={autoFixInProgress ? "default" : "destructive"}
        className={
          autoFixInProgress ? "border-amber-600 bg-amber-900/30 text-white" : "border-red-800 bg-red-900/30 text-white"
        }
      >
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        <AlertDescription className="text-amber-100">
          {autoFixInProgress
            ? `Automatically fixing diagram (Attempt ${autoFixAttempts + 1}/${maxAutoFixAttempts})...`
            : renderError}
        </AlertDescription>
      </Alert>

      {autoFixInProgress && (
        <Progress
          value={(autoFixAttempts / maxAutoFixAttempts) * 100}
          className="h-2 bg-blue-900"
          indicatorClassName="bg-amber-500"
          aria-label="Auto-fix progress"
        />
      )}

      {autoFixAttempts >= maxAutoFixAttempts && !autoFixInProgress && (
        <div className="flex gap-3">
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
        className="w-full text-sm border-blue-800 text-blue-300 hover:bg-blue-800/50 hover:text-white"
        aria-expanded={showLogs}
        aria-controls="debug-logs"
      >
        <Bug className="h-4 w-4 mr-2" />
        {showLogs ? "Hide Debug Logs" : "Show Debug Logs"}
      </Button>

      {showLogs && (
        <div id="debug-logs" className="bg-blue-900/50 border border-blue-800/50 rounded-lg overflow-hidden">
          <ScrollArea className="h-40">
            {autoFixLogs.length > 0 ? (
              <pre className="whitespace-pre-wrap text-xs p-3 text-blue-200 font-mono">{autoFixLogs.join("\n")}</pre>
            ) : (
              <p className="text-blue-400 italic p-3">No logs available</p>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

