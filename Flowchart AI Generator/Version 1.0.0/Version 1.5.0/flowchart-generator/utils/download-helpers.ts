import html2canvas from "html2canvas"

/**
 * Downloads a Mermaid diagram as a PNG image
 * @param element The HTML element containing the diagram
 * @param filename The filename for the downloaded image
 * @returns Promise<boolean> indicating success or failure
 */
export async function downloadMermaidDiagram(element: HTMLElement, filename = "flowchart.png"): Promise<boolean> {
  try {
    if (!element) {
      throw new Error("Diagram element not found")
    }

    // Set background to white for the export
    const originalBackground = element.style.background
    element.style.background = "white"

    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      backgroundColor: "#ffffff",
      logging: false,
      allowTaint: true,
      useCORS: true,
    })

    // Restore original background
    element.style.background = originalBackground

    // Create download link
    const dataUrl = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = filename
    link.click()

    return true
  } catch (error) {
    console.error("Error downloading diagram:", error)
    return false
  }
}

/**
 * Finds the Mermaid diagram element within a container
 * @param container The container element to search within
 * @returns The diagram element or null if not found
 */
export function findMermaidElement(container: HTMLElement | null): HTMLElement | null {
  if (!container) return null

  // Try to find the SVG element first (rendered diagram)
  const svg = container.querySelector("svg")
  if (svg) return svg.parentElement as HTMLElement

  // If no SVG, try to find the mermaid div
  const mermaidDiv = container.querySelector(".mermaid")
  return mermaidDiv as HTMLElement
}

