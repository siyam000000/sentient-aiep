import { type NextRequest, NextResponse } from "next/server"
import { Groq } from "groq-sdk"

const groq = new Groq()

export async function POST(req: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "Groq API key is not set" }, { status: 500 })
  }

  try {
    const { text, temperature, model, maxTokens, customInstructions } = await req.json()

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: customInstructions || "You are a helpful AI assistant that edits and improves text.",
        },
        {
          role: "user",
          content: `Please edit and improve the following text:\n\n${text}\n\nProvide your reasoning for the changes.`,
        },
      ],
      model: model,
      temperature: temperature,
      max_tokens: maxTokens,
    })

    const result = completion.choices[0]?.message?.content || ""

    return NextResponse.json({ result })
  } catch (error) {
    console.error("Error in Groq API:", error)
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
  }
}

