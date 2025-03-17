/**
 * Utility for logging error resolution attempts
 */
export class ErrorLogger {
  private static logs: Record<string, string[]> = {}

  /**
   * Add a log entry for a specific session
   * @param sessionId Unique identifier for the session
   * @param message Log message
   */
  static addLog(sessionId: string, message: string): void {
    if (!this.logs[sessionId]) {
      this.logs[sessionId] = []
    }

    const timestamp = new Date().toISOString()
    this.logs[sessionId].push(`[${timestamp}] ${message}`)

    // Keep only the last 100 logs per session
    if (this.logs[sessionId].length > 100) {
      this.logs[sessionId] = this.logs[sessionId].slice(-100)
    }

    // Log to console as well
    console.log(`[${sessionId}] ${message}`)
  }

  /**
   * Get all logs for a specific session
   * @param sessionId Unique identifier for the session
   * @returns Array of log messages
   */
  static getLogs(sessionId: string): string[] {
    return this.logs[sessionId] || []
  }

  /**
   * Clear logs for a specific session
   * @param sessionId Unique identifier for the session
   */
  static clearLogs(sessionId: string): void {
    delete this.logs[sessionId]
  }
}

