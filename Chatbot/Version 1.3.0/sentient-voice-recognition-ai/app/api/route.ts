import Groq from "groq-sdk"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set")
}

if (!process.env.CARTESIA_API_KEY) {
  throw new Error("CARTESIA_API_KEY is not set")
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const input = formData.get("input") as string
    const voiceId = (formData.get("voiceId") as string) || "79a125e8-cd45-4c13-8a67-188112f4dd22" // Default to male voice

    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 })
    }

    // Get AI response from Groq
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant. Respond briefly and conversationally. User location is ${location()}. The current time is ${time()}.`,
        },
        {
          role: "user",
          content: input,
        },
      ],
    })

    const response = completion.choices[0].message.content

    // Get voice from Cartesia
    const voice = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      headers: {
        "Cartesia-Version": "2024-06-30",
        "Content-Type": "application/json",
        "X-API-Key": process.env.CARTESIA_API_KEY!,
      },
      body: JSON.stringify({
        model_id: "sonic-english",
        transcript: response,
        voice: {
          mode: "id",
          id: voiceId,
        },
        output_format: {
          container: "mp3",
          encoding: "mp3",
          sample_rate: 24000,
        },
      }),
    })

    if (!voice.ok) {
      console.error(await voice.text())
      return NextResponse.json({ error: "Voice synthesis failed" }, { status: 500 })
    }

    // Get audio as ArrayBuffer and convert to base64
    const audioBuffer = await voice.arrayBuffer()
    const audioBase64 = Buffer.from(audioBuffer).toString("base64")

    return NextResponse.json({
      response,
      audioBase64,
      voiceId,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function location() {
  const headersList = headers()
  const country = headersList.get("x-vercel-ip-country")
  const region = headersList.get("x-vercel-ip-country-region")
  const city = headersList.get("x-vercel-ip-city")
  return country && region && city ? `${city}, ${region}, ${country}` : "unknown"
}

function time() {
  return new Date().toLocaleString("en-US", {
    timeZone: headers().get("x-vercel-ip-timezone") || undefined,
  })
}

