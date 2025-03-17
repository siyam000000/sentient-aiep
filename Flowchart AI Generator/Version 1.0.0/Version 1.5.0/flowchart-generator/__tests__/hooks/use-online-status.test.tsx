import { renderHook, act } from "@testing-library/react-hooks"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { describe, beforeEach, it, expect, jest, afterEach } from "@jest/globals"

describe("useOnlineStatus Hook", () => {
  // Save the original navigator.onLine
  const originalOnLine = window.navigator.onLine

  // Mock event listeners
  let onlineListeners: Array<() => void> = []
  let offlineListeners: Array<() => void> = []

  beforeEach(() => {
    onlineListeners = []
    offlineListeners = []

    // Mock addEventListener
    window.addEventListener = jest.fn((event, callback) => {
      if (event === "online") onlineListeners.push(callback as () => void)
      if (event === "offline") offlineListeners.push(callback as () => void)
    })

    // Mock removeEventListener
    window.removeEventListener = jest.fn((event, callback) => {
      if (event === "online") {
        onlineListeners = onlineListeners.filter((listener) => listener !== callback)
      }
      if (event === "offline") {
        offlineListeners = offlineListeners.filter((listener) => listener !== callback)
      }
    })
  })

  afterEach(() => {
    // Restore original navigator.onLine value
    Object.defineProperty(window.navigator, "onLine", {
      writable: true,
      value: originalOnLine,
    })
  })

  it("should return the current online status", () => {
    // Mock navigator.onLine to be true
    Object.defineProperty(window.navigator, "onLine", {
      writable: true,
      value: true,
    })

    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(true)

    // Mock navigator.onLine to be false
    Object.defineProperty(window.navigator, "onLine", {
      writable: true,
      value: false,
    })

    const { result: result2 } = renderHook(() => useOnlineStatus())
    expect(result2.current).toBe(false)
  })

  it("should update when online status changes", () => {
    // Start with online status as true
    Object.defineProperty(window.navigator, "onLine", {
      writable: true,
      value: true,
    })

    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(true)

    // Simulate going offline
    Object.defineProperty(window.navigator, "onLine", {
      writable: true,
      value: false,
    })

    // Trigger offline event
    act(() => {
      offlineListeners.forEach((listener) => listener())
    })

    expect(result.current).toBe(false)

    // Simulate going back online
    Object.defineProperty(window.navigator, "onLine", {
      writable: true,
      value: true,
    })

    // Trigger online event
    act(() => {
      onlineListeners.forEach((listener) => listener())
    })

    expect(result.current).toBe(true)
  })

  it("should remove event listeners on unmount", () => {
    const { unmount } = renderHook(() => useOnlineStatus())

    // Hooks should have set up listeners
    expect(window.addEventListener).toHaveBeenCalledWith("online", expect.any(Function))
    expect(window.addEventListener).toHaveBeenCalledWith("offline", expect.any(Function))

    unmount()

    // Should have removed listeners on unmount
    expect(window.removeEventListener).toHaveBeenCalledWith("online", expect.any(Function))
    expect(window.removeEventListener).toHaveBeenCalledWith("offline", expect.any(Function))
  })
})

