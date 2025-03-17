import { render, screen, act } from "@testing-library/react"
import { MermaidRenderer } from "@/components/mermaid-renderer"
import { describe, it, expect, jest, beforeEach } from "@jest/globals"

// Mock mermaid library
jest.mock("mermaid", () => ({
  initialize: jest.fn(),
  render: jest.fn().mockImplementation((id, text, callback) => {
    callback(null, "<svg>Mock SVG</svg>")
  }),
}))

describe("MermaidRenderer", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders the mermaid diagram correctly", async () => {
    const mockCode = "graph TD\nA[Start] --> B[End]"

    await act(async () => {
      render(<MermaidRenderer code={mockCode} />)
    })

    // The mock SVG should be in the document
    expect(screen.getByText("Mock SVG")).toBeInTheDocument()
  })

  it("initializes mermaid with correct options", async () => {
    const mockCode = "graph TD\nA[Start] --> B[End]"
    const mermaid = require("mermaid")

    await act(async () => {
      render(<MermaidRenderer code={mockCode} theme="dark" />)
    })

    expect(mermaid.initialize).toHaveBeenCalledWith({
      theme: "dark",
      startOnLoad: true,
      securityLevel: "strict",
    })
  })

  it("handles rendering errors gracefully", async () => {
    const mockCode = "invalid mermaid code"
    const mermaid = require("mermaid")

    // Mock rendering error
    mermaid.render.mockImplementationOnce((id, text, callback) => {
      callback(new Error("Syntax error in graph"), null)
    })

    await act(async () => {
      render(<MermaidRenderer code={mockCode} />)
    })

    expect(screen.getByText(/Error rendering diagram/i)).toBeInTheDocument()
    expect(screen.getByText(/Syntax error in graph/i)).toBeInTheDocument()
  })

  it("updates when the code prop changes", async () => {
    const mermaid = require("mermaid")
    const initialCode = "graph TD\nA[Start] --> B[End]"

    const { rerender } = render(<MermaidRenderer code={initialCode} />)

    expect(mermaid.render).toHaveBeenCalledTimes(1)

    const updatedCode = "graph TD\nA[Start] --> C[Middle] --> B[End]"

    await act(async () => {
      rerender(<MermaidRenderer code={updatedCode} />)
    })

    expect(mermaid.render).toHaveBeenCalledTimes(2)
  })

  it("should not re-render for same code", async () => {
    const mermaid = require("mermaid")
    const code = "graph TD\nA[Start] --> B[End]"

    const { rerender } = render(<MermaidRenderer code={code} />)
    expect(mermaid.render).toHaveBeenCalledTimes(1)

    await act(async () => {
      rerender(<MermaidRenderer code={code} />)
    })

    // Should not call render again for the same code
    expect(mermaid.render).toHaveBeenCalledTimes(1)
  })

  it("applies custom className", async () => {
    const mockCode = "graph TD\nA[Start] --> B[End]"

    await act(async () => {
      render(<MermaidRenderer code={mockCode} className="custom-class" />)
    })

    const container = screen.getByTestId("mermaid-container")
    expect(container).toHaveClass("custom-class")
  })

  it("handles empty code prop", async () => {
    await act(async () => {
      render(<MermaidRenderer code="" />)
    })

    // Should show a message for empty code
    expect(screen.getByText(/No diagram code provided/i)).toBeInTheDocument()
  })

  it("applies maximum height constraint", async () => {
    const mockCode = "graph TD\nA[Start] --> B[End]"

    await act(async () => {
      render(<MermaidRenderer code={mockCode} maxHeight={300} />)
    })

    const container = screen.getByTestId("mermaid-container")
    expect(container).toHaveStyle("max-height: 300px")
  })
})

