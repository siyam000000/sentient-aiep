const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"
const CLAUDE_API_VERSION = "2023-06-01"

export interface ClaudeResponse {
  content: Array<{ text: string }>
}

export async function callClaudeAPI(
  prompt: string,
  systemPrompt: string,
  maxTokens = 150,
  apiKey: string | undefined = process.env.CLAUDE_API_KEY,
  timeoutMs = 15000,
): Promise<ClaudeResponse> {
  if (!apiKey) {
    throw new Error("Claude API key is not configured")
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": CLAUDE_API_VERSION,
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: maxTokens,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        system: systemPrompt,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      throw new Error(`Claude API request failed: ${response.status} - ${errorText}`)
    }

    return await response.json()
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out")
    }
    throw error
  }
}

