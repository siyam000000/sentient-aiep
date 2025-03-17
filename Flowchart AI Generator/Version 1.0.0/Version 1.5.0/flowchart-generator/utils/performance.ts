/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private static marks: Record<string, number> = {}
  private static measures: Record<string, Array<{ duration: number; timestamp: number }>> = {}

  /**
   * Start a performance measurement
   *
   * @param name - The name of the measurement
   */
  static start(name: string): void {
    PerformanceMonitor.marks[name] = performance.now()
  }

  /**
   * End a performance measurement
   *
   * @param name - The name of the measurement
   * @returns The duration of the measurement in milliseconds
   */
  static end(name: string): number {
    const startTime = PerformanceMonitor.marks[name]
    if (!startTime) {
      console.warn(`No start mark found for "${name}"`)
      return 0
    }

    const endTime = performance.now()
    const duration = endTime - startTime

    // Initialize measures array if it doesn't exist
    if (!PerformanceMonitor.measures[name]) {
      PerformanceMonitor.measures[name] = []
    }

    // Add measure
    PerformanceMonitor.measures[name].push({
      duration,
      timestamp: Date.now(),
    })

    // Limit measures to 100 entries per name
    if (PerformanceMonitor.measures[name].length > 100) {
      PerformanceMonitor.measures[name] = PerformanceMonitor.measures[name].slice(-100)
    }

    // Clean up mark
    delete PerformanceMonitor.marks[name]

    return duration
  }

  /**
   * Measure the execution time of a function
   *
   * @param name - The name of the measurement
   * @param fn - The function to measure
   * @returns The result of the function
   */
  static async measure<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    PerformanceMonitor.start(name)
    try {
      const result = await fn()
      return result
    } finally {
      PerformanceMonitor.end(name)
    }
  }

  /**
   * Get performance measures for a specific name
   *
   * @param name - The name of the measurement
   * @returns Array of measures
   */
  static getMeasures(name: string): Array<{ duration: number; timestamp: number }> {
    return PerformanceMonitor.measures[name] || []
  }

  /**
   * Get average duration for a specific name
   *
   * @param name - The name of the measurement
   * @returns Average duration in milliseconds
   */
  static getAverageDuration(name: string): number {
    const measures = PerformanceMonitor.measures[name] || []
    if (measures.length === 0) {
      return 0
    }

    const total = measures.reduce((sum, measure) => sum + measure.duration, 0)
    return total / measures.length
  }

  /**
   * Clear all performance measures
   */
  static clearMeasures(): void {
    PerformanceMonitor.measures = {}
  }
}

