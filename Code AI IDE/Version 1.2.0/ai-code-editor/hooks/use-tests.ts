"use client"

import { useState, useCallback } from "react"
import type { File } from "@/types"
import { validateCode } from "@/utils/code-utils"

interface TestResult {
  name: string
  passed: boolean
  message?: string
}

interface TestSuite {
  name: string
  results: TestResult[]
  passed: boolean
  total: number
  passedCount: number
}

export function useTests(files: File[]) {
  const [testResults, setTestResults] = useState<TestSuite[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = useCallback(async () => {
    setIsRunning(true)

    try {
      // Syntax validation tests
      const syntaxTests: TestResult[] = []

      // Validate HTML
      const htmlFile = files.find((f) => f.name === "index.html")
      if (htmlFile) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(htmlFile.content, "text/html")
        const parseError = doc.querySelector("parsererror")

        syntaxTests.push({
          name: "HTML Syntax",
          passed: !parseError,
          message: parseError ? `HTML parsing error: ${parseError.textContent}` : "HTML syntax is valid",
        })
      }

      // Validate CSS
      const cssFile = files.find((f) => f.name === "styles.css")
      if (cssFile) {
        const cssContent = cssFile.content
        const openBraces = (cssContent.match(/{/g) || []).length
        const closeBraces = (cssContent.match(/}/g) || []).length

        syntaxTests.push({
          name: "CSS Syntax",
          passed: openBraces === closeBraces,
          message:
            openBraces === closeBraces
              ? "CSS syntax is valid"
              : `CSS has mismatched braces: ${openBraces} opening, ${closeBraces} closing`,
        })
      }

      // Validate JavaScript
      const jsFile = files.find((f) => f.name === "script.js")
      if (jsFile) {
        let jsValid = true
        let jsError = ""

        try {
          new Function(jsFile.content)
        } catch (error) {
          jsValid = false
          jsError = (error as Error).message
        }

        syntaxTests.push({
          name: "JavaScript Syntax",
          passed: jsValid,
          message: jsValid ? "JavaScript syntax is valid" : `JavaScript error: ${jsError}`,
        })
      }

      // Functional tests
      const functionalTests: TestResult[] = []

      // Test if HTML has required elements
      if (htmlFile) {
        const doc = new DOMParser().parseFromString(htmlFile.content, "text/html")

        functionalTests.push({
          name: "HTML has heading",
          passed: !!doc.querySelector("h1, h2, h3, h4, h5, h6"),
          message: doc.querySelector("h1, h2, h3, h4, h5, h6")
            ? "HTML contains a heading element"
            : "HTML should contain at least one heading element",
        })

        functionalTests.push({
          name: "HTML has body content",
          passed: !!doc.body.textContent?.trim(),
          message: doc.body.textContent?.trim()
            ? "HTML body contains content"
            : "HTML body should contain some content",
        })
      }

      // Test if CSS has styles
      if (cssFile) {
        functionalTests.push({
          name: "CSS has styles",
          passed: cssFile.content.trim().length > 0,
          message: cssFile.content.trim().length > 0 ? "CSS contains styles" : "CSS file is empty",
        })
      }

      // Test if JavaScript has code
      if (jsFile) {
        functionalTests.push({
          name: "JavaScript has code",
          passed: jsFile.content.trim().length > 0,
          message: jsFile.content.trim().length > 0 ? "JavaScript contains code" : "JavaScript file is empty",
        })
      }

      // Integration test
      const integrationTest: TestResult[] = []
      const validationResult = validateCode(files)

      integrationTest.push({
        name: "Code Integration",
        passed: validationResult.isValid,
        message: validationResult.isValid
          ? "All code integrates correctly"
          : validationResult.error || "Code integration failed",
      })

      // Create test suites
      const syntaxSuite: TestSuite = {
        name: "Syntax Tests",
        results: syntaxTests,
        passed: syntaxTests.every((test) => test.passed),
        total: syntaxTests.length,
        passedCount: syntaxTests.filter((test) => test.passed).length,
      }

      const functionalSuite: TestSuite = {
        name: "Functional Tests",
        results: functionalTests,
        passed: functionalTests.every((test) => test.passed),
        total: functionalTests.length,
        passedCount: functionalTests.filter((test) => test.passed).length,
      }

      const integrationSuite: TestSuite = {
        name: "Integration Tests",
        results: integrationTest,
        passed: integrationTest.every((test) => test.passed),
        total: integrationTest.length,
        passedCount: integrationTest.filter((test) => test.passed).length,
      }

      setTestResults([syntaxSuite, functionalSuite, integrationSuite])
    } catch (error) {
      console.error("Error running tests:", error)
    } finally {
      setIsRunning(false)
    }
  }, [files])

  return {
    testResults,
    isRunning,
    runTests,
  }
}

