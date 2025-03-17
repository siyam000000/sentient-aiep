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

    console.log("Creating chat completion with Llama 3.3 70B")
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert coding assistant powered by Llama 3.3, specialized in providing high-quality code solutions. Provide clear, efficient, and well-documented code examples. When sharing code, always use markdown code blocks with the appropriate language syntax. Explain complex concepts in simple terms and suggest best practices. Focus on writing maintainable, efficient, and secure code.",
        },
        ...messages,
      ],
      model: "llama-3.3-70b-versatile", // Updated to the correct model name
      temperature: 0.3,
      max_tokens: 2000,
      top_p: 0.95,
      stream: false,
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

