/**
 * Storage utility for browser localStorage and sessionStorage
 */
export class Storage {
  /**
   * Get an item from localStorage
   *
   * @param key - The key to get
   * @param defaultValue - Default value if key doesn't exist
   * @returns The stored value or defaultValue
   */
  static getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") {
      return defaultValue
    }

    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error)
      return defaultValue
    }
  }

  /**
   * Set an item in localStorage
   *
   * @param key - The key to set
   * @param value - The value to store
   * @returns Whether the operation was successful
   */
  static setItem<T>(key: string, value: T): boolean {
    if (typeof window === "undefined") {
      return false
    }

    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error setting item in localStorage: ${key}`, error)
      return false
    }
  }

  /**
   * Remove an item from localStorage
   *
   * @param key - The key to remove
   * @returns Whether the operation was successful
   */
  static removeItem(key: string): boolean {
    if (typeof window === "undefined") {
      return false
    }

    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing item from localStorage: ${key}`, error)
      return false
    }
  }

  /**
   * Clear all items from localStorage
   *
   * @returns Whether the operation was successful
   */
  static clear(): boolean {
    if (typeof window === "undefined") {
      return false
    }

    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error("Error clearing localStorage", error)
      return false
    }
  }

  /**
   * Get an item from sessionStorage
   *
   * @param key - The key to get
   * @param defaultValue - Default value if key doesn't exist
   * @returns The stored value or defaultValue
   */
  static getSessionItem<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") {
      return defaultValue
    }

    try {
      const item = sessionStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error getting item from sessionStorage: ${key}`, error)
      return defaultValue
    }
  }

  /**
   * Set an item in sessionStorage
   *
   * @param key - The key to set
   * @param value - The value to store
   * @returns Whether the operation was successful
   */
  static setSessionItem<T>(key: string, value: T): boolean {
    if (typeof window === "undefined") {
      return false
    }

    try {
      sessionStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error setting item in sessionStorage: ${key}`, error)
      return false
    }
  }

  /**
   * Remove an item from sessionStorage
   *
   * @param key - The key to remove
   * @returns Whether the operation was successful
   */
  static removeSessionItem(key: string): boolean {
    if (typeof window === "undefined") {
      return false
    }

    try {
      sessionStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing item from sessionStorage: ${key}`, error)
      return false
    }
  }

  /**
   * Clear all items from sessionStorage
   *
   * @returns Whether the operation was successful
   */
  static clearSession(): boolean {
    if (typeof window === "undefined") {
      return false
    }

    try {
      sessionStorage.clear()
      return true
    } catch (error) {
      console.error("Error clearing sessionStorage", error)
      return false
    }
  }
}

