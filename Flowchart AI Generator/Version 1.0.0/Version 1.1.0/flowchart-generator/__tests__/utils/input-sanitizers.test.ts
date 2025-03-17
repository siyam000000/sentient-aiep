import { sanitizeUserInput, validateMermaidSyntax } from "@/utils/input-sanitizers"
import { describe, it, expect } from "@jest/globals"

describe("Input Sanitizers", () => {
  describe("sanitizeUserInput", () => {
    it("should trim whitespace", () => {
      expect(sanitizeUserInput("  test  ")).toBe("test")
    })

    it("should remove HTML tags", () => {
      expect(sanitizeUserInput('<script>alert("XSS")</script>Hello')).toBe("Hello")
      expect(sanitizeUserInput("<div>Content</div>")).toBe("Content")
    })

    it("should handle XSS attempts", () => {
      const xssInput = 'javascript:alert("XSS")'
      expect(sanitizeUserInput(xssInput)).not.toContain("javascript:")
    })

    it("should limit input length", () => {
      const longInput = "a".repeat(10000)
      expect(sanitizeUserInput(longInput).length).toBeLessThanOrEqual(5000)
    })

    it("should handle null or undefined input", () => {
      expect(sanitizeUserInput(null as any)).toBe("")
      expect(sanitizeUserInput(undefined as any)).toBe("")
    })

    it("should convert non-string inputs to strings", () => {
      expect(sanitizeUserInput(123 as any)).toBe("123")
      expect(sanitizeUserInput({} as any)).toBe("[object Object]")
    })

    it("should preserve legitimate punctuation and special characters", () => {
      expect(sanitizeUserInput("Hello, world! How are you?")).toBe("Hello, world! How are you?")
    })

    it("should sanitize potentially malicious Unicode", () => {
      // Unicode that could be used for RTL override or other tricks
      const unicodeTrick = "Hello\u202Edlrow"
      expect(sanitizeUserInput(unicodeTrick)).not.toContain("\u202E")
    })
  })

  describe("validateMermaidSyntax", () => {
    it("should accept valid mermaid syntax", () => {
      const validMermaid = `graph TD
      A[Start] --> B[End]`

      expect(validateMermaidSyntax(validMermaid)).toBe(true)
    })

    it("should reject invalid syntax", () => {
      const invalidSyntax = `invalid mermaid code`
      expect(validateMermaidSyntax(invalidSyntax)).toBe(false)
    })

    it("should reject potentially malicious content in nodes", () => {
      const maliciousCode = `graph TD
      A["<img src=x onerror=alert('XSS')>"] --> B[End]`

      expect(validateMermaidSyntax(maliciousCode)).toBe(false)
    })

    it("should reject JavaScript URLs in node links", () => {
      const maliciousLink = `graph TD
      A[Start] --> B[End]
      click B javascript:alert('XSS')`

      expect(validateMermaidSyntax(maliciousLink)).toBe(false)
    })

    it("should handle empty input", () => {
      expect(validateMermaidSyntax("")).toBe(false)
    })

    it("should validate complex but valid diagrams", () => {
      const complexDiagram = `graph TD
      A[Start] --> B{Decision}
      B -->|Yes| C[Process 1]
      B -->|No| D[Process 2]
      C --> E[End]
      D --> E
      subgraph Group
      F[Step 1] --> G[Step 2]
      end
      D --> F`

      expect(validateMermaidSyntax(complexDiagram)).toBe(true)
    })
  })
})

