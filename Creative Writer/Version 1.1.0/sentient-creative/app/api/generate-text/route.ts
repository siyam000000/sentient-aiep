import { type NextRequest, NextResponse } from "next/server"
import { Groq } from "groq-sdk"

const groq = new Groq()

export async function POST(req: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    console.error("Groq API key is not set")
    return NextResponse.json({ error: "Groq API key is not set" }, { status: 500 })
  }

  try {
    const { prompt, text, temperature, maxTokens } = await req.json()

    if (!prompt || !text) {
      console.error("Missing required fields: prompt or text")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Sending request to Groq API with:", { prompt, textLength: text.length, temperature, maxTokens })

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant that edits and improves text.",
        },
        {
          role: "user",
          content: `Please edit and improve the following text based on this prompt: ${prompt}\n\nText: ${text}\n\nEdited Text:`,
        },
      ],
      model: "mixtral-8x7b-32768",
      temperature: temperature,
      max_tokens: maxTokens,
    })

    const result = completion.choices[0]?.message?.content || ""

    console.log("Received response from Groq API:", { resultLength: result.length })

    return NextResponse.json({ result })
  } catch (error: any) {
    console.error("Error in Groq API:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred while processing your request" },
      { status: 500 },
    )
  }
}

