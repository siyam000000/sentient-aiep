import { NextRequest } from "next/server"
import { POST } from "@/app/api/generate-flowchart/route"
import { describe, beforeEach, it, expect, jest, afterEach } from "@jest/globals"

// Mock fetch globally
global.fetch = jest.fn()

describe("Generate Flowchart API", () => {
  beforeEach(() => {
    jest.resetAllMocks()
    // Setup environment variables
    process.env.CLAUDE_API_KEY = "test-api-key"
  })

  afterEach(() => {
    delete process.env.CLAUDE_API_KEY
  })

  it("should return 400 if input is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/generate-flowchart", {
      method: "POST",
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe("Please provide a valid description")
  })

  it("should return 400 if input is not a string", async () => {
    const request = new NextRequest("http://localhost:3000/api/generate-flowchart", {
      method: "POST",
      body: JSON.stringify({ input: 123 }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe("Please provide a valid description")
  })

  it("should handle missing Claude API key gracefully", async () => {
    delete process.env.CLAUDE_API_KEY

    const request = new NextRequest("http://localhost:3000/api/generate-flowchart", {
      method: "POST",
      body: JSON.stringify({ input: "Test flowchart" }),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)

    const data = await response.json()
    expect(data.error).toBe("Claude API key is not configured")
  })

  it("should handle Claude API errors and fall back to simple flowchart", async () => {
    // Mock Claude API failure
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Service Unavailable",
    })

    const request = new NextRequest("http://localhost:3000/api/generate-flowchart", {
      method: "POST",
      body: JSON.stringify({ input: "This is a test flowchart with some steps. First do this. Then do that." }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.mermaidCode).toBeDefined()
    expect(data.warning).toContain("Used fallback")
  })

  it("should handle rate limiting and retry", async () => {
    // Mock rate limit response followed by success
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        status: 529,
        ok: false,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [
            {
              text: "```mermaid\ngraph TD\nA[Start] --> B[End]\n```",
            },
          ],
        }),
      })

    const request = new NextRequest("http://localhost:3000/api/generate-flowchart", {
      method: "POST",
      body: JSON.stringify({ input: "Test flowchart" }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    // Verify fetch was called twice (initial + retry)
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it("should validate and reject invalid mermaid code from Claude", async () => {
    // Mock successful API response but with invalid mermaid
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [
          {
            text: "```mermaid\ninvalid syntax\n```",
          },
        ],
      }),
    })

    const request = new NextRequest("http://localhost:3000/api/generate-flowchart", {
      method: "POST",
      body: JSON.stringify({ input: "Test flowchart" }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    const data = await response.json()
    // Should fall back to simple flowchart generation
    expect(data.mermaidCode).toBeDefined()
    expect(data.warning).toContain("Used fallback")
  })

  it("should handle extremely long inputs by truncating them", async () => {
    // Create a very long input (10,000 characters)
    const longInput = "a".repeat(10000)

    // Mock successful API response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [
          {
            text: "```mermaid\ngraph TD\nA[Start] --> B[End]\n```",
          },
        ],
      }),
    })

    const request = new NextRequest("http://localhost:3000/api/generate-flowchart", {
      method: "POST",
      body: JSON.stringify({ input: longInput }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    // Verify the request to Claude was made with a reasonable length
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
    const requestBody = JSON.parse(fetchCall[1].body)
    // The message should be truncated
    expect(requestBody.messages[0].content.length).toBeLessThan(10000)
  })

  it("should generate a simple flowchart for basic sentence input", async () => {
    const input = "First do this. Then do that. Finally finish."

    const request = new NextRequest("http://localhost:3000/api/generate-flowchart", {
      method: "POST",
      body: JSON.stringify({ input }),
    })

    // Mock successful API response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [
          {
            text: "```mermaid\ngraph TD\nA[First do this] --> B[Then do that]\nB --> C[Finally finish]\n```",
          },
        ],
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data.mermaidCode).toContain("graph TD")
    expect(data.mermaidCode).toContain("First do this")
  })
})

