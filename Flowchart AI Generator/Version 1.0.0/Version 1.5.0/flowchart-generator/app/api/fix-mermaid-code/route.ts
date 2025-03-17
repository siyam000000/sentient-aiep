import { NextResponse } from "next/server"
import { validateAndCorrectMermaidCode } from "@/services/flowchart-validator"
import { cleanMermaidCode, fixMermaidSyntaxIssues } from "@/utils/mermaid-helpers"

export const runtime = "edge"

/**
 * POST handler for fixing Mermaid code
 */
export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Please provide valid Mermaid code" }, { status: 400 })
    }

    // Clean the code by removing markdown code block markers and fixing formatting issues
    let cleanedCode = cleanMermaidCode(code)

    // Apply basic syntax fixes
    cleanedCode = fixMermaidSyntaxIssues(cleanedCode)

    // Use the validator service to fix the code
    const result = await validateAndCorrectMermaidCode(cleanedCode)

    if (result.error && !result.wasFixed) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      fixedCode: result.correctedCode,
      wasFixed: result.wasFixed,
      message: result.wasFixed ? "Mermaid code was fixed" : "Code was already valid",
    })
  } catch (error: any) {
    console.error("Error fixing Mermaid code:", error)
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: error.status || 500 },
    )
  }
}

