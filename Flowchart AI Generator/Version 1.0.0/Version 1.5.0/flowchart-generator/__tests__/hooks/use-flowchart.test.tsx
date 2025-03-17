import { renderHook, act } from "@testing-library/react-hooks"
import { useFlowchart } from "@/hooks/use-flowchart"
import { describe, beforeEach, it, expect, jest } from "@jest/globals"

// Mock fetch
global.fetch = jest.fn()

describe("useFlowchart Hook", () => {
  beforeEach(() => {
    jest.resetAllMocks()
    // Reset console to prevent pollution in test output
    jest.spyOn(console, "error").mockImplementation(() => {})
  })

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useFlowchart("en"))

    expect(result.current.input).toBe("")
    expect(result.current.mermaidCode).toBe("")
    expect(result.current.error).toBeNull()
    expect(result.current.warning).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.renderError).toBeNull()
  })

  it("should update input value", () => {
    const { result } = renderHook(() => useFlowchart("en"))

    act(() => {
      result.current.setInput("New input value")
    })

    expect(result.current.input).toBe("New input value")
  })

  it("should show error for empty input on generate", async () => {
    const { result } = renderHook(() => useFlowchart("en"))

    await act(async () => {
      await result.current.generateFlowchart()
    })

    expect(result.current.error).toBe("Please enter a description for your flowchart")
    expect(result.current.isLoading).toBe(false)
  })

  it("should handle successful flowchart generation", async () => {
    const mockResponse = {
      mermaidCode: "graph TD\nA[Start] --> B[End]",
    }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useFlowchart("en"))

    act(() => {
      result.current.setInput("Test flowchart")
    })

    await act(async () => {
      await result.current.generateFlowchart()
    })

    expect(result.current.mermaidCode).toBe(mockResponse.mermaidCode)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("should handle API error during generation", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Server error" }),
    })

    const { result } = renderHook(() => useFlowchart("en"))

    act(() => {
      result.current.setInput("Test flowchart")
    })

    await act(async () => {
      await result.current.generateFlowchart()
    })

    expect(result.current.error).toBe("Server error")
    expect(result.current.isLoading).toBe(false)
  })

  it("should handle network failure", async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network failure"))

    const { result } = renderHook(() => useFlowchart("en"))

    act(() => {
      result.current.setInput("Test flowchart")
    })

    await act(async () => {
      await result.current.generateFlowchart()
    })

    expect(result.current.error).toBe("Network failure")
    expect(result.current.isLoading).toBe(false)
  })

  it("should set render error", () => {
    const { result } = renderHook(() => useFlowchart("en"))

    act(() => {
      result.current.setRenderError("Failed to render chart")
    })

    expect(result.current.renderError).toBe("Failed to render chart")
  })

  it("should reset state correctly", () => {
    const { result } = renderHook(() => useFlowchart("en"))

    // Set some values first
    act(() => {
      result.current.setInput("Test input")
      result.current.setRenderError("Test error")
    })

    // Verify they were set
    expect(result.current.input).toBe("Test input")
    expect(result.current.renderError).toBe("Test error")

    // Now reset
    act(() => {
      result.current.resetState()
    })

    // Verify reset worked
    expect(result.current.input).toBe("")
    expect(result.current.mermaidCode).toBe("")
    expect(result.current.error).toBeNull()
    expect(result.current.warning).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.renderError).toBeNull()
  })

  it("should handle warnings from API", async () => {
    const mockResponse = {
      mermaidCode: "graph TD\nA[Start] --> B[End]",
      warning: "Used fallback simple flowchart generation",
    }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useFlowchart("en"))

    act(() => {
      result.current.setInput("Test flowchart")
    })

    await act(async () => {
      await result.current.generateFlowchart()
    })

    expect(result.current.warning).toBe(mockResponse.warning)
  })

  it("should use localized error messages based on language", async () => {
    const { result } = renderHook(() => useFlowchart("bg"))

    await act(async () => {
      await result.current.generateFlowchart()
    })

    // Bulgarian error message
    expect(result.current.error).toBe("Моля, въведете описание за вашата диаграма")
  })
})

