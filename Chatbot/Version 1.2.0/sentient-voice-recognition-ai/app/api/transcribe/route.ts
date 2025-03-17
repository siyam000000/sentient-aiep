import { NextResponse } from "next/server"
import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json()

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
    })

    const response = completion.choices[0].message.content

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error processing transcript:", error)
    return NextResponse.json({ error: "Failed to process transcript" }, { status: 500 })
  }
}

