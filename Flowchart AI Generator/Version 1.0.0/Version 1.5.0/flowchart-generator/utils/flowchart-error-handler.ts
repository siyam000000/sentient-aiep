/**
 * Flowchart Error Handler
 *
 * Provides utilities for handling and recovering from flowchart generation
 * and rendering errors.
 */

import { ErrorLogger } from "./logging"

/**
 * Error categories for flowchart errors
 */
export enum FlowchartErrorCategory {
  SYNTAX = "syntax",
  RENDERING = "rendering",
  GENERATION = "generation",
  NETWORK = "network",
  UNKNOWN = "unknown",
}

/**
 * Flowchart error with additional metadata
 */
export interface FlowchartError {
  message: string
  category: FlowchartErrorCategory
  originalError?: Error
  recoverable: boolean
  code?: string
}

/**
 * Categorizes an error based on its message and context
 * @param error The error to categorize
 * @param context Additional context about where the error occurred
 * @returns Categorized flowchart error
 */
export function categorizeFlowchartError(error: Error | string, context = "unknown"): FlowchartError {
  const message = typeof error === "string" ? error : error.message
  const originalError = typeof error === "string" ? undefined : error

  // Syntax errors
  if (message.includes("syntax error") || message.includes("invalid syntax") || message.includes("parse error")) {
    return {
      message,
      category: FlowchartErrorCategory.SYNTAX,
      originalError,
      recoverable: true,
    }
  }

  // Rendering errors
  if (message.includes("render") || message.includes("rendering") || context === "mermaid-renderer") {
    return {
      message,
      category: FlowchartErrorCategory.RENDERING,
      originalError,
      recoverable: true,
    }
  }

  // Generation errors
  if (message.includes("generation") || message.includes("generate") || context === "claude-api") {
    return {
      message,
      category: FlowchartErrorCategory.GENERATION,
      originalError,
      recoverable: true,
    }
  }

  // Network errors
  if (
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("fetch") ||
    message.includes("rate limit") ||
    message.includes("429")
  ) {
    return {
      message,
      category: FlowchartErrorCategory.NETWORK,
      originalError,
      recoverable: true,
    }
  }

  // Default to unknown
  return {
    message,
    category: FlowchartErrorCategory.UNKNOWN,
    originalError,
    recoverable: false,
  }
}

/**
 * Logs a flowchart error with appropriate context
 * @param error The error to log
 * @param sessionId Session identifier for tracking
 * @param context Additional context about where the error occurred
 */
export function logFlowchartError(error: Error | string, sessionId: string, context = "unknown"): void {
  const categorizedError = categorizeFlowchartError(error, context)

  ErrorLogger.addLog(sessionId, `[${categorizedError.category.toUpperCase()}] ${categorizedError.message}`)

  // Log additional details for debugging
  if (categorizedError.originalError) {
    console.error(`Flowchart error [${sessionId}]:`, categorizedError.originalError)
  }
}

/**
 * Suggests a recovery strategy based on the error category
 * @param error The categorized flowchart error
 * @returns Recovery strategy message
 */
export function suggestRecoveryStrategy(error: FlowchartError): string {
  switch (error.category) {
    case FlowchartErrorCategory.SYNTAX:
      return "Try simplifying the flowchart structure or using basic node shapes."

    case FlowchartErrorCategory.RENDERING:
      return "Try changing the orientation or reducing the number of nodes."

    case FlowchartErrorCategory.GENERATION:
      return "Try providing a more specific description or breaking down the flowchart into smaller parts."

    case FlowchartErrorCategory.NETWORK:
      return "Please check your internet connection and try again in a few moments."

    default:
      return "Try regenerating the flowchart with a simpler description."
  }
}

