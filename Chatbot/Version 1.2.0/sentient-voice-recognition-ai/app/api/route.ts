import Groq from "groq-sdk"
import { headers } from "next/headers"

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
    const voiceId = formData.get("voiceId") as string

    if (!input) {
      return new Response(JSON.stringify({ error: "Input is required" }), { status: 400 })
    }

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
          container: "raw",
          encoding: "pcm_f32le",
          sample_rate: 24000,
        },
      }),
    })

    if (!voice.ok) {
      console.error(await voice.text())
      return new Response(JSON.stringify({ error: "Voice synthesis failed" }), { status: 500 })
    }

    const audioBuffer = await voice.arrayBuffer()
    const audioBase64 = Buffer.from(audioBuffer).toString("base64")

    return new Response(JSON.stringify({ response, audioBase64 }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 })
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

