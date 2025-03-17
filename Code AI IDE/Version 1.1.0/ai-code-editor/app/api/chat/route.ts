import { Groq } from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  console.log("Chat API route called")

  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is not set")
    return new Response(JSON.stringify({ error: "GROQ_API_KEY is not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const { messages } = await req.json()
    console.log("Received messages:", JSON.stringify(messages))

    if (!messages || !Array.isArray(messages)) {
      console.error("Invalid messages format")
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log("Creating chat completion")
    const chatCompletion = await groq.chat.completions.create({
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
    })

    const content = chatCompletion.choices[0]?.message?.content

    if (!content) {
      console.error("Empty response from AI")
      return new Response(JSON.stringify({ error: "Empty response from AI" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log("Returning AI response")
    return new Response(JSON.stringify({ content }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error in chat route:", error)
    return new Response(JSON.stringify({ error: `${error instanceof Error ? error.message : String(error)}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

