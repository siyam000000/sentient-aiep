export async function getAIResponse(input: string): Promise<{ response: string }> {
  try {
    const response = await fetch("/api/ai-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    })

    if (!response.ok) {
      throw new Error(`API response not ok: ${response.status}`)
    }

    const data = await response.json()

    if (!data.response) {
      throw new Error("Invalid API response: response field missing")
    }

    return { response: data.response }
  } catch (error) {
    console.error("Error in getAIResponse:", error)
    throw error
  }
}

