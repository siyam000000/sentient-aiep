import { validateCode, formatCode, generateOutputHTML } from "@/utils/code-utils"
import type { File } from "@/types"
import { describe, test, expect } from "vitest"

describe("Code Utilities", () => {
  // Sample files for testing
  const validFiles: File[] = [
    { name: "index.html", language: "html", content: "<h1>Hello, World!</h1>", type: "file" },
    { name: "styles.css", language: "css", content: "body { font-family: Arial; }", type: "file" },
    { name: "script.js", language: "javascript", content: 'console.log("Hello");', type: "file" },
  ]

  describe("validateCode", () => {
    test("should validate correct code", () => {
      const result = validateCode(validFiles)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    test("should detect HTML errors", () => {
      const filesWithHtmlError: File[] = [
        { name: "index.html", language: "html", content: "<h1>Hello, World!</h2>", type: "file" },
        ...validFiles.slice(1),
      ]

      const result = validateCode(filesWithHtmlError)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain("HTML parsing error")
    })

    test("should detect CSS errors", () => {
      const filesWithCssError: File[] = [
        ...validFiles.slice(0, 1),
        { name: "styles.css", language: "css", content: "body { font-family: Arial;", type: "file" },
        ...validFiles.slice(2),
      ]

      const result = validateCode(filesWithCssError)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain("CSS error")
    })

    test("should detect JavaScript errors", () => {
      const filesWithJsError: File[] = [
        ...validFiles.slice(0, 2),
        { name: "script.js", language: "javascript", content: 'console.log("Hello"', type: "file" },
      ]

      const result = validateCode(filesWithJsError)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain("JavaScript error")
    })
  })

  describe("formatCode", () => {
    test("should format HTML code", () => {
      const unformattedHtml = "<div><p>Hello</p></div>"
      const formattedHtml = formatCode(unformattedHtml, "html")

      // Check that the formatted code has newlines
      expect(formattedHtml).toContain("\n")
      // Check that the content is preserved
      expect(formattedHtml).toContain("<div>")
      expect(formattedHtml).toContain("<p>Hello</p>")
      expect(formattedHtml).toContain("</div>")
    })

    test("should format CSS code", () => {
      const unformattedCss = "body{font-family:Arial;color:black;}"
      const formattedCss = formatCode(unformattedCss, "css")

      // Check that the formatted code has newlines and spaces
      expect(formattedCss).toContain("\n")
      expect(formattedCss).toContain("  ")
      // Check that the content is preserved
      expect(formattedCss).toContain("body {")
      expect(formattedCss).toContain("font-family:Arial;")
      expect(formattedCss).toContain("color:black;")
    })

    test("should format JavaScript code", () => {
      const unformattedJs = 'function test(){console.log("Hello");}'
      const formattedJs = formatCode(unformattedJs, "javascript")

      // Check that the formatted code has newlines and spaces
      expect(formattedJs).toContain("\n")
      expect(formattedJs).toContain("  ")
      // Check that the content is preserved
      expect(formattedJs).toContain("function test() {")
      expect(formattedJs).toContain('console.log("Hello");')
    })
  })

  describe("generateOutputHTML", () => {
    test("should combine HTML, CSS, and JavaScript files", () => {
      const output = generateOutputHTML(validFiles)

      // Check that the output contains all the content
      expect(output).toContain("<h1>Hello, World!</h1>")
      expect(output).toContain("body { font-family: Arial; }")
      expect(output).toContain('console.log("Hello");')

      // Check that the structure is correct
      expect(output).toContain("&lt;!DOCTYPE html>")
      expect(output).toContain("<html>")
      expect(output).toContain("<head>")
      expect(output).toContain("<style>")
      expect(output).toContain("</style>")
      expect(output).toContain("</head>")
      expect(output).toContain("<body>")
      expect(output).toContain("<script>")
      expect(output).toContain("</script>")
      expect(output).toContain("</body>")
      expect(output).toContain("</html>")
    })

    test("should handle missing files", () => {
      const filesWithoutCss: File[] = [
        { name: "index.html", language: "html", content: "<h1>Hello, World!</h1>", type: "file" },
        { name: "script.js", language: "javascript", content: 'console.log("Hello");', type: "file" },
      ]

      const output = generateOutputHTML(filesWithoutCss)

      // Check that the output contains the available content
      expect(output).toContain("<h1>Hello, World!</h1>")
      expect(output).toContain('console.log("Hello");')

      // Check that the structure is correct even without CSS
      expect(output).toContain("<style></style>")
    })
  })
})

