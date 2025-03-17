import { NextResponse } from "next/server"
import { optimizeFlowchartLayout, detectOptimalOrientation } from "@/utils/mermaid-optimization"
import { callClaudeAPI } from "@/services/claude-api"
import { validateAndCorrectMermaidCode, quickValidateMermaidSyntax } from "@/services/flowchart-validator"
import { cleanMermaidCode } from "@/utils/mermaid-helpers"

export const runtime = "edge"

/**
 * Retries a function with exponential backoff
 *
 * @param fn - The function to retry
 * @param maxRetries - Maximum number of retries
 * @returns Promise with the function result
 */
async function retryWithExponentialBackoff<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      // Only retry if it's a rate limit error or timeout
      if (error.message && (error.message.includes("rate") || error.message.includes("timeout"))) {
        console.log(`Attempt ${i + 1} failed, retrying in ${Math.pow(2, i) * 1000}ms`)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000))
        continue
      }
      throw error
    }
  }
  throw new Error(`Failed after ${maxRetries} retries`)
}

/**
 * Generates a simple flowchart from text input
 *
 * @param input - The text input to generate a flowchart from
 * @param orientation - The orientation of the flowchart
 * @returns Mermaid code for a simple flowchart
 */
function generateSimpleFlowchart(input: string, orientation = "TD"): string {
  const steps = input
    .split(".")
    .filter((step) => step.trim() !== "")
    .map((step) => step.trim())

  if (steps.length === 0) {
    return `graph ${orientation}\nA[Start] --> B[End]`
  }

  let mermaidCode = `graph ${orientation}\n`
  steps.forEach((step, index) => {
    const nodeId = `N${index}`
    // Limit step text length to prevent oversized nodes
    const limitedStep = step.length > 50 ? step.substring(0, 47) + "..." : step
    mermaidCode += `    ${nodeId}["${limitedStep}"]\n`
    if (index < steps.length - 1) {
      mermaidCode += `    ${nodeId} --> N${index + 1}\n`
    }
  })

  return mermaidCode
}

/**
 * POST handler for generating flowcharts
 */
export async function POST(request: Request) {
  try {
    const { input, regenerationAttempt = 0, simplify = false } = await request.json()

    if (!input || typeof input !== "string") {
      return NextResponse.json({ error: "Please provide a valid description" }, { status: 400 })
    }

    // Limit input length to prevent extremely large prompts
    const limitedInput = input.length > 2000 ? input.substring(0, 2000) + "..." : input

    // Detect optimal orientation based on input
    const recommendedOrientation = detectOptimalOrientation(limitedInput)

    // If this is a regeneration attempt or simplify is requested, create a simpler flowchart
    if (regenerationAttempt > 0 || simplify) {
      console.log(`Regeneration attempt ${regenerationAttempt} or simplify requested. Creating simpler flowchart.`)
      const simpleMermaidCode = generateSimpleFlowchart(limitedInput, recommendedOrientation)
      return NextResponse.json({
        mermaidCode: simpleMermaidCode,
        warning: "Created a simplified flowchart due to previous rendering issues.",
      })
    }

    try {
      const userPrompt = `Generate a Mermaid flowchart code for the following description: ${limitedInput}

Please follow these guidelines:
1. Start the flowchart with 'graph ${recommendedOrientation}' for a ${recommendedOrientation === "TD" ? "top-down" : "left-to-right"} flowchart.
2. Use proper Mermaid syntax for nodes and connections.
3. Use descriptive IDs for nodes that relate to their content (e.g., login, process, decision).
4. Use square brackets for rectangular nodes, e.g., login["Login"].
5. Use parentheses for round-edged nodes, e.g., process("Process").
6. Use curly braces for diamond shapes (decisions), e.g., decision{"Decision"}.
7. Use '-->' for connections between nodes.
8. You can use |text| for labels on connections.
9. For complex flowcharts with many nodes, consider using subgraphs to organize related nodes.
10. ONLY output the Mermaid code, without backticks or any explanations.
11. Ensure proper indentation for readability.
12. DO NOT include the mermaid keyword or any markdown.
13. IMPORTANT: Keep the flowchart concise and focused. Limit to no more than 10-15 nodes for better readability.
14. Avoid creating overly complex diagrams with too many connections or nested structures.
15. NEVER use reserved keywords like 'end', 'subgraph', 'graph', 'flowchart', 'class', 'click', or 'style' as node IDs.`

      const systemPrompt = `You are a specialized flowchart generation AI that outputs only valid Mermaid syntax. 
You will be asked to create flowcharts based on descriptions. 
Always output ONLY the Mermaid code without any markdown formatting, explanations, or extra text.
Never include \`\`\`mermaid or any other backticks in your response.
Focus on clarity and logical flow in the diagrams you create.
Use appropriate node shapes: rectangular ([]), round-edged (()), and diamond ({}) for different elements.
For complex flows, use subgraphs to organize related steps.
Ensure all node connections are logical and flow naturally.
IMPORTANT: Keep diagrams concise and focused. Limit to 10-15 nodes maximum for better readability.
Avoid creating overly complex diagrams with too many connections or nested structures.
NEVER use reserved keywords like 'end', 'subgraph', 'graph', 'flowchart', 'class', 'click', or 'style' as node IDs.`

      const response = await retryWithExponentialBackoff(async () => {
        return await callClaudeAPI(userPrompt, systemPrompt, { maxTokens: 1000 })
      })

      // Extract the mermaid code - Claude should return just the code, but let's clean it up just in case
      let mermaidCode = response.content[0].text.trim()

      // Remove any markdown code block markers if present
      mermaidCode = cleanMermaidCode(mermaidCode)

      // Perform quick local validation
      if (!quickValidateMermaidSyntax(mermaidCode)) {
        console.log("Quick validation failed, attempting to fix with Claude")

        // Try to fix the code with Claude
        const validationResult = await validateAndCorrectMermaidCode(mermaidCode)

        if (validationResult.wasFixed) {
          mermaidCode = validationResult.correctedCode
          console.log("Mermaid code was fixed by validator")
        } else if (validationResult.error) {
          // If validation failed and couldn't fix it, fall back to simple generation
          console.error("Validation error:", validationResult.error)
          throw new Error("Invalid Mermaid code generated")
        }
      }

      // Optimize the flowchart layout for better display
      const optimizedCode = optimizeFlowchartLayout(mermaidCode)

      return NextResponse.json({
        mermaidCode: optimizedCode,
        wasFixed: mermaidCode !== optimizedCode,
      })
    } catch (error) {
      console.error("Error with Claude API, falling back to simple flowchart generation:", error)
      const simpleMermaidCode = generateSimpleFlowchart(limitedInput, recommendedOrientation)
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

