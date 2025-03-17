import { Groq } from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export const runtime = "edge"

export async function POST(req: Request) {
  console.log("Chat API route called")

  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is not set")
    return new Response("GROQ_API_KEY is not set", { status: 500 })
  }

  try {
    const { messages } = await req.json()
    console.log("Received messages:", JSON.stringify(messages))

    if (!messages || !Array.isArray(messages)) {
      console.error("Invalid messages format")
      return new Response("Invalid messages format", { status: 400 })
    }

    console.log("Creating chat completion")
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an AI coding assistant. Provide helpful, concise, and accurate coding advice. When sharing code, use markdown code blocks with the appropriate language syntax.",
        },
        ...messages,
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.5,
      max_tokens: 1000,
      top_p: 1,
      stream: true,
    })

    console.log("Chat completion created, setting up stream")
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || ""
            controller.enqueue(content)
          }
          controller.close()
        } catch (error) {
          console.error("Error in stream processing:", error)
          controller.error(error)
        }
      },
    })

    console.log("Returning stream response")
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error) {
    console.error("Error in chat route:", error)
    return new Response(`Internal Server Error: ${error instanceof Error ? error.message : String(error)}`, {
      status: 500,
    })
  }
}

