import { NextResponse } from "next/server"
import Groq from "groq-sdk"

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set")
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { input } = await req.json()

    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 })
    }

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: input },
      ],
      max_tokens: 150,
      temperature: 0.7,
    })

    const response = completion.choices[0].message.content

    if (!response) {
      return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error in AI response:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

