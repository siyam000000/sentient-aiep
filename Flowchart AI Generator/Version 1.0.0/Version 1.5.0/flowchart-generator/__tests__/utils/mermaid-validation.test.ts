import { validateMermaidCode } from "@/utils/mermaid-validation"
import { describe, it, expect } from "@jest/globals"

describe("Mermaid Validation", () => {
  it("should validate correct mermaid flowchart code", () => {
    const validCode = `graph TD
    A[Start] --> B(Process)
    B --> C{Decision}
    C -->|Yes| D[End]
    C -->|No| B`

    expect(validateMermaidCode(validCode)).toBe(true)
  })

  it("should validate flowchart with different direction", () => {
    // Left to right flowchart
    const lrFlowchart = `graph LR
    A[Start] --> B[End]`

    expect(validateMermaidCode(lrFlowchart)).toBe(true)

    // Bottom to top flowchart
    const btFlowchart = `graph BT
    A[Start] --> B[End]`

    expect(validateMermaidCode(btFlowchart)).toBe(true)

    // Right to left flowchart
    const rlFlowchart = `graph RL
    A[Start] --> B[End]`

    expect(validateMermaidCode(rlFlowchart)).toBe(true)
  })

  it("should validate graph vs flowchart keywords", () => {
    // Using flowchart keyword
    const flowchartCode = `flowchart TD
    A[Start] --> B[End]`

    expect(validateMermaidCode(flowchartCode)).toBe(true)
  })

  it("should reject code with invalid graph direction", () => {
    const invalidDirection = `graph XX
    A[Start] --> B(Process)`

    expect(validateMermaidCode(invalidDirection)).toBe(false)
  })

  it("should reject code with missing graph declaration", () => {
    const missingDeclaration = `A[Start] --> B(Process)`

    expect(validateMermaidCode(missingDeclaration)).toBe(false)
  })

  it("should handle empty lines correctly", () => {
    const codeWithEmptyLines = `graph TD
    
    A[Start] --> B(Process)
    
    B --> C{Decision}`

    expect(validateMermaidCode(codeWithEmptyLines)).toBe(true)
  })

  it("should validate valid node identifiers", () => {
    const validNodeIds = `graph TD
    A[A] --> B[B]
    Node1[Node 1] --> Node_2[Node 2]
    node-3[Node 3] --> 4[Node 4]`

    expect(validateMermaidCode(validNodeIds)).toBe(true)
  })

  it("should reject invalid syntax with special characters", () => {
    const invalidSyntax = `graph TD
    A[Start] --> B(Process)
    B --> @C{Decision}` // @ is not valid in a node identifier

    expect(validateMermaidCode(invalidSyntax)).toBe(false)
  })

  it("should handle very short mermaid code", () => {
    const shortCode = `graph TD
    A-->B`

    expect(validateMermaidCode(shortCode)).toBe(true)
  })

  it("should handle empty body after declaration", () => {
    const emptyBody = `graph TD`

    // This should pass because it has a valid declaration
    expect(validateMermaidCode(emptyBody)).toBe(true)
  })

  it("should handle whitespace variations", () => {
    const withExtraSpaces = `  graph    TD  
    A[Start]   -->    B[End]`

    expect(validateMermaidCode(withExtraSpaces)).toBe(true)
  })

  it("should validate with subgraphs", () => {
    const withSubgraph = `graph TD
    A[Start] --> B[Process]
    subgraph Group
    C[Step 1] --> D[Step 2]
    end
    B --> C`

    // The current implementation should accept this as long as each line starts with alphanumeric
    expect(validateMermaidCode(withSubgraph)).toBe(true)
  })

  it("should handle very long mermaid code", () => {
    // Generate a large flowchart with 100 nodes
    let longCode = `graph TD\n`
    for (let i = 0; i < 100; i++) {
      longCode += `    Node${i}[Node ${i}]`
      if (i < 99) {
        longCode += ` --> Node${i + 1}[Node ${i + 1}]\n`
      }
    }

    expect(validateMermaidCode(longCode)).toBe(true)
  })
})

