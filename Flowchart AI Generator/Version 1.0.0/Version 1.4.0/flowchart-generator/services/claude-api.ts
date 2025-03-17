import { CLAUDE_API_CONFIG } from "@/config/app-config"
import type { ClaudeResponse } from "@/types"

/**
 * Error class for Claude API errors
 */
export class ClaudeAPIError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "ClaudeAPIError"
    this.status = status
  }
}

/**
 * Options for the Claude API call
 */
interface ClaudeAPIOptions {
  maxTokens?: number
  apiKey?: string
  timeoutMs?: number
}

/**
 * Calls the Claude API with the given prompt and system prompt
 *
 * @param prompt - The user prompt to send to Claude
 * @param systemPrompt - The system prompt to guide Claude's behavior
 * @param options - Additional options for the API call
 * @returns Promise with the Claude API response
 * @throws {ClaudeAPIError} If the API call fails
 */
export async function callClaudeAPI(
  prompt: string,
  systemPrompt: string,
  options: ClaudeAPIOptions = {},
): Promise<ClaudeResponse> {
  const {
    maxTokens = CLAUDE_API_CONFIG.DEFAULT_MAX_TOKENS,
    apiKey = process.env.CLAUDE_API_KEY,
    timeoutMs = CLAUDE_API_CONFIG.DEFAULT_TIMEOUT_MS,
  } = options

  if (!apiKey) {
    throw new ClaudeAPIError("Claude API key is not configured")
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(CLAUDE_API_CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": CLAUDE_API_CONFIG.API_VERSION,
      },
      body: JSON.stringify({
        model: CLAUDE_API_CONFIG.MODEL,
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
      throw new ClaudeAPIError(`Claude API request failed: ${response.status} - ${errorText}`, response.status)
    }

    return await response.json()
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new ClaudeAPIError("Request timed out")
    }

    // Re-throw ClaudeAPIError instances
    if (error instanceof ClaudeAPIError) {
      throw error
    }

    // Wrap other errors
    throw new ClaudeAPIError(error.message || "Unknown error calling Claude API")
  }
}

