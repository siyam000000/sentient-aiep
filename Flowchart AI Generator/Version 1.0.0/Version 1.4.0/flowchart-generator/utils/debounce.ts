/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked.
 *
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait = 300): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function (this: any, ...args: Parameters<T>): void {
    

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      timeout = null
      func.apply(this, args)
    }, wait)
  }
}

/**
 * Creates a throttled function that only invokes the provided function at most once
 * per every specified wait period.
 *
 * @param func - The function to throttle
 * @param wait - The number of milliseconds to wait between invocations
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(func: T, wait = 300): (...args: Parameters<T>) => void {
  let lastCall = 0

  return function (this: any, ...args: Parameters<T>): void {
    const now = Date.now()
    

    if (now - lastCall >= wait) {
      lastCall = now
      func.apply(this, args)
    }
  }
}

