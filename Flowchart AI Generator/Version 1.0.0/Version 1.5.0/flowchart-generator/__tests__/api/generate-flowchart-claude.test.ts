import { NextRequest } from "next/server"
import { POST } from "@/app/api/generate-flowchart/route"
import { describe, beforeEach, it, expect, jest, afterEach } from "@jest/globals"

// Mock callClaudeAPI function
jest.mock("@/services/claude-api", () => ({
  callClaudeAPI: jest.fn(),
}))

import { callClaudeAPI } from "@/services/claude-api"

describe("Generate Flowchart API with Claude", () => {
  beforeEach(() => {
    jest.resetAllMocks()
    // Setup environment variables
    process.env.CLAUDE_API_KEY = "test-api-key"
  })

  afterEach(() => {
    delete process.env.CLAUDE_API_KEY
  })

  it("should call Claude API with correct parameters", async () => {
    // Mock successful Claude API response
    ;(callClaudeAPI as jest.Mock).mockResolvedValueOnce({
      content: [
        {
          text: "graph TD\nA[Start] --> B[End]",
        },
      ],
    })

    const request = new NextRequest("http://localhost:3000/api/generate-flowchart", {
      method: "POST",
      body: JSON.stringify({ input: "Test flowchart" }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)

    // Verify Claude API was called with expected parameters
    expect(callClaudeAPI).toHaveBeenCalledWith(
      expect.stringContaining("Generate a Mermaid flowchart code"),
      expect.stringContaining("You are a specialized flowchart generation AI"),
      expect.any(Number),
    )

    const data = await response.json()
    expect(data.mermaidCode).toBeDefined()
  })

  it("should handle invalid input", async () => {
    const request = new NextRequest("http://localhost:3000/api/generate-flowchart", {
      method: "POST",
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data.error).toBe("Please provide a valid description")
  })

  it("should handle Claude API errors gracefully", async () => {
    // Mock Claude API error
    ;(callClaudeAPI as jest.Mock).mockRejectedValueOnce(new Error("Claude API error"))

    const request = new NextRequest("http://localhost:3000/api/generate-flowchart", {
      method: "POST",
      body: JSON.stringify({ input: "Test flowchart" }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200) // Should still return 200 with a fallback

    const data = await response.json()
    expect(data.mermaidCode).toBeDefined() // Should have fallback mermaid code
    expect(data.warning).toContain("Used fallback")
  })
})

