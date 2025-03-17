import { NextResponse } from "next/server"
import { cleanMermaidCode, fixMermaidSyntaxIssues } from "@/utils/mermaid-helpers"

export const runtime = "edge"

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Please provide valid Mermaid code" }, { status: 400 })
    }

    // Detailed diagnostic information
    const diagnostics = {
      originalCode: code,
      trimmedCode: code.trim(),
      firstLine: code.trim().split("\n")[0],
      startsWithGraph: code.trim().startsWith("graph "),
      startsWithFlowchart: code.trim().startsWith("flowchart "),
      codeLength: code.length,
      trimmedLength: code.trim().length,
      firstCharCode: code.charCodeAt(0),
      invisibleChars: Array.from(code)
        .slice(0, 10)
        .map((c) => c.charCodeAt(0)),
    }

    // Clean the code
    let cleanedCode = cleanMermaidCode(code)

    // Fix common syntax issues
    cleanedCode = fixMermaidSyntaxIssues(cleanedCode)

    // Ensure it starts with a valid graph declaration
    if (!cleanedCode.match(/^(graph|flowchart)\s+(TB|TD|BT|RL|LR)/i)) {
      // Try to find a valid declaration in the code
      const match = cleanedCode.match(/(graph|flowchart)\s+(TB|TD|BT|RL|LR)/i)
      if (match) {
        const declaration = match[0]
        const restOfCode = cleanedCode.replace(declaration, "").trim()
        cleanedCode = `${declaration}\n${restOfCode}`
      } else {
        // Default to graph TD if no valid declaration found
        cleanedCode = `graph TD\n${cleanedCode}`
      }
    }

    return NextResponse.json({
      diagnostics,
      cleanedCode,
      message: "Diagnostic information and cleaned code",
    })
  } catch (error: any) {
    console.error("Error in Mermaid code diagnostics:", error)
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred" },
      { status: error.status || 500 },
    )
  }
}

