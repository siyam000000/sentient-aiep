import { callClaudeAPI } from "@/services/claude-api"
import { describe, beforeEach, it, expect, jest, afterEach } from "@jest/globals"

// Mock fetch globally
global.fetch = jest.fn()

describe("Claude API Service", () => {
  beforeEach(() => {
    jest.resetAllMocks()
    // Reset setTimeout and clearTimeout
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("should throw error if API key is not provided", async () => {
    await expect(callClaudeAPI("prompt", "system", 100, undefined)).rejects.toThrow("Claude API key is not configured")
  })

  it("should successfully call Claude API and return response", async () => {
    const mockResponse = {
      content: [{ text: "API response text" }],
    }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const result = await callClaudeAPI("Test prompt", "System instruction", 100, "test-api-key")

    expect(result).toEqual(mockResponse)

    // Verify the request was properly formed
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
    const [url, options] = fetchCall

    expect(url).toBe("https://api.anthropic.com/v1/messages")
    expect(options.method).toBe("POST")
    expect(options.headers["anthropic-version"]).toBe("2023-06-01")
    expect(options.headers["x-api-key"]).toBe("test-api-key")

    // Check request body
    const requestBody = JSON.parse(options.body)
    expect(requestBody.model).toBe("claude-2.1")
    expect(requestBody.max_tokens).toBe(100)
    expect(requestBody.system).toBe("System instruction")
    expect(requestBody.messages[0].role).toBe("user")
    expect(requestBody.messages[0].content).toBe("Test prompt")
  })

  it("should throw error if API returns non-OK response", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => "Bad Request",
    })

    await expect(callClaudeAPI("Test prompt", "System instruction", 100, "test-api-key")).rejects.toThrow(
      "Claude API request failed: 400 - Bad Request",
    )
  })

  it("should handle request timeout correctly", async () => {
    // Simulate a request that never resolves
    ;(global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {}))

    // Start the API call
    const apiPromise = callClaudeAPI(
      "Test prompt",
      "System instruction",
      100,
      "test-api-key",
      100, // 100ms timeout
    )

    // Fast-forward timers to trigger the timeout
    jest.advanceTimersByTime(110)

    // Verify the promise rejects with timeout error
    await expect(apiPromise).rejects.toThrow("Request timed out")
  })

  it("should pass through other errors", async () => {
    const networkError = new Error("Network failure")
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(networkError)

    await expect(callClaudeAPI("Test prompt", "System instruction", 100, "test-api-key")).rejects.toThrow(
      "Network failure",
    )
  })

  it("should handle API returning invalid JSON", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new SyntaxError("Unexpected token in JSON")
      },
    })

    await expect(callClaudeAPI("Test prompt", "System instruction", 100, "test-api-key")).rejects.toThrow(
      "Unexpected token in JSON",
    )
  })

  it("should support custom max tokens parameter", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [{ text: "Short response" }] }),
    })

    await callClaudeAPI(
      "Test prompt",
      "System instruction",
      200, // Custom max_tokens value
      "test-api-key",
    )

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
    const requestBody = JSON.parse(fetchCall[1].body)
    expect(requestBody.max_tokens).toBe(200)
  })
})

