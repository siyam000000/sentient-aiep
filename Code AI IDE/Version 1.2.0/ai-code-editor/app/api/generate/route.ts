import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const { prompt, language, currentCode } = await req.json()

    const { textStream } = await streamText({
      model: groq("llama-3.3-70b-versatile"), // Updated to the correct model name
      messages: [
        {
          role: "system",
          content: `You are an expert coding assistant powered by Llama 3.3, specialized in ${language} development. Generate high-quality, efficient, and well-documented code based on the user's prompt. If there's existing code, modify or extend it as requested. Always wrap code in markdown code blocks with the appropriate language syntax. Focus on writing maintainable, efficient, and secure code.`,
        },
        {
          role: "user",
          content: `Current code:\n\n${currentCode}\n\nUser request: ${prompt}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 2000,
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

