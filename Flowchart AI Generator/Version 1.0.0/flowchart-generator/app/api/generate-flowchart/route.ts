import { NextResponse } from "next/server"

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"
const CLAUDE_API_VERSION = "2023-06-01"

export const runtime = "edge"

function validateMermaidCode(code: string): boolean {
  const lines = code.split("\n")
  if (!lines[0].match(/^(graph|flowchart)\s+(TB|TD|BT|RL|LR)$/)) {
    return false
  }
  return lines.slice(1).every((line) => line.trim() === "" || line.match(/^\s*[A-Za-z0-9_-]+/))
}

async function retryWithExponentialBackoff(fn: () => Promise<Response>, maxRetries = 5): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fn()
      if (response.status !== 529) {
        return response
      }
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error)
    }
    await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000))
  }
  throw new Error(`Failed after ${maxRetries} retries`)
}

function generateSimpleFlowchart(input: string): string {
  const steps = input
    .split(".")
    .filter((step) => step.trim() !== "")
    .map((step) => step.trim())
  let mermaidCode = "graph TD\n"
  steps.forEach((step, index) => {
    const nodeId = `N${index}`
    mermaidCode += `    ${nodeId}[${step}]\n`
    if (index < steps.length - 1) {
      mermaidCode += `    ${nodeId} --> N${index + 1}\n`
    }
  })
  return mermaidCode
}

export async function POST(request: Request) {
  try {
    const claudeApiKey = process.env.CLAUDE_API_KEY
    if (!claudeApiKey) {
      throw new Error("Claude API key is not configured")
    }

    const { input } = await request.json()

    if (!input || typeof input !== "string") {
      return NextResponse.json({ error: "Please provide a valid description" }, { status: 400 })
    }

    try {
      const response = await retryWithExponentialBackoff(() =>
        fetch(CLAUDE_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": claudeApiKey,
            "anthropic-version": CLAUDE_API_VERSION,
          },
          body: JSON.stringify({
            model: "claude-2.1",
            max_tokens: 1000,
            messages: [
              {
                role: "user",
                content: `Generate a Mermaid flowchart code for the following description: ${input}

Please follow these guidelines:
1. Start the flowchart with 'graph TD' for a top-down flowchart.
2. Use proper Mermaid syntax for nodes and connections.
3. Use alphanumeric IDs for nodes (e.g., A, B, C1, D2).
4. Use square brackets for rectangular nodes, e.g., A[Start].
5. Use parentheses for round-edged nodes, e.g., B(Process).
6. Use curly braces for diamond shapes (decisions), e.g., C{Decision}.
7. Use '-->' for connections between nodes.
8. You can use |text| for labels on connections.
9. Enclose your response in triple backticks with 'mermaid' specified.
10. Only include the Mermaid code in your response, no additional explanations.

Example of valid syntax:
\`\`\`mermaid
graph TD
  A[Start] --> B(Process 1)
  B --> C{Decision}
  C -->|Yes| D[Result 1]
  C -->|No| E[Result 2]
  E --> F(End)
\`\`\`
`,
              },
            ],
          }),
        }),
      )

      if (!response.ok) {
        throw new Error(`Claude API request failed with status ${response.status}`)
      }

      const data = await response.json()
      const fullResponse = data.content[0].text.trim()

      const mermaidCodeMatch = fullResponse.match(/```mermaid\n([\s\S]*?)\n```/)
      const mermaidCode = mermaidCodeMatch ? mermaidCodeMatch[1].trim() : null

      if (!mermaidCode || !validateMermaidCode(mermaidCode)) {
        throw new Error("Invalid Mermaid code generated")
      }

      return NextResponse.json({ mermaidCode })
    } catch (error) {
      console.error("Error with Claude API, falling back to simple flowchart generation:", error)
      const simpleMermaidCode = generateSimpleFlowchart(input)
      return NextResponse.json({
        mermaidCode: simpleMermaidCode,
        warning: "Used fallback simple flowchart generation due to API issues.",
      })
    }
  } catch (error: any) {
    console.error("Error in flowchart generation:", error)
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: error.status || 500 },
    )
  }
}

