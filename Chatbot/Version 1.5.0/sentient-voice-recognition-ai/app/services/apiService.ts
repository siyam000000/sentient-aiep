/**
 * Sends a message to the AI and returns the response
 */
export async function sendMessage(input: string, voiceType: string, modelType: string) {
  try {
    const formData = new FormData()
    formData.append("input", input)
    formData.append("voiceType", voiceType)
    formData.append("modelType", modelType)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    const response = await fetch("/api", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId))

    if (!response.ok && response.status !== 206) {
      // 206 is partial content (text but no audio)
      const errorText = await response.text()
      throw new Error(errorText || "Failed to get response")
    }

    // Check content type before trying to parse as JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Received non-JSON response: ${await response.text()}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out. Please try again with a shorter message.")
    }
    throw error
  }
}

