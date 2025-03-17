import type { File } from "@/types"

/**
 * Combines HTML, CSS, and JavaScript files into a single HTML document
 */
export function generateOutputHTML(files: File[]): string {
  const htmlFile = files.find((f) => f.name === "index.html")
  const cssFile = files.find((f) => f.name === "styles.css")
  const jsFile = files.find((f) => f.name === "script.js")

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sentient AI IDE Preview</title>
        <style>${cssFile?.content || ""}</style>
      </head>
      <body>
        ${htmlFile?.content || ""}
        <script>${jsFile?.content || ""}</script>
      </body>
    </html>
  `
}

/**
 * Validates code and returns any errors
 */
export function validateCode(files: File[]): { isValid: boolean; error?: string } {
  try {
    const output = generateOutputHTML(files)

    // Validate HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(output, "text/html")
    const parseError = doc.querySelector("parsererror")
    if (parseError) {
      return {
        isValid: false,
        error: `HTML parsing error: ${parseError.textContent}`,
      }
    }

    // Validate CSS
    const cssFile = files.find((f) => f.name === "styles.css")
    if (cssFile) {
      const cssContent = cssFile.content
      if (cssContent.includes("{") && !cssContent.includes("}")) {
        return {
          isValid: false,
          error: "CSS error: Missing closing brace",
        }
      }

      // Check for mismatched braces
      const openBraces = (cssContent.match(/{/g) || []).length
      const closeBraces = (cssContent.match(/}/g) || []).length
      if (openBraces !== closeBraces) {
        return {
          isValid: false,
          error: `CSS error: Mismatched braces (${openBraces} opening, ${closeBraces} closing)`,
        }
      }
    }

    // Validate JavaScript
    const jsFile = files.find((f) => f.name === "script.js")
    if (jsFile) {
      // Check for reserved words in strict mode
      const reservedWords = [
        "package",
        "interface",
        "private",
        "protected",
        "implements",
        "static",
        "public",
        "yield",
        "let",
        "const",
        "class",
        "enum",
        "export",
        "extends",
        "import",
        "super",
      ]

      for (const word of reservedWords) {
        const regex = new RegExp(`\\b${word}\\b`, "g")
        if (regex.test(jsFile.content)) {
          return {
            isValid: false,
            error: `JavaScript error: Usage of strict mode reserved word '${word}'`,
          }
        }
      }

      // Try to parse the JavaScript
      try {
        new Function(jsFile.content)
      } catch (error) {
        return {
          isValid: false,
          error: `JavaScript error: ${(error as Error).message}`,
        }
      }
    }

    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: `Validation error: ${(error as Error).message}`,
    }
  }
}

/**
 * Formats code based on language
 */
export function formatCode(code: string, language: string): string {
  // This is a simple formatter - in a real app, you'd use a proper formatter
  // like prettier or language-specific formatters

  if (language === "html") {
    // Simple HTML formatting
    return code
      .replace(/>\s+</g, ">\n<") // Add newlines between tags
      .replace(/(<[^/].*?>)/g, "$1\n") // Add newline after opening tags
      .replace(/(<\/.*?>)/g, "\n$1") // Add newline before closing tags
      .replace(/\n\s*\n/g, "\n") // Remove multiple blank lines
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
  }

  if (language === "css") {
    // Simple CSS formatting
    return code
      .replace(/\s*{\s*/g, " {\n  ") // Format opening braces
      .replace(/\s*}\s*/g, "\n}\n") // Format closing braces
      .replace(/;\s*/g, ";\n  ") // Add newline after semicolons
      .replace(/\n\s*\n/g, "\n") // Remove multiple blank lines
      .trim()
  }

  if (language === "javascript") {
    // Simple JavaScript formatting
    return code
      .replace(/\s*{\s*/g, " {\n  ") // Format opening braces
      .replace(/\s*}\s*/g, "\n}\n") // Format closing braces
      .replace(/;\s*/g, ";\n  ") // Add newline after semicolons
      .replace(/\n\s*\n/g, "\n") // Remove multiple blank lines
      .trim()
  }

  return code
}

/**
 * Gets the appropriate file icon and color based on file type and language
 */
export function getFileIconAndColor(file: File): { icon: string; color: string } {
  if (file.type === "folder") {
    return { icon: "folder", color: "text-yellow-400" }
  }

  switch (file.language) {
    case "html":
      return { icon: "code-html", color: "text-blue-400" }
    case "css":
      return { icon: "code-css", color: "text-purple-400" }
    case "javascript":
      return { icon: "code-js", color: "text-yellow-400" }
    default:
      return { icon: "file-code", color: "text-white" }
  }
}

/**
 * Gets the appropriate language mode for Monaco Editor
 */
export function getMonacoLanguage(language: string): string {
  switch (language) {
    case "html":
      return "html"
    case "css":
      return "css"
    case "javascript":
      return "javascript"
    default:
      return "plaintext"
  }
}

