export async function getAIResponse(transcript: string): Promise<{ response: string }> {
  console.log("Sending request to AI response API")
  try {
    const response = await fetch("/api/ai-response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transcript }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("API response not ok:", response.status, errorBody)
      throw new Error(`API response not ok: ${response.status} ${errorBody}`)
    }

    const data = await response.json()

    if (!data.response) {
      console.error("Invalid API response:", data)
      throw new Error("Invalid API response: response field missing")
    }

    console.log("Received successful response from AI API")
    return { response: data.response }
  } catch (error) {
    console.error("Error in getAIResponse:", error)
    throw new Error("Failed to get AI response: " + (error instanceof Error ? error.message : String(error)))
  }
}

