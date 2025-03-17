import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, jest, beforeEach } from "@jest/globals"

// Mock required components and services
jest.mock("mermaid", () => ({
  initialize: jest.fn(),
  run: jest.fn(),
}))

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

jest.mock("html2canvas", () =>
  jest.fn(() =>
    Promise.resolve({
      toDataURL: jest.fn(() => "data:image/png;base64,mockImageData"),
    }),
  ),
)

// Mock fetch for API calls
global.fetch = jest.fn()

// Import the page component
import Home from "@/app/page"

describe("Flowchart Generator Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset window.URL.createObjectURL
    window.URL.createObjectURL = jest.fn(() => "blob:mockurl")
  })

  it("renders all main UI elements correctly", () => {
    render(<Home />)

    // Check for main UI elements
    expect(screen.getByText(/Sentient Flowchart Generator/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Flowchart Description/i)).toBeInTheDocument()
    expect(screen.getByText(/Generate Flowchart/i)).toBeInTheDocument()
    expect(screen.getByText(/Enhance Prompt/i)).toBeInTheDocument()
  })

  it("handles flowchart generation workflow", async () => {
    // Mock API response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        mermaidCode: "graph TD\nA[Start] --> B[End]",
      }),
    })

    render(<Home />)

    // Enter description
    const textInput = screen.getByLabelText(/Flowchart Description/i)
    await userEvent.type(textInput, "Test flowchart description")

    // Click generate button
    const generateButton = screen.getByText(/Generate Flowchart/i)
    await userEvent.click(generateButton)

    // Should show loading state
    expect(screen.getByText(/Generating.../i)).toBeInTheDocument()

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/Download as PNG/i)).toBeInTheDocument()
    })

    // Check that fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/generate-flowchart",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining("Test flowchart description"),
      }),
    )
  })

  it("handles prompt enhancement workflow", async () => {
    // Mock API response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        enhancedPrompt: "Create a flowchart of user authentication process with validation",
      }),
    })

    render(<Home />)

    // Enter description
    const textInput = screen.getByLabelText(/Flowchart Description/i)
    await userEvent.type(textInput, "User login")

    // Click enhance button
    const enhanceButton = screen.getByText(/Enhance Prompt/i)
    await userEvent.click(enhanceButton)

    // Should show loading state
    expect(screen.getByText(/Enhancing.../i)).toBeInTheDocument()

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/Enhanced Prompt:/i)).toBeInTheDocument()
      expect(screen.getByText(/Create a flowchart of user authentication process with validation/i)).toBeInTheDocument()
      expect(screen.getByText(/Use Enhanced Prompt/i)).toBeInTheDocument()
    })

    // Click to use enhanced prompt
    const useEnhancedButton = screen.getByText(/Use Enhanced Prompt/i)
    await userEvent.click(useEnhancedButton)

    // Check input was updated
    expect(textInput).toHaveValue("Create a flowchart of user authentication process with validation")
  })

  it("displays error messages when API calls fail", async () => {
    // Mock API error
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Server error occurred" }),
    })

    render(<Home />)

    // Enter description
    const textInput = screen.getByLabelText(/Flowchart Description/i)
    await userEvent.type(textInput, "Test flowchart")

    // Click generate button
    const generateButton = screen.getByText(/Generate Flowchart/i)
    await userEvent.click(generateButton)

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument()
      expect(screen.getByText(/Server error occurred/i)).toBeInTheDocument()
    })
  })

  it("handles language switch correctly", async () => {
    render(<Home />)

    // Check initial language is English
    expect(screen.getByText(/Sentient Flowchart Generator/i)).toBeInTheDocument()

    // Click language toggle button
    const languageButton = screen.getByText(/БГ/i)
    await userEvent.click(languageButton)

    // Check language changed to Bulgarian
    expect(screen.getByText(/Генератор на интелигентни диаграми/i)).toBeInTheDocument()

    // Labels should also change
    expect(screen.getByLabelText(/Описание на диаграмата/i)).toBeInTheDocument()
  })

  it("handles download functionality", async () => {
    // Mock mermaid rendering
    const mermaid = require("mermaid")
    mermaid.run.mockImplementationOnce(({ nodes }) => {
      const div = nodes[0]
      div.innerHTML = "<svg>Mock SVG content</svg>"
    })

    // Mock API response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        mermaidCode: "graph TD\nA[Start] --> B[End]",
      }),
    })

    render(<Home />)

    // Enter description and generate
    const textInput = screen.getByLabelText(/Flowchart Description/i)
    await userEvent.type(textInput, "Test flowchart")

    const generateButton = screen.getByText(/Generate Flowchart/i)
    await userEvent.click(generateButton)

    // Wait for the flowchart to appear
    await waitFor(() => {
      expect(screen.getByText(/Download as PNG/i)).toBeInTheDocument()
    })

    // Set up mocks for download
    const mockLink = {
      href: "",
      download: "",
      click: jest.fn(),
    }

    jest.spyOn(document, "createElement").mockImplementationOnce(() => mockLink as any)

    // Click download button
    const downloadButton = screen.getByText(/Download as PNG/i)
    await userEvent.click(downloadButton)

    // Check that download was triggered
    expect(mockLink.download).toBe("flowchart.png")
    expect(mockLink.click).toHaveBeenCalled()
  })
})

