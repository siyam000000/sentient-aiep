import { test, expect } from "@playwright/test"

test.describe("Flowchart Generator E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Go to the application
    await page.goto("/")
  })

  test("page loads with all key elements", async ({ page }) => {
    // Check title
    await expect(page.locator("h1")).toContainText("Sentient Flowchart Generator")

    // Check that main UI elements are present
    await expect(page.getByLabel("Flowchart Description")).toBeVisible()
    await expect(page.getByRole("button", { name: "Generate Flowchart" })).toBeEnabled()
    await expect(page.getByRole("button", { name: "Enhance Prompt" })).toBeEnabled()
  })

  test("generates a flowchart successfully", async ({ page }) => {
    // Mock API response
    await page.route("/api/generate-flowchart", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          mermaidCode: "graph TD\nA[Start] --> B[Process] --> C[End]",
        }),
      })
    })

    // Input description
    await page.getByLabel("Flowchart Description").fill("Test flowchart generation")

    // Click generate button
    await page.getByRole("button", { name: "Generate Flowchart" }).click()

    // Wait for the flowchart to be rendered
    await expect(page.locator(".mermaid")).toBeVisible()

    // Check for the download buttons to verify successful generation
    await expect(page.getByRole("button", { name: "Download as PNG" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Copy Code" })).toBeVisible()
  })

  test("enhances a prompt correctly", async ({ page }) => {
    // Mock API response
    await page.route("/api/enhance-prompt", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          enhancedPrompt: "Create a flowchart of user authentication process",
        }),
      })
    })

    // Input description
    await page.getByLabel("Flowchart Description").fill("login process")

    // Click enhance button
    await page.getByRole("button", { name: "Enhance Prompt" }).click()

    // Wait for the enhanced prompt
    await expect(page.getByText("Enhanced Prompt:")).toBeVisible()
    await expect(page.getByText("Create a flowchart of user authentication process")).toBeVisible()

    // Use the enhanced prompt
    await page.getByRole("button", { name: "Use Enhanced Prompt" }).click()

    // Check that the input was updated
    await expect(page.getByLabel("Flowchart Description")).toHaveValue(
      "Create a flowchart of user authentication process",
    )
  })

  test("shows appropriate error when API fails", async ({ page }) => {
    // Mock API error response
    await page.route("/api/generate-flowchart", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Server error occurred",
        }),
      })
    })

    // Input description
    await page.getByLabel("Flowchart Description").fill("Test flowchart generation")

    // Click generate button
    await page.getByRole("button", { name: "Generate Flowchart" }).click()

    // Check for error message
    await expect(page.getByText("Error")).toBeVisible()
    await expect(page.getByText("Server error occurred")).toBeVisible()
  })

  test("changes language correctly", async ({ page }) => {
    // Check initial state (English)
    await expect(page.locator("h1")).toContainText("Sentient Flowchart Generator")

    // Click language toggle
    await page.getByRole("button", { name: "БГ" }).click()

    // Check Bulgarian text
    await expect(page.locator("h1")).toContainText("Генератор на интелигентни диаграми")

    // Check that form elements are translated
    await expect(page.getByLabel("Описание на диаграмата")).toBeVisible()
    await expect(page.getByRole("button", { name: "Генерирай диаграма" })).toBeVisible()
  })

  test("opens settings modal", async ({ page }) => {
    // Click settings button
    await page.getByLabel("Open Settings").click()

    // Check modal appears
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.getByText("Settings")).toBeVisible()
    await expect(page.getByLabel("Claude API Key")).toBeVisible()

    // Close the modal
    await page.keyboard.press("Escape")

    // Check modal is closed
    await expect(page.getByRole("dialog")).not.toBeVisible()
  })
})

