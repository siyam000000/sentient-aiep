import { Logger } from "./logger"

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  code: string

  constructor(message: string, code = "UNKNOWN_ERROR") {
    super(message)
    this.name = "AppError"
    this.code = code
  }
}

/**
 * Error handler function
 *
 * @param error - The error to handle
 * @param context - Additional context information
 * @returns User-friendly error message
 */
export function handleError(error: unknown, context = "app"): string {
  // Log the error
  Logger.error("An error occurred", error, context)

  // Return a user-friendly message
  if (error instanceof AppError) {
    return error.message
  } else if (error instanceof Error) {
    return `An error occurred: ${error.message}`
  } else {
    return "An unexpected error occurred"
  }
}

/**
 * Safely execute a function and handle any errors
 *
 * @param fn - The function to execute
 * @param errorHandler - Custom error handler
 * @returns The result of the function or null if an error occurred
 */
export async function safeExecute<T>(fn: () => Promise<T>, errorHandler?: (error: unknown) => void): Promise<T | null> {
  try {
    return await fn()
  } catch (error) {
    if (errorHandler) {
      errorHandler(error)
    } else {
      handleError(error)
    }
    return null
  }
}

