import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const { prompt, language, currentCode } = await req.json()

    const { textStream } = await streamText({
      model: groq("mixtral-8x7b-32768"),
      messages: [
        {
          role: "system",
          content: `You are an AI coding assistant. Generate code in ${language} based on the user's prompt. If there's existing code, modify or extend it as requested. Always wrap code in markdown code blocks with the appropriate language syntax.`,
        },
        {
          role: "user",
          content: `Current code:\n\n${currentCode}\n\nUser request: ${prompt}`,
        },
      ],
    })

    return new Response(textStream)
  } catch (error) {
    console.error("Error in generate route:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

