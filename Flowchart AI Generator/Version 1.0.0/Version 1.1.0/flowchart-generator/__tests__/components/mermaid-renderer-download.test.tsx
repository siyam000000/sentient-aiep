import { render } from "@testing-library/react"
import { MermaidRenderer } from "@/components/mermaid-renderer"
import { describe, it, expect, jest, beforeEach } from "@jest/globals"

// Mock html2canvas
jest.mock("html2canvas", () =>
  jest.fn(() =>
    Promise.resolve({
      toDataURL: jest.fn(() => "data:image/png;base64,mockImageData"),
    }),
  ),
)

// Mock mermaid library
jest.mock("mermaid", () => ({
  initialize: jest.fn(),
  run: jest.fn().mockImplementation(({ nodes }) => {
    const div = nodes[0]
    div.innerHTML = "<svg>Mock SVG content</svg>"
  }),
}))

describe("MermaidRenderer Download Functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock document.createElement and link.click
    const mockLink = {
      href: "",
      download: "",
      click: jest.fn(),
    }

    jest.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "a") return mockLink as any
      return document.createElement(tag)
    })
  })

  it("should provide a download method via ref", async () => {
    const mockCode = "graph TD\nA[Start] --> B[End]"
    const ref = { current: null }

    render(<MermaidRenderer ref={ref} code={mockCode} />)

    // Check that the ref has the downloadDiagram method
    expect(ref.current).not.toBeNull()
    expect(typeof ref.current.downloadDiagram).toBe("function")

    // Call the download method
    const result = await ref.current.downloadDiagram()

    // Verify download was triggered
    expect(result).toBe(true)
    expect(document.createElement).toHaveBeenCalledWith("a")
    const mockLink = document.createElement("a") as any
    expect(mockLink.download).toBe("flowchart.png")
    expect(mockLink.click).toHaveBeenCalled()
  })
})

