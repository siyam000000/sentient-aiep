"use client"
import { render, screen, fireEvent } from "@testing-library/react"
import { EnhancedButton } from "@/components/enhanced-button"
import { describe, it, expect, jest } from "@jest/globals"

// Mock Loader2 icon for testing
jest.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader-icon">Loading...</div>,
}))

describe("EnhancedButton", () => {
  it("renders correctly with children", () => {
    render(<EnhancedButton>Test Button</EnhancedButton>)
    expect(screen.getByText("Test Button")).toBeInTheDocument()
  })

  it("shows loading state when isLoading is true", () => {
    render(
      <EnhancedButton isLoading loadingText="Loading...">
        Test Button
      </EnhancedButton>,
    )
    expect(screen.getByText("Loading...")).toBeInTheDocument()
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument()
    expect(screen.queryByText("Test Button")).not.toBeInTheDocument()
  })

  it("renders icon when provided", () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>
    render(<EnhancedButton icon={<TestIcon />}>Test Button</EnhancedButton>)

    expect(screen.getByTestId("test-icon")).toBeInTheDocument()
    expect(screen.getByText("Test Button")).toBeInTheDocument()
  })

  it("calls onClick handler when clicked", () => {
    const handleClick = jest.fn()
    render(<EnhancedButton onClick={handleClick}>Test Button</EnhancedButton>)

    fireEvent.click(screen.getByText("Test Button"))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("is disabled when isLoading is true", () => {
    render(
      <EnhancedButton isLoading loadingText="Loading...">
        Test Button
      </EnhancedButton>,
    )

    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
  })

  it("applies custom className", () => {
    render(<EnhancedButton className="custom-class">Test Button</EnhancedButton>)

    const button = screen.getByRole("button")
    expect(button.className).toContain("custom-class")
  })

  it("passes through additional HTML attributes", () => {
    render(
      <EnhancedButton data-testid="test-button" aria-label="Test button">
        Test Button
      </EnhancedButton>,
    )

    const button = screen.getByTestId("test-button")
    expect(button).toHaveAttribute("aria-label", "Test button")
  })

  it("should handle empty children", () => {
    render(<EnhancedButton>{""}</EnhancedButton>)

    // Should render without crashing
    const button = screen.getByRole("button")
    expect(button).toBeInTheDocument()
  })

  it("should handle null or undefined inputs without crashing", () => {
    render(
      <EnhancedButton icon={null} loadingText={undefined}>
        Test Button
      </EnhancedButton>,
    )

    expect(screen.getByText("Test Button")).toBeInTheDocument()
  })
})

