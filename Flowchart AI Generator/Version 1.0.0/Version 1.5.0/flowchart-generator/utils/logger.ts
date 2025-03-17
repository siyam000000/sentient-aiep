/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
}

/**
 * Default logger configuration
 */
const defaultConfig: LoggerConfig = {
  level: process.env.NODE_ENV === "production" ? LogLevel.ERROR : LogLevel.DEBUG,
  enableConsole: true,
}

/**
 * Logger class for application-wide logging
 */
export class Logger {
  private static config: LoggerConfig = { ...defaultConfig }
  private static logs: Record<string, Array<{ level: LogLevel; message: string; timestamp: string }>> = {}

  /**
   * Configure the logger
   *
   * @param config - Logger configuration
   */
  static configure(config: Partial<LoggerConfig>): void {
    Logger.config = { ...Logger.config, ...config }
  }

  /**
   * Log a debug message
   *
   * @param message - The message to log
   * @param category - The log category
   */
  static debug(message: string, category = "app"): void {
    Logger.log(LogLevel.DEBUG, message, category)
  }

  /**
   * Log an info message
   *
   * @param message - The message to log
   * @param category - The log category
   */
  static info(message: string, category = "app"): void {
    Logger.log(LogLevel.INFO, message, category)
  }

  /**
   * Log a warning message
   *
   * @param message - The message to log
   * @param category - The log category
   */
  static warn(message: string, category = "app"): void {
    Logger.log(LogLevel.WARN, message, category)
  }

  /**
   * Log an error message
   *
   * @param message - The message to log
   * @param error - The error object
   * @param category - The log category
   */
  static error(message: string, error?: unknown, category = "app"): void {
    const errorMessage = error instanceof Error ? `${message}: ${error.message}` : message
    Logger.log(LogLevel.ERROR, errorMessage, category)

    if (error instanceof Error && error.stack && Logger.config.enableConsole) {
      console.error(error.stack)
    }
  }

  /**
   * Get logs for a specific category
   *
   * @param category - The log category
   * @returns Array of log entries
   */
  static getLogs(category = "app"): Array<{ level: LogLevel; message: string; timestamp: string }> {
    return Logger.logs[category] || []
  }

  /**
   * Clear logs for a specific category
   *
   * @param category - The log category
   */
  static clearLogs(category = "app"): void {
    delete Logger.logs[category]
  }

  /**
   * Internal log method
   *
   * @param level - The log level
   * @param message - The message to log
   * @param category - The log category
   */
  private static log(level: LogLevel, message: string, category: string): void {
    // Check if we should log this level
    if (!Logger.shouldLog(level)) {
      return
    }

    const timestamp = new Date().toISOString()
    const logEntry = { level, message, timestamp }

    // Initialize category if it doesn't exist
    if (!Logger.logs[category]) {
      Logger.logs[category] = []
    }

    // Add log entry
    Logger.logs[category].push(logEntry)

    // Limit logs to 1000 entries per category
    if (Logger.logs[category].length > 1000) {
      Logger.logs[category] = Logger.logs[category].slice(-1000)
    }

    // Log to console if enabled
    if (Logger.config.enableConsole) {
      const consoleMethod = Logger.getConsoleMethod(level)
      consoleMethod(`[${timestamp}] [${category}] [${level.toUpperCase()}] ${message}`)
    }
  }

  /**
   * Check if a log level should be logged
   *
   * @param level - The log level to check
   * @returns Whether the log level should be logged
   */
  private static shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]
    const configLevelIndex = levels.indexOf(Logger.config.level)
    const logLevelIndex = levels.indexOf(level)

    return logLevelIndex >= configLevelIndex
  }

  /**
   * Get the console method for a log level
   *
   * @param level - The log level
   * @returns The console method
   */
  private static getConsoleMethod(level: LogLevel): (message: string) => void {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug
      case LogLevel.INFO:
        return console.info
      case LogLevel.WARN:
        return console.warn
      case LogLevel.ERROR:
        return console.error
      default:
        return console.log
    }
  }
}

