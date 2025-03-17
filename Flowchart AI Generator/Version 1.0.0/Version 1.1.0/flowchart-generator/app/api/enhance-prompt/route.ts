import { NextResponse } from "next/server"
import { callClaudeAPI } from "@/services/claude-api"

export const runtime = "edge"

function limitWordCount(text: string, maxWords: number): string {
  const words = text.split(/\s+/)
  if (words.length <= maxWords) return text
  return words.slice(0, maxWords).join(" ") + "..."
}

export async function POST(request: Request) {
  try {
    const { input } = await request.json()

    if (!input || typeof input !== "string") {
      return NextResponse.json({ error: "Please provide a valid description" }, { status: 400 })
    }

    try {
      const userPrompt = `Enhance this prompt to create a flowchart: "${input}". The enhanced prompt should focus on enhancing the prompt. Always start with 'Create a flowchart of' if it's not already present. Make it structured and detailed, suitable for generating a clear and informative flowchart. Limit the response to 30 words maximum.`

      const systemPrompt =
        "You are an AI assistant specialized in creating prompts for flowchart generation. Your task is to enhance user inputs to create clear, structured prompts that always begin with 'Create a flowchart of' and focus for enhancing prompts. Limit the enhanced prompt to a maximum of 30 words."

      const data = await callClaudeAPI(userPrompt, systemPrompt, 100)
      let enhancedPrompt = data.content[0].text.trim()

      // Ensure the enhanced prompt starts with "Create a flowchart of"
      if (!enhancedPrompt.startsWith("Create a flowchart of")) {
        enhancedPrompt = `Create a flowchart of ${enhancedPrompt}`
      }

      // Limit the word count
      enhancedPrompt = limitWordCount(enhancedPrompt, 30)

      if (!enhancedPrompt) {
        throw new Error("No enhanced prompt generated")
      }

      return NextResponse.json({ enhancedPrompt })
    } catch (error: any) {
      if (error.message === "Request timed out") {
        return NextResponse.json({ error: "Request timed out" }, { status: 504 })
      }
      throw error
    }
  } catch (error: any) {
    console.error("Error in prompt enhancement:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}

