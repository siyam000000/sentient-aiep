import type { Message } from "@/types"

/**
 * Sends a message to the AI assistant and returns the response
 */
export async function sendMessageToAI(
  messages: Message[],
  currentFile?: { name: string; language: string; content: string },
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    // Add context about the current file if available
    const contextMessage = currentFile
      ? {
          role: "system" as const,
          content: `I'm currently working on a ${currentFile.language} file named ${currentFile.name}. Here's the current content:

\`\`\`${currentFile.language}
${currentFile.content}
\`\`\``,
        }
      : null

    const messagesWithContext = contextMessage ? [...messages, contextMessage] : [...messages]

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messagesWithContext }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`HTTP error! status: ${response.status}${errorData.error ? ` - ${errorData.error}` : ""}`)
    }

    const data = await response.json()
    if (!data.content) {
      throw new Error("Received empty response from AI")
    }

    return { success: true, content: data.content }
  } catch (err) {
    console.error("Error submitting message:", err)
    let errorMessage = "An unknown error occurred"
    if (err instanceof Error) {
      errorMessage = err.message
    }
    return { success: false, error: `Failed to get response from AI. Error: ${errorMessage}` }
  }
}

/**
 * Extracts code blocks from AI response
 */
export function extractCodeBlock(content: string): string | null {
  const codeBlockRegex = /```(?:\w+)?
([\s\S]+?)
```/
  const match = content.match(codeBlockRegex)
  return match ? match[1] : null
}

/**
 * Generates a unique ID for messages
 */
export function generateMessageId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

