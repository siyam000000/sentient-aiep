import { render } from "@testing-library/react"
import { MermaidRenderer } from "@/components/mermaid-renderer"
import { describe, it, expect, jest, beforeEach } from "@jest/globals"

// Mock mermaid library
jest.mock("mermaid", () => ({
  initialize: jest.fn(),
  render: jest.fn().mockImplementation((id, text, callback) => {
    callback(null, "<svg>Mock SVG</svg>")
  }),
}))

// Simple performance measurement function
const measurePerformance = (fn: () => void, iterations = 100): number => {
  const start = performance.now()
  for (let i = 0; i < iterations; i++) {
    fn()
  }
  return (performance.now() - start) / iterations
}

describe("MermaidRenderer Performance", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders efficiently with normal sized diagram", () => {
    const normalCode = "graph TD\nA[Start] --> B[Process]\nB --> C[End]"

    const renderTime = measurePerformance(() => {
      const { unmount } = render(<MermaidRenderer code={normalCode} />)
      unmount()
    })

    console.log(`Average render time (normal): ${renderTime}ms`)
    // This is more of a benchmark than a strict test
    expect(renderTime).toBeLessThan(100) // Should render in under 100ms
  })

  it("handles large diagrams efficiently", () => {
    // Generate a large flowchart with 100 nodes
    let largeCode = "graph TD\n"
    for (let i = 0; i < 100; i++) {
      largeCode += `Node${i}[Node ${i}]`
      if (i < 99) {
        largeCode += ` --> Node${i + 1}[Node ${i + 1}]\n`
      }
    }

    const renderTime = measurePerformance(() => {
      const { unmount } = render(<MermaidRenderer code={largeCode} />)
      unmount()
    }, 10) // Fewer iterations for large diagrams

    console.log(`Average render time (large): ${renderTime}ms`)
    // Allow more time for larger diagrams
    expect(renderTime).toBeLessThan(500) // Should render in under 500ms
  })

  it("implements memoization correctly", () => {
    const mermaid = require("mermaid")
    const testCode = "graph TD\nA[Start] --> B[End]"

    // First render
    const { rerender, unmount } = render(<MermaidRenderer code={testCode} />)
    expect(mermaid.render).toHaveBeenCalledTimes(1)

    // Rerender with same code
    rerender(<MermaidRenderer code={testCode} />)

    // Should not re-render the diagram for the same code
    expect(mermaid.render).toHaveBeenCalledTimes(1)

    // Rerender with different code
    rerender(<MermaidRenderer code={testCode + "\nC[New] --> D[Node]"} />)

    // Should re-render with new code
    expect(mermaid.render).toHaveBeenCalledTimes(2)

    unmount()
  })
})

