import { removeRepeatedGraphDeclarations, fixMermaidCodeLocally } from "../../utils/mermaid-helpers"

describe("mermaid-helpers", () => {
  it("should fix severely malformed code with repeated graph_node TD patterns", () => {
    const malformedCode = `graph_node TD graph_node TD graph_node TD
A[Start] --> B[Process]
B --> C[End]`

    const fixedCode = removeRepeatedGraphDeclarations(malformedCode)

    // Should have removed all graph_node TD occurrences
    expect(fixedCode).not.toContain("graph_node TD")

    // Should have a proper graph declaration
    expect(fixedCode.trim().startsWith("graph TD")).toBe(true)

    // Should preserve node definitions and connections
    expect(fixedCode).toContain("A[Start]")
    expect(fixedCode).toContain("B[Process]")
    expect(fixedCode).toContain("C[End]")
    expect(fixedCode).toContain("A --> B")
    expect(fixedCode).toContain("B --> C")
  })

  it("should fix the specific 'graph_node TD' error pattern", () => {
    const errorCode = `graph_node TD
A[Start] --> B[Process]
B --> C[End]`

    const fixedCode = fixMermaidCodeLocally(errorCode)

    // Should have fixed the graph declaration
    expect(fixedCode.trim().startsWith("graph TD")).toBe(true)

    // Should not contain the error pattern
    expect(fixedCode).not.toContain("graph_node")

    // Should preserve the rest of the diagram
    expect(fixedCode).toContain("A[Start] --> B[Process]")
    expect(fixedCode).toContain("B --> C[End]")
  })
})

