/**
 * Mermaid Service
 *
 * Provides centralized functionality for handling Mermaid flowchart operations,
 * including code generation, validation, fixing, and error handling.
 */

import {
  cleanMermaidCode,
  fixMermaidSyntaxIssues,
  detectAndFixSpecialFlowcharts,
  removeRepeatedGraphDeclarations,
} from "@/utils/mermaid-helpers"
import { validateAndCorrectMermaidCode } from "@/services/flowchart-validator"
import { ErrorLogger } from "@/utils/logging"

// Constants
const MAX_FIX_ATTEMPTS = 3

/**
 * Result of a Mermaid code fixing operation
 */
export interface MermaidFixResult {
  code: string
  wasFixed: boolean
  error?: string
  fixMethod?: string
}

/**
 * Options for fixing Mermaid code
 */
export interface MermaidFixOptions {
  sessionId?: string
  maxAttempts?: number
  useAI?: boolean
}

/**
 * Attempts to fix Mermaid code using multiple strategies
 * @param code The Mermaid code to fix
 * @param options Options for the fixing process
 * @returns Promise with the fix result
 */
export async function fixMermaidCode(code: string, options: MermaidFixOptions = {}): Promise<MermaidFixResult> {
  const sessionId = options.sessionId || "default"
  const maxAttempts = options.maxAttempts || MAX_FIX_ATTEMPTS
  const useAI = options.useAI !== undefined ? options.useAI : true

  // Log the fix attempt
  ErrorLogger.addLog(sessionId, `Starting fix attempt for code (${code.length} chars)`)

  // Check for repeated graph declarations first (severe malformation)
  const graphNodePattern = /graph_node\s+TD|TD\s+graph_node/g
  const matches = code.match(graphNodePattern) || []

  if (matches.length > 0) {
    ErrorLogger.addLog(sessionId, `Detected ${matches.length} instances of malformed graph_node declarations`)
    const fixedCode = removeRepeatedGraphDeclarations(code)

    if (fixedCode !== code) {
      return {
        code: fixedCode,
        wasFixed: true,
        fixMethod: "repeated-declarations-fix",
      }
    }
  }

  // Check for other repeated graph declarations
  const graphNodeCount = (code.match(/graph_node TD/g) || []).length
  const hNodeCount = (code.match(/h_node TD/g) || []).length

  if (graphNodeCount > 0 || hNodeCount > 0) {
    ErrorLogger.addLog(sessionId, `Detected malformed code with repeated declarations`)
    const fixedCode = removeRepeatedGraphDeclarations(code)

    if (fixedCode !== code) {
      return {
        code: fixedCode,
        wasFixed: true,
        fixMethod: "repeated-declarations-fix",
      }
    }
  }

  // Try local fixes first
  try {
    // Check for special flowcharts that need specific handling
    const specialFixedCode = detectAndFixSpecialFlowcharts(code)
    if (specialFixedCode !== code) {
      ErrorLogger.addLog(sessionId, "Applied special flowchart fix")
      return {
        code: specialFixedCode,
        wasFixed: true,
        fixMethod: "special-flowchart",
      }
    }

    // Apply standard syntax fixes
    const fixedCode = fixMermaidSyntaxIssues(cleanMermaidCode(code))
    if (fixedCode !== code) {
      ErrorLogger.addLog(sessionId, "Applied standard syntax fixes")
      return {
        code: fixedCode,
        wasFixed: true,
        fixMethod: "syntax-fixes",
      }
    }
  } catch (error) {
    ErrorLogger.addLog(sessionId, `Error in local fix: ${error instanceof Error ? error.message : String(error)}`)
  }

  // If local fixes didn't work or didn't change the code, try the AI validator
  if (useAI) {
    try {
      ErrorLogger.addLog(sessionId, "Attempting AI-based validation and correction")
      const validationResult = await validateAndCorrectMermaidCode(code)

      if (validationResult.wasFixed) {
        ErrorLogger.addLog(sessionId, "AI validation successfully fixed the code")
        return {
          code: validationResult.correctedCode,
          wasFixed: true,
          fixMethod: "ai-validation",
        }
      }
    } catch (error) {
      ErrorLogger.addLog(sessionId, `Error in AI validation: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // If all else fails, create a simple fallback flowchart
  ErrorLogger.addLog(sessionId, "All fix attempts failed, using fallback flowchart")
  return {
    code: "graph TD\nA[Start] --> B[End]",
    wasFixed: true,
    error: "Could not fix the original code, created a simple fallback",
    fixMethod: "fallback",
  }
}

/**
 * Validates Mermaid code syntax
 * @param code The Mermaid code to validate
 * @returns Boolean indicating if the code is valid
 */
export function validateMermaidSyntax(code: string): boolean {
  if (!code) return false

  // First check for repeated declarations which indicate severe malformation
  const graphNodeCount = (code.match(/graph_node TD/g) || []).length
  const hNodeCount = (code.match(/h_node TD/g) || []).length

  if (graphNodeCount > 5 || hNodeCount > 5) {
    return false
  }

  // Check for valid graph declaration
  if (!/^\s*(graph|flowchart)\s+(TB|TD|BT|RL|LR)/i.test(code)) {
    return false
  }

  // Check for balanced brackets and parentheses
  const brackets = { "[": 0, "(": 0, "{": 0, '"': 0, "'": 0 }
  const closingBrackets = { "]": "[", ")": "(", "}": "{", '"': '"', "'": "'" }

  for (const char of code) {
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

/**
 * Generates a simple flowchart from text description
 * @param input Text description of the flowchart
 * @param orientation Direction of the flowchart (TD, LR, etc.)
 * @returns Generated Mermaid code
 */
export function generateSimpleFlowchart(input: string, orientation = "TD"): string {
  // Try to identify steps in the input
  const steps = extractStepsFromText(input)

  if (steps.length === 0) {
    return `graph ${orientation}\nA[Start] --> B[End]`
  }

  let mermaidCode = `graph ${orientation}\n`

  // Add start node
  mermaidCode += `start([Start]) --> ${steps[0].id}\n`

  // Add all steps
  steps.forEach((step, index) => {
    // Determine the appropriate shape based on the step type
    let nodeDefinition
    if (step.type === "decision") {
      nodeDefinition = `${step.id}{${step.label}}`
    } else if (step.type === "process") {
      nodeDefinition = `${step.id}[${step.label}]`
    } else if (step.type === "io") {
      nodeDefinition = `${step.id}>${step.label}]`
    } else if (step.type === "database") {
      nodeDefinition = `${step.id}[(${step.label})]`
    } else {
      nodeDefinition = `${step.id}[${step.label}]`
    }

    mermaidCode += `${nodeDefinition}\n`

    // Add connections between steps
    if (index < steps.length - 1) {
      if (step.type === "decision") {
        // For decisions, add Yes/No paths
        mermaidCode += `${step.id} -->|Yes| ${steps[index + 1].id}\n`

        // If there's a step after the next one, connect the No path to it
        // Otherwise, connect back to a previous step or to the end
        if (index + 2 < steps.length) {
          mermaidCode += `${step.id} -->|No| ${steps[index + 2].id}\n`
        } else {
          mermaidCode += `${step.id} -->|No| end\n`
        }
      } else {
        mermaidCode += `${step.id} --> ${steps[index + 1].id}\n`
      }
    }
  })

  // Add end node
  mermaidCode += `${steps[steps.length - 1].id} --> end([End])\n`

  return mermaidCode
}

/**
 * Extracts steps from text description
 * @param input Text description
 * @returns Array of step objects
 */
function extractStepsFromText(input: string): Array<{ id: string; label: string; type: string }> {
  // Split the input into sentences
  const sentences = input.split(/[.!?]/).filter((s) => s.trim().length > 0)

  // Process each sentence to identify potential steps
  return sentences.map((sentence, index) => {
    const trimmedSentence = sentence.trim()
    const id = `step${index + 1}`

    // Determine the type of step based on keywords
    let type = "process" // Default type

    // Check for decision steps
    if (/if|decide|check|determine|verify|condition|choice|select|choose/i.test(trimmedSentence)) {
      type = "decision"
    }
    // Check for input/output steps
    else if (/input|output|display|show|print|read|write|file|document/i.test(trimmedSentence)) {
      type = "io"
    }
    // Check for database operations
    else if (/database|store|retrieve|query|record|save|load|fetch/i.test(trimmedSentence)) {
      type = "database"
    }

    return {
      id,
      label: trimmedSentence.length > 50 ? trimmedSentence.substring(0, 47) + "..." : trimmedSentence,
      type,
    }
  })
}

/**
 * Generates a complex flowchart with advanced features
 * @param input Text description
 * @param requirements Analysis of flowchart requirements
 * @param orientation Direction of the flowchart
 * @returns Generated Mermaid code
 */
export function generateComplexFlowchart(input: string, requirements: any, orientation = "TD"): string {
  // This is a placeholder for a more sophisticated implementation
  // In a real implementation, this would use NLP or other techniques to
  // extract a more detailed structure from the input

  // For now, we'll use the simple flowchart generator as a base
  let mermaidCode = generateSimpleFlowchart(input, orientation)

  // Add styling for better visualization
  mermaidCode += `
classDef default fill:#f9f9f9,stroke:#333,stroke-width:1px
classDef decision fill:#fffacd,stroke:#333,stroke-width:1px
classDef process fill:#e6f3ff,stroke:#333,stroke-width:1px
classDef start fill:#d5f5e3,stroke:#333,stroke-width:1px
classDef end fill:#fadbd8,stroke:#333,stroke-width:1px

class start,end start
class .*step.*decision.* decision
class .*step.*process.* process
`

  return mermaidCode
}

