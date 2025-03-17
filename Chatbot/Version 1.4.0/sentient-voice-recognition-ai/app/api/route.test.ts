import { POST } from "./route"
import { NextRequest } from "next/server"
import { describe, it, expect, vi } from "@jest/globals"

vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    })),
  },
}))

describe("API Route", () => {
  it("should return an error for empty input", async () => {
    const formData = new FormData()
    formData.append("input", "")
    formData.append("voiceId", "test-voice-id")

    const request = new NextRequest("http://localhost:3000/api", {
      method: "POST",
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Input is required")
  })

  // Add more tests as needed
})

