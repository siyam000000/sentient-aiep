/**
 * Utility functions for improving accessibility
 */

/**
 * Announces a message to screen readers using ARIA live regions
 * @param message The message to announce
 * @param priority The announcement priority (polite or assertive)
 */
export function announceToScreenReader(message: string, priority: "polite" | "assertive" = "polite"): void {
  // Create or get the live region element
  let liveRegion = document.getElementById(`aria-live-${priority}`)

  if (!liveRegion) {
    liveRegion = document.createElement("div")
    liveRegion.id = `aria-live-${priority}`
    liveRegion.setAttribute("aria-live", priority)
    liveRegion.setAttribute("aria-relevant", "additions")
    liveRegion.setAttribute("aria-atomic", "true")
    liveRegion.className = "sr-only" // Visually hidden but available to screen readers
    document.body.appendChild(liveRegion)
  }

  // Update the live region with the new message
  liveRegion.textContent = message

  // Clear the message after a delay to prevent repeated announcements
  setTimeout(() => {
    liveRegion.textContent = ""
  }, 3000)
}

/**
 * Focuses the first focusable element within a container
 * @param containerId The ID of the container element
 */
export function focusFirstElement(containerId: string): void {
  const container = document.getElementById(containerId)
  if (!container) return

  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )

  if (focusableElements.length > 0) {
    ;(focusableElements[0] as HTMLElement).focus()
  }
}

/**
 * Traps focus within a container (for modals, dialogs, etc.)
 * @param containerId The ID of the container element
 * @returns A cleanup function to remove the event listener
 */
export function trapFocus(containerId: string): () => void {
  const container = document.getElementById(containerId)
  if (!container) return () => {}

  const focusableElements = Array.from(
    container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
  ) as HTMLElement[]

  if (focusableElements.length === 0) return () => {}

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return

    if (e.shiftKey) {
      // If shift + tab and on first element, move to last element
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      // If tab and on last element, move to first element
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }

  document.addEventListener("keydown", handleKeyDown)

  // Return cleanup function
  return () => {
    document.removeEventListener("keydown", handleKeyDown)
  }
}

