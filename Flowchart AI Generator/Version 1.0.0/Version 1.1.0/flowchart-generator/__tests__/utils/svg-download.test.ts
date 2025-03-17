import { downloadSvgAsPng, findSvgElement } from "@/utils/svg-download"
import { describe, it, expect, jest, beforeEach } from "@jest/globals"

describe("SVG Download Utilities", () => {
  beforeEach(() => {
    // Mock necessary browser APIs
    global.URL.createObjectURL = jest.fn(() => "blob:mock-url")
    global.URL.revokeObjectURL = jest.fn()

    // Mock canvas and context
    const mockContext = {
      fillStyle: "",
      fillRect: jest.fn(),
      scale: jest.fn(),
      drawImage: jest.fn(),
    }

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: jest.fn(() => mockContext),
      toDataURL: jest.fn(() => "data:image/png;base64,mockdata"),
    }

    jest.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "canvas") return mockCanvas as unknown as HTMLCanvasElement
      if (tag === "a") {
        return {
          href: "",
          download: "",
          click: jest.fn(),
        } as unknown as HTMLAnchorElement
      }
      return document.createElement(tag)
    })

    // Mock Image constructor
    global.Image = jest.fn(() => ({
      crossOrigin: null,
      onload: null,
      onerror: null,
      src: "",
    })) as any

    // Mock XMLSerializer
    global.XMLSerializer = jest.fn(() => ({
      serializeToString: jest.fn(() => "<svg></svg>"),
    })) as any
  })

  it("should find SVG element within container", () => {
    // Create a container with an SVG
    const container = document.createElement("div")
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    container.appendChild(svg)

    const result = findSvgElement(container)
    expect(result).toBe(svg)
  })

  it("should return null when no SVG is found", () => {
    const container = document.createElement("div")
    const result = findSvgElement(container)
    expect(result).toBeNull()
  })

  it("should handle null container", () => {
    const result = findSvgElement(null)
    expect(result).toBeNull()
  })

  it("should download SVG as PNG", async () => {
    // Create an SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")

    // Mock getBoundingClientRect
    svg.getBoundingClientRect = jest.fn(() => ({
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      toJSON: jest.fn(),
    }))

    // Start the download
    const downloadPromise = downloadSvgAsPng(svg)

    // Simulate image load
    const img = new Image()
    ;(img.onload as any)()

    const result = await downloadPromise
    expect(result).toBe(true)

    // Check that link was created and clicked
    expect(document.createElement).toHaveBeenCalledWith("a")
    const link = document.createElement("a")
    expect(link.download).toBe("flowchart.png")
    expect(link.click).toHaveBeenCalled()
  })
})

