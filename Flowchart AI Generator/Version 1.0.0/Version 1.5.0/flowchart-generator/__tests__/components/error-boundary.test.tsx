import { render, screen } from "@testing-library/react"
import { ErrorBoundary } from "@/components/error-boundary"
import { describe, it, expect, jest } from "@jest/globals"

// We need to mock console.error to avoid polluting test output
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

// Component that throws an error
const ErrorThrowingComponent = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error("Test error")
  }
  return <div>No error</div>
}

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <div>Test content</div>
      </ErrorBoundary>,
    )

    expect(screen.getByText("Test content")).toBeInTheDocument()
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument()
  })

  it("renders fallback UI when an error occurs", () => {
    // We need to mock console.error because React will log the error
    const spy = jest.spyOn(console, "error")
    spy.mockImplementation(() => {})

    render(
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <ErrorThrowingComponent />
      </ErrorBoundary>,
    )

    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    spy.mockRestore()
  })

  it("calls onError when provided", () => {
    const handleError = jest.fn()
    const spy = jest.spyOn(console, "error")
    spy.mockImplementation(() => {})

    render(
      <ErrorBoundary fallback={<div>Error occurred</div>} onError={handleError}>
        <ErrorThrowingComponent />
      </ErrorBoundary>,
    )

    expect(handleError).toHaveBeenCalled()
    expect(handleError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object))
    spy.mockRestore()
  })

  it("resets the error state when receiving new children", () => {
    const spy = jest.spyOn(console, "error")
    spy.mockImplementation(() => {})

    const { rerender } = render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <ErrorThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText("Error occurred")).toBeInTheDocument()

    // Rerender with a component that doesn't throw
    rerender(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <ErrorThrowingComponent shouldThrow={false} />
      </ErrorBoundary>,
    )

    // Should reset and render children again
    expect(screen.getByText("No error")).toBeInTheDocument()
    expect(screen.queryByText("Error occurred")).not.toBeInTheDocument()

    spy.mockRestore()
  })

  it("provides error details when renderError function is used", () => {
    const spy = jest.spyOn(console, "error")
    spy.mockImplementation(() => {})

    render(
      <ErrorBoundary
        renderError={(error, errorInfo) => (
          <div>
            <h1>Custom Error UI</h1>
            <p>{error.message}</p>
            <pre>{errorInfo.componentStack}</pre>
          </div>
        )}
      >
        <ErrorThrowingComponent />
      </ErrorBoundary>,
    )

    expect(screen.getByText("Custom Error UI")).toBeInTheDocument()
    expect(screen.getByText("Test error")).toBeInTheDocument()

    spy.mockRestore()
  })
})

