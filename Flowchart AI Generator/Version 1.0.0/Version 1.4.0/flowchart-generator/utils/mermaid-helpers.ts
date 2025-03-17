/**
 * Utility functions for manipulating Mermaid code
 */

/**
 * Cleans Mermaid code by removing markdown formatting and extra whitespace
 * @param code The Mermaid code to clean
 * @returns Cleaned Mermaid code
 */
export function cleanMermaidCode(code: string): string {
  if (!code) return ""

  // Remove markdown code block markers
  const cleanedCode = code
    .replace(/```mermaid\n?/g, "")
    .replace(/```\n?/g, "")
    .trim()

  return cleanedCode
}

/**
 * Fixes common Mermaid syntax issues
 * @param code The Mermaid code to fix
 * @returns Fixed Mermaid code
 */
export function fixMermaidSyntaxIssues(code: string): string {
  if (!code) return ""

  // Replace reserved keywords used as node IDs
  const fixedCode = code.replace(/(\s)(end)(\s)/g, "$1end_keyword$3")

  return fixedCode
}

/**
 * Detects and fixes special flowchart patterns, like the dog lifecycle flowchart
 * @param code The Mermaid code to check
 * @returns Fixed Mermaid code or the original if no special pattern is found
 */
export function detectAndFixSpecialFlowcharts(code: string): string {
  // Placeholder for special flowchart detection and fixing logic
  return code
}

/**
 * Removes repeated graph declarations from Mermaid code
 * @param code The Mermaid code to clean
 * @returns Cleaned Mermaid code
 */
export function removeRepeatedGraphDeclarations(code: string): string {
  if (!code) return ""

  // Remove all occurrences of "graph TD" or "graph LR" except the first one
  const cleanedCode = code.replace(/^(graph\s+[A-Z]{2}).*?\n/s, "$1\n").replace(/graph\s+[A-Z]{2}/g, (match, index) => {
    return index === 0 ? match : ""
  })

  return cleanedCode
}

/**
 * Fixes Mermaid code locally by applying a series of simple fixes
 * @param code The Mermaid code to fix
 * @returns Fixed Mermaid code
 */
export function fixMermaidCodeLocally(code: string): string {
  if (!code) return ""

  // Replace "graph_node TD" with "graph TD"
  const fixedCode = code.replace(/graph_node TD/g, "graph TD")

  return fixedCode
}

/**
 * Ensures that the Mermaid code starts with a valid graph declaration
 * @param code The Mermaid code to check
 * @returns Mermaid code with a valid graph declaration
 */
export function ensureValidGraphDeclaration(code: string): string {
  if (!code) return "graph TD"

  const trimmedCode = code.trim()
  if (!trimmedCode.startsWith("graph ") && !trimmedCode.startsWith("flowchart ")) {
    return "graph TD\n" + trimmedCode
  }

  return code
}

/**
 * Fixes a specific dog lifecycle flowchart pattern
 * @param code The Mermaid code to fix
 * @returns Fixed Mermaid code
 */
export function fixDogLifecycleFlowchart(code: string): string {
  // Placeholder for dog lifecycle flowchart fix
  return code
}

/**
 * Aggressively fixes malformed Mermaid code by removing invalid characters and structures
 * @param code The Mermaid code to fix
 * @returns Fixed Mermaid code
 */
export function aggressivelyFixMalformedCode(code: string): string {
  if (!code) return ""

  // Remove invalid characters
  const fixedCode = code.replace(/[^a-zA-Z0-9\s[\]$$$$\->:;,\n]/g, "")

  return fixedCode
}

/**
 * Creates a simplified diagram from a complex one
 * @param code The Mermaid code to simplify
 * @returns Simplified Mermaid code
 */
export function createSimplifiedDiagram(code: string): string {
  if (!code) return "graph TD\nA[Start] --> B[End]"

  const lines = code.split("\n")
  const graphDeclaration = lines[0]
  const simplifiedCode = `${graphDeclaration}\nA[Start] --> B[End]`
  return simplifiedCode
}

/**
 * Checks if a diagram is too complex based on the number of nodes and connections
 * @param code The Mermaid code to check
 * @returns Boolean indicating if the diagram is too complex
 */
export function isDiagramTooComplex(code: string): boolean {
  if (!code) return false

  const nodeCount = (code.match(/\[.*?\]/g) || []).length
  const connectionCount = (code.match(/-->/g) || []).length

  // Define complexity thresholds
  const maxNodes = 20
  const maxConnections = 30

  return nodeCount > maxNodes || connectionCount > maxConnections
}

