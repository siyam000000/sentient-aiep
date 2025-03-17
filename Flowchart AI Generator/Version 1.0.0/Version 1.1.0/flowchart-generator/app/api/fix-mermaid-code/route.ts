import { NextResponse } from "next/server"
import { validateAndCorrectMermaidCode } from "@/services/flowchart-validator"
import { cleanMermaidCode, fixMermaidSyntaxIssues } from "@/utils/mermaid-helpers"

export const runtime = "edge"

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Please provide valid Mermaid code" }, { status: 400 })
    }

    // Clean the code by removing markdown code block markers
    const cleanedCode = cleanMermaidCode(code)

    // Fix common syntax issues like reserved keywords
    const fixedSyntaxCode = fixMermaidSyntaxIssues(cleanedCode)

    // Use the validator service to fix the code
    const result = await validateAndCorrectMermaidCode(fixedSyntaxCode)

    if (result.error && !result.wasFixed) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      fixedCode: result.correctedCode,
      wasFixed: result.wasFixed || fixedSyntaxCode !== cleanedCode,
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

