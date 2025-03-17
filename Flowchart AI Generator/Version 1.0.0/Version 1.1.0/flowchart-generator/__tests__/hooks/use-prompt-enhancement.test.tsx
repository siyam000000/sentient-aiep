import { renderHook, act } from "@testing-library/react-hooks"
import { usePromptEnhancement } from "@/hooks/use-prompt-enhancement"
import { describe, beforeEach, it, expect, jest } from "@jest/globals"

// Mock fetch
global.fetch = jest.fn()

describe("usePromptEnhancement Hook", () => {
  beforeEach(() => {
    jest.resetAllMocks()
    // Reset console to prevent pollution in test output
    jest.spyOn(console, "error").mockImplementation(() => {})
  })

  it("should initialize with default values", () => {
    const { result } = renderHook(() => usePromptEnhancement("en"))

    expect(result.current.enhancedInput).toBeNull()
    expect(result.current.isEnhancing).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("should show error for empty input on enhance", async () => {
    const { result } = renderHook(() => usePromptEnhancement("en"))

    await act(async () => {
      await result.current.enhancePrompt("")
    })

    expect(result.current.error).toBe("Please enter a description to enhance")
    expect(result.current.isEnhancing).toBe(false)
  })

  it("should handle successful prompt enhancement", async () => {
    const enhancedPrompt = "Create a flowchart of user authentication process"
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ enhancedPrompt }),
    })

    const { result } = renderHook(() => usePromptEnhancement("en"))

    let returnedPrompt
    await act(async () => {
      returnedPrompt = await result.current.enhancePrompt("User login")
    })

    expect(result.current.enhancedInput).toBe(enhancedPrompt)
    expect(returnedPrompt).toBe(enhancedPrompt)
    expect(result.current.isEnhancing).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("should handle API error during enhancement", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Server error" }),
    })

    const { result } = renderHook(() => usePromptEnhancement("en"))

    await act(async () => {
      await result.current.enhancePrompt("Test prompt")
    })

    expect(result.current.error).toBe("Server error")
    expect(result.current.isEnhancing).toBe(false)
    expect(result.current.enhancedInput).toBeNull()
  })

  it("should handle network failure", async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network failure"))

    const { result } = renderHook(() => usePromptEnhancement("en"))

    await act(async () => {
      await result.current.enhancePrompt("Test prompt")
    })

    expect(result.current.error).toBe("Network failure")
    expect(result.current.isEnhancing).toBe(false)
  })

  it("should clear enhanced input", () => {
    const { result } = renderHook(() => usePromptEnhancement("en"))

    // Set enhanced input first
    act(() => {
      result.current.setError(null)
      // Directly modify state for testing
      Object.defineProperty(result.current, "enhancedInput", {
        value: "Enhanced prompt",
        writable: true,
      })
    })

    // Clear it
    act(() => {
      result.current.clearEnhancedInput()
    })

    expect(result.current.enhancedInput).toBeNull()
  })

  it("should use localized error messages based on language", async () => {
    const { result } = renderHook(() => usePromptEnhancement("bg"))

    await act(async () => {
      await result.current.enhancePrompt("")
    })

    // Bulgarian error message
    expect(result.current.error).toBe("Моля, въведете описание за подобряване")
  })

  it("should set error manually", () => {
    const { result } = renderHook(() => usePromptEnhancement("en"))

    act(() => {
      result.current.setError("Custom error")
    })

    expect(result.current.error).toBe("Custom error")
  })

  it("should handle malformed API responses", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Missing enhancedPrompt field" }),
    })

    const { result } = renderHook(() => usePromptEnhancement("en"))

    await act(async () => {
      await result.current.enhancePrompt("Test prompt")
    })

    expect(result.current.error).toContain("unexpected error")
    expect(result.current.isEnhancing).toBe(false)
  })
})

