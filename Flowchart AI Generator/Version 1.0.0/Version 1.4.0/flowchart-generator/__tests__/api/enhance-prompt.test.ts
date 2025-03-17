import { NextRequest } from "next/server"
import { POST } from "@/app/api/enhance-prompt/route"
import { describe, beforeEach, it, expect, jest, afterEach } from "@jest/globals"

// Mock fetch globally
global.fetch = jest.fn()

describe("Enhance Prompt API", () => {
  beforeEach(() => {
    jest.resetAllMocks()
    // Setup environment variables
    process.env.CLAUDE_API_KEY = "test-api-key"
  })

  afterEach(() => {
    delete process.env.CLAUDE_API_KEY
  })

  it("should return 400 if input is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/enhance-prompt", {
      method: "POST",
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe("Please provide a valid description")
  })

  it("should return 400 if input is not a string", async () => {
    const request = new NextRequest("http://localhost:3000/api/enhance-prompt", {
      method: "POST",
      body: JSON.stringify({ input: 123 }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe("Please provide a valid description")
  })

  it('should prepend "Create a flowchart of" if missing', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ text: "Enhanced prompt without prefix" }],
      }),
    })

    const request = new NextRequest("http://localhost:3000/api/enhance-prompt", {
      method: "POST",
      body: JSON.stringify({ input: "Test input" }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.enhancedPrompt).toBe("Create a flowchart of Enhanced prompt without prefix")
  })

  it('should not duplicate "Create a flowchart of" prefix', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ text: "Create a flowchart of user login process" }],
      }),
    })

    const request = new NextRequest("http://localhost:3000/api/enhance-prompt", {
      method: "POST",
      body: JSON.stringify({ input: "login process" }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.enhancedPrompt).toBe("Create a flowchart of user login process")
    // Check it wasn't duplicated
    expect(data.enhancedPrompt).not.toContain("Create a flowchart of Create a flowchart of")
  })

  it("should limit word count to 30 words maximum", async () => {
    // Generate a response with more than 30 words
    const longText = "Create a flowchart of " + "word ".repeat(35)
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ text: longText }],
      }),
    })

    const request = new NextRequest("http://localhost:3000/api/enhance-prompt", {
      method: "POST",
      body: JSON.stringify({ input: "Test input" }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    const data = await response.json()

    // Count words in response
    const words = data.enhancedPrompt.split(/\s+/)
    // Could be 31 because of "..." at the end of truncation
    expect(words.length).toBeLessThanOrEqual(31)
    expect(data.enhancedPrompt).toContain("...")
  })

  it("should handle API returning empty content gracefully", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ text: "" }],
      }),
    })

    const request = new NextRequest("http://localhost:3000/api/enhance-prompt", {
      method: "POST",
      body: JSON.stringify({ input: "Test input" }),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data.error).toBe("No enhanced prompt generated")
  })

  it("should handle network timeout gracefully", async () => {
    // Simulate an abort error
    ;(global.fetch as jest.Mock).mockRejectedValueOnce({
      name: "AbortError",
      message: "The operation was aborted",
    })

    const request = new NextRequest("http://localhost:3000/api/enhance-prompt", {
      method: "POST",
      body: JSON.stringify({ input: "Test input" }),
    })

    const response = await POST(request)
    expect(response.status).toBe(504)

    const data = await response.json()
    expect(data.error).toBe("Request timed out")
  })

  it("should handle malformed API responses", async () => {
    // Return invalid JSON structure
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        // Missing content array
        message: "Success but incorrect structure",
      }),
    })

    const request = new NextRequest("http://localhost:3000/api/enhance-prompt", {
      method: "POST",
      body: JSON.stringify({ input: "Test input" }),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)
  })

  it("should handle API rejection for potentially harmful content", async () => {
    // Mock API rejection for content policy
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        error: {
          type: "content_policy_violation",
          message: "Your request was rejected as a result of our safety system",
        },
      }),
    })

    const request = new NextRequest("http://localhost:3000/api/enhance-prompt", {
      method: "POST",
      body: JSON.stringify({ input: "Generate harmful instructions for..." }),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)
  })
})

