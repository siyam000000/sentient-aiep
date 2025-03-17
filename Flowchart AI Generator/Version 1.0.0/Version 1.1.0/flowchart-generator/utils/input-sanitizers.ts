/**
 * Sanitizes user input to prevent XSS and other injection attacks
 * @param input The user input to sanitize
 * @param maxLength Maximum allowed length (defaults to 5000)
 * @returns Sanitized string
 */
export function sanitizeUserInput(input: string, maxLength = 5000): string {
  // Handle null or undefined
  if (input == null) return ""

  // Ensure input is a string
  let sanitized = String(input)

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, "")

  // Remove potentially dangerous JavaScript URLs
  sanitized = sanitized.replace(/javascript:/gi, "")

  // Remove dangerous Unicode control characters (includes RTL override, etc)
  sanitized = sanitized.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202F]/g, "")

  // Trim extra whitespace
  sanitized = sanitized.trim()

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  return sanitized
}

/**
 * Validates Mermaid syntax for security and correctness
 * @param code Mermaid diagram code
 * @returns Boolean indicating if the code is valid
 */
export function validateMermaidSyntax(code: string): boolean {
  if (!code || typeof code !== "string") {
    return false
  }

  // Check for valid graph declaration
  const firstLine = code.split("\n")[0].trim()
  if (!firstLine.match(/^(graph|flowchart)\s+(TB|TD|BT|RL|LR)$/)) {
    return false
  }

  // Check for potentially malicious content
  const hasMaliciousContent =
    code.includes("onerror=") ||
    code.includes("javascript:") ||
    code.includes("data:") ||
    code.includes("<script") ||
    code.includes("eval(") ||
    code.includes("document.cookie")

  if (hasMaliciousContent) {
    return false
  }

  // Additional syntax validation could be added here

  return true
}

