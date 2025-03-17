import { callClaudeAPI } from "./claude-api"

/**
 * Validates and corrects Mermaid flowchart code using Claude
 * @param mermaidCode The original Mermaid code to validate
 * @returns Corrected Mermaid code or the original if no issues found
 */
export async function validateAndCorrectMermaidCode(mermaidCode: string): Promise<{
  correctedCode: string
  wasFixed: boolean
  error?: string
}> {
  try {
    // Basic syntax check first
    const trimmedCode = mermaidCode.trim()
    // Check if the code starts with graph or flowchart after removing all whitespace and backticks
    if (!trimmedCode.match(/^(?:```(?:mermaid)?\s*)?(?:graph\s+(?:TB|TD|BT|RL|LR)|flowchart\s+(?:TB|TD|BT|RL|LR))/i)) {
      // If it doesn't match but contains "graph" or "flowchart" somewhere, try to fix it
      if (trimmedCode.includes("graph") || trimmedCode.includes("flowchart")) {
        // Extract what looks like a graph declaration
        const match = trimmedCode.match(/(graph\s+(?:TB|TD|BT|RL|LR)|flowchart\s+(?:TB|TD|BT|RL|LR))/i)
        if (match) {
          // Reconstruct the code with the proper declaration at the start
          const declaration = match[0]
          const restOfCode = trimmedCode.replace(declaration, "").trim()
          const correctedCode = `${declaration}\n${restOfCode}`
          return {
            correctedCode,
            wasFixed: true,
            error: "Fixed graph declaration positioning",
          }
        }
      }

      return {
        correctedCode: mermaidCode,
        wasFixed: false,
        error:
          "Invalid Mermaid code: Must start with 'graph' or 'flowchart' followed by a valid direction (TB, TD, BT, RL, LR)",
      }
    }

    // Use Claude to validate and correct the code
    const userPrompt = `
I need you to validate and correct this Mermaid flowchart code:

\`\`\`
${mermaidCode}
\`\`\`

Please analyze this code for any syntax errors or issues that would prevent it from rendering properly.
If you find any issues, correct them and return ONLY the fixed Mermaid code.
If the code is already valid, just return the original code.

Common issues to check for:
1. Missing or incorrect graph declaration (should start with "graph TD" or similar)
2. Invalid node IDs (should be alphanumeric)
3. Unclosed quotes in node labels
4. Missing arrows between connected nodes
5. Incorrect syntax for node shapes ([], (), {}, etc.)
6. Unclosed subgraphs
7. Ensure all nodes referenced in connections are defined

Return ONLY the corrected Mermaid code without any explanations or markdown formatting.
`

    const systemPrompt = `
You are a specialized Mermaid syntax validator and corrector. Your task is to analyze Mermaid flowchart code, identify any syntax errors or issues, and provide corrected code.
Only output the corrected Mermaid code without any explanations, comments, or markdown formatting.
If the code is already valid, return it unchanged.
Focus on making minimal changes to fix the code while preserving the original intent and structure.
`

    const response = await callClaudeAPI(userPrompt, systemPrompt, 1000)
    const correctedCode = response.content[0].text.trim()

    // Check if Claude made any changes
    const wasFixed = correctedCode !== mermaidCode

    return {
      correctedCode,
      wasFixed,
      error: wasFixed ? "Original code had syntax issues that were fixed" : undefined,
    }
  } catch (error) {
    console.error("Error validating Mermaid code:", error)
    return {
      correctedCode: mermaidCode, // Return original if validation fails
      wasFixed: false,
      error: error instanceof Error ? error.message : "Unknown error validating Mermaid code",
    }
  }
}

/**
 * Performs a quick local validation of Mermaid syntax
 * @param code Mermaid code to validate
 * @returns Boolean indicating if the code passes basic validation
 */
export function quickValidateMermaidSyntax(code: string): boolean {
  if (!code || typeof code !== "string") {
    return false
  }

  // Remove any markdown code block markers and trim whitespace
  const cleanedCode = code
    .replace(/```mermaid\n?/g, "")
    .replace(/```\n?/g, "")
    .trim()

  // Check for valid graph declaration with more flexible regex
  const firstLine = cleanedCode.split("\n")[0].trim()
  if (!firstLine.match(/^(graph|flowchart)\s+(TB|TD|BT|RL|LR)$/i)) {
    return false
  }

  // Check for balanced brackets and quotes
  const brackets = { "[": 0, "(": 0, "{": 0, '"': 0, "'": 0 }
  const closingBrackets = { "]": "[", ")": "(", "}": "{", '"': '"', "'": "'" }

  for (const char of cleanedCode) {
    if (char in brackets) {
      brackets[char]++
    } else if (char in closingBrackets) {
      const openingBracket = closingBrackets[char]
      brackets[openingBracket]--
      if (brackets[openingBracket] < 0) {
        return false // Unbalanced brackets
      }
    }
  }

  // Check if all brackets are balanced
  return Object.values(brackets).every((count) => count === 0)
}

