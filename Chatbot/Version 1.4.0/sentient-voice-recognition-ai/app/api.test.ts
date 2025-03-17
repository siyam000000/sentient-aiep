import { getAIResponse } from "./api"
import { describe, expect, it, jest } from "@jest/globals"

// Mock the global fetch function
global.fetch = jest.fn()

describe("getAIResponse", () => {
  it("should return the AI response when the API call is successful", async () => {
    const mockResponse = { response: "This is a test response" }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const result = await getAIResponse("Test input")
    expect(result).toEqual(mockResponse)
  })

  it("should throw an error when the API call fails", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    await expect(getAIResponse("Test input")).rejects.toThrow("API response not ok: 500")
  })
})

