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

