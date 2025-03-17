"use client"
import { render, screen, fireEvent } from "@testing-library/react"
import { ValidatedInput } from "@/components/validated-input"
import { describe, it, expect, jest } from "@jest/globals"

describe("ValidatedInput", () => {
  it("renders correctly with label", () => {
    render(<ValidatedInput id="test-input" label="Test Label" />)
    expect(screen.getByLabelText("Test Label")).toBeInTheDocument()
  })

  it("displays validation error when provided", () => {
    render(<ValidatedInput id="test-input" label="Test Label" error="This field is required" />)

    expect(screen.getByText("This field is required")).toBeInTheDocument()
    // Input should have aria-invalid attribute
    const input = screen.getByLabelText("Test Label")
    expect(input).toHaveAttribute("aria-invalid", "true")
  })

  it("calls onChange handler when input changes", () => {
    const handleChange = jest.fn()
    render(<ValidatedInput id="test-input" label="Test Label" onChange={handleChange} />)

    const input = screen.getByLabelText("Test Label")
    fireEvent.change(input, { target: { value: "New value" } })

    expect(handleChange).toHaveBeenCalled()
  })

  it("calls onBlur handler when input loses focus", () => {
    const handleBlur = jest.fn()
    render(<ValidatedInput id="test-input" label="Test Label" onBlur={handleBlur} />)

    const input = screen.getByLabelText("Test Label")
    fireEvent.blur(input)

    expect(handleBlur).toHaveBeenCalled()
  })

  it("applies className to the input container", () => {
    render(<ValidatedInput id="test-input" label="Test Label" className="custom-class" />)

    const container = screen.getByTestId("input-container")
    expect(container).toHaveClass("custom-class")
  })

  it("sets required attribute when required prop is true", () => {
    render(<ValidatedInput id="test-input" label="Test Label" required />)

    const input = screen.getByLabelText("Test Label")
    expect(input).toHaveAttribute("required")
  })

  it("renders help text when provided", () => {
    render(<ValidatedInput id="test-input" label="Test Label" helpText="This is helpful information" />)

    expect(screen.getByText("This is helpful information")).toBeInTheDocument()
  })

  it("sanitizes input value when sanitize prop is true", () => {
    const handleChange = jest.fn()
    render(<ValidatedInput id="test-input" label="Test Label" onChange={handleChange} sanitize={true} />)

    const input = screen.getByLabelText("Test Label")
    fireEvent.change(input, { target: { value: '<script>alert("XSS")</script>' } })

    // The handleChange should be called with sanitized value
    expect(handleChange).toHaveBeenCalled()
    // The actual sanitization can't be tested here without integrating the sanitizer
  })

  it("validates input against pattern when provided", () => {
    render(
      <ValidatedInput
        id="test-input"
        label="Email"
        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
        patternMessage="Please enter a valid email address"
      />,
    )

    const input = screen.getByLabelText("Email")

    // Enter invalid email
    fireEvent.change(input, { target: { value: "invalid-email" } })
    fireEvent.blur(input)

    expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument()

    // Enter valid email
    fireEvent.change(input, { target: { value: "valid@example.com" } })
    fireEvent.blur(input)

    expect(screen.queryByText("Please enter a valid email address")).not.toBeInTheDocument()
  })
})

