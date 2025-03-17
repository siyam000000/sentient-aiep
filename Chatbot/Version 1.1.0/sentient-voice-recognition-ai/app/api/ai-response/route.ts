import { NextResponse } from "next/server"
import Groq from "groq-sdk"

// Check if the API key is set
if (!process.env.GROQ_API_KEY) {
  console.error("GROQ_API_KEY is not set in the environment variables")
  throw new Error("GROQ_API_KEY is not set")
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  console.log("AI response route hit")
  try {
    const body = await req.json()
    const { transcript } = body

    if (!transcript) {
      console.error("Transcript is missing in the request body")
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 })
    }

    console.log("Sending request to Groq API")
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant. Respond concisely and accurately to the user's input.",
        },
        {
          role: "user",
          content: transcript,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    })

    console.log("Received response from Groq API")

    if (!completion.choices || completion.choices.length === 0) {
      console.error("Empty response from Groq API")
      return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
    }

    const response = completion.choices[0].message.content

    if (!response) {
      console.error("Empty message content from Groq API")
      return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
    }

    console.log("Sending successful response")
    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error in AI response:", error)
    // Log the full error object for debugging
    console.error(JSON.stringify(error, null, 2))
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

