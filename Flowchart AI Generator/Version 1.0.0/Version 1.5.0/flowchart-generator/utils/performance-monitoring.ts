/**
 * Utility functions for monitoring application performance
 */

interface PerformanceMetric {
  name: string
  startTime: number
  duration: number
  timestamp: Date
}

// Store performance metrics
const metrics: PerformanceMetric[] = []

/**
 * Measures the execution time of a function
 * @param fn The function to measure
 * @param name The name of the metric
 * @returns The result of the function
 */
export async function measurePerformance<T>(fn: () => Promise<T> | T, name: string): Promise<T> {
  const startTime = performance.now()

  try {
    const result = await fn()
    const endTime = performance.now()
    const duration = endTime - startTime

    // Store the metric
    metrics.push({
      name,
      startTime,
      duration,
      timestamp: new Date(),
    })

    // Log the metric if in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
    }

    return result
  } catch (error) {
    const endTime = performance.now()
    const duration = endTime - startTime

    // Store the metric with error indication
    metrics.push({
      name: `${name} (error)`,
      startTime,
      duration,
      timestamp: new Date(),
    })

    throw error
  }
}

/**
 * Gets all recorded performance metrics
 * @returns Array of performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetric[] {
  return [...metrics]
}

/**
 * Clears all recorded performance metrics
 */
export function clearPerformanceMetrics(): void {
  metrics.length = 0
}

/**
 * Gets the average duration of a specific metric
 * @param name The name of the metric
 * @returns The average duration in milliseconds
 */
export function getAverageDuration(name: string): number {
  const filteredMetrics = metrics.filter((metric) => metric.name === name)

  if (filteredMetrics.length === 0) {
    return 0
  }

  const totalDuration = filteredMetrics.reduce((sum, metric) => sum + metric.duration, 0)
  return totalDuration / filteredMetrics.length
}

/**
 * Marks a performance event for the browser's Performance API
 * @param name The name of the mark
 */
export function markPerformance(name: string): void {
  if (typeof performance !== "undefined" && performance.mark) {
    performance.mark(name)
  }
}

/**
 * Measures the time between two performance marks
 * @param name The name of the measure
 * @param startMark The starting mark
 * @param endMark The ending mark
 * @returns The duration in milliseconds
 */
export function measureBetweenMarks(name: string, startMark: string, endMark: string): number | null {
  if (typeof performance !== "undefined" && performance.measure) {
    try {
      performance.measure(name, startMark, endMark)
      const entries = performance.getEntriesByName(name, "measure")

      if (entries.length > 0) {
        return entries[0].duration
      }
    } catch (error) {
      console.error("Error measuring performance:", error)
    }
  }

  return null
}

