import Groq from "groq-sdk"
import { headers } from "next/headers"
import { z } from "zod"
import { zfd } from "zod-form-data"

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set")
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const schema = zfd.formData({
  input: zfd.text(),
  message: zfd.repeatableOfType(
    zfd.json(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    ),
  ),
})

export async function POST(request: Request) {
  const startTime = Date.now()
  try {
    console.log("API request started")

    const formData = await request.formData()
    console.log("Received form data:", Object.fromEntries(formData.entries()))

    const { data, success } = schema.safeParse(formData)
    if (!success) {
      console.error("Invalid request:", data.error)
      return new Response("Invalid request: " + JSON.stringify(data.error), { status: 400 })
    }

    console.log("User input:", data.input)
    console.log("Text completion started")

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: `You are a helpful voice assistant. Respond briefly and conversationally. The user's location is ${location()}. The current time is ${time()}.`,
        },
        ...data.message,
        {
          role: "user",
          content: data.input,
        },
      ],
    })

    const response = completion.choices[0].message.content
    console.log("AI Response:", response)

    const endTime = Date.now()
    const totalTime = endTime - startTime
    console.log(`Total processing time: ${totalTime}ms`)

    return new Response(response, {
      headers: {
        "X-Processing-Time": totalTime.toString(),
      },
    })
  } catch (error) {
    console.error("Internal server error:", error)
    return new Response("Internal server error: " + (error instanceof Error ? error.message : String(error)), {
      status: 500,
    })
  }
}

function location() {
  const headersList = headers()

  const country = headersList.get("x-vercel-ip-country")
  const region = headersList.get("x-vercel-ip-country-region")
  const city = headersList.get("x-vercel-ip-city")

  if (!country || !region || !city) return "unknown"

  return `${city}, ${region}, ${country}`
}

function time() {
  return new Date().toLocaleString("en-US", {
    timeZone: headers().get("x-vercel-ip-timezone") || undefined,
  })
}

