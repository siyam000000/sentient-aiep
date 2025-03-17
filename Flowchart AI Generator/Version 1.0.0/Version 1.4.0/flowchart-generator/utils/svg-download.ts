/**
 * Downloads an SVG element as a PNG image
 * @param svgElement The SVG element to download
 * @param filename The filename for the downloaded image
 * @returns Promise<boolean> indicating success or failure
 */
export async function downloadSvgAsPng(svgElement: SVGElement, filename = "flowchart.png"): Promise<boolean> {
  try {
    if (!svgElement) {
      throw new Error("SVG element not found")
    }

    // Get SVG dimensions
    const svgRect = svgElement.getBoundingClientRect()
    const width = svgRect.width
    const height = svgRect.height

    // Create a canvas element
    const canvas = document.createElement("canvas")
    canvas.width = width * 2 // Higher resolution
    canvas.height = height * 2
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("Failed to get canvas context")
    }

    // Set white background
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Scale for higher resolution
    ctx.scale(2, 2)

    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const svgUrl = URL.createObjectURL(svgBlob)

    // Create image from SVG
    const img = new Image()
    img.crossOrigin = "anonymous"

    // Return a promise that resolves when the image is loaded and drawn
    return new Promise((resolve) => {
      img.onload = () => {
        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0)

        // Convert canvas to data URL and trigger download
        const dataUrl = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.href = dataUrl
        link.download = filename
        link.click()

        // Clean up
        URL.revokeObjectURL(svgUrl)

        resolve(true)
      }

      img.onerror = () => {
        console.error("Error loading SVG image")
        URL.revokeObjectURL(svgUrl)
        resolve(false)
      }

      img.src = svgUrl
    })
  } catch (error) {
    console.error("Error downloading SVG:", error)
    return false
  }
}

/**
 * Finds the SVG element within a container
 * @param container The container element to search within
 * @returns The SVG element or null if not found
 */
export function findSvgElement(container: HTMLElement | null): SVGElement | null {
  if (!container) return null
  return container.querySelector("svg")
}

