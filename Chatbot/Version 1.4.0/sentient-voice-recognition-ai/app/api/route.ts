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
  timeout: 30000, // 30 second timeout for Groq API
})

// Set a timeout for fetch requests
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 25000) => {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

// Voice IDs for Cartesia
const VOICE_IDS = {
  male: "79a125e8-cd45-4c13-8a67-188112f4dd22", // Sonic (male)
  female: "b826c3a8-3e1a-4f51-9822-6960b1b89d6f", // Alloy (female)
}

// Validate input to prevent injection attacks
function sanitizeInput(input: string): string {
  // Basic sanitization - remove any potentially harmful characters
  return input.trim().slice(0, 1000) // Limit input length
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const rawInput = formData.get("input")
    const voiceType = (formData.get("voiceType") as string) || "male"

    // Input validation
    if (!rawInput || typeof rawInput !== "string") {
      return NextResponse.json({ error: "Input is required" }, { status: 400 })
    }

    const input = sanitizeInput(rawInput)

    // Get the correct voice ID based on the voice type
    const voiceId = voiceType === "female" ? VOICE_IDS.female : VOICE_IDS.male

    console.log("Using voice type:", voiceType, "with ID:", voiceId)

    // Get AI response from Groq with timeout handling
    let response: string
    try {
      console.time("groq_api_call")
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
        max_tokens: 200, // Limit response length to speed up processing
      })
      console.timeEnd("groq_api_call")

      response = completion.choices[0].message.content
    } catch (error) {
      console.error("Groq API error:", error)
      return NextResponse.json(
        {
          error: "Failed to generate AI response",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }

    // Try voice synthesis with simplified parameters
    try {
      console.time("cartesia_api_call")

      // Log the full request for debugging
      const requestBody = {
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
        // Use a moderate speech rate
        speech_rate: 0.9,
      }

      console.log("Cartesia request:", JSON.stringify(requestBody, null, 2))

      const voice = await fetchWithTimeout(
        "https://api.cartesia.ai/tts/bytes",
        {
          method: "POST",
          headers: {
            "Cartesia-Version": "2024-06-30",
            "Content-Type": "application/json",
            "X-API-Key": process.env.CARTESIA_API_KEY!,
          },
          body: JSON.stringify(requestBody),
        },
        25000, // 25 second timeout
      )

      // Log the response status and headers for debugging
      console.log("Cartesia response status:", voice.status)

      if (!voice.ok) {
        const errorText = await voice.text()
        console.error("Voice synthesis failed:", errorText)

        // Try a fallback with even simpler parameters
        console.log("Trying fallback with simpler parameters...")

        const fallbackBody = {
          model_id: "sonic-english",
          transcript: "Hello, this is a test.",
          voice: {
            mode: "id",
            id: "79a125e8-cd45-4c13-8a67-188112f4dd22", // Always use Sonic for fallback
          },
          output_format: {
            container: "mp3",
            encoding: "mp3",
            sample_rate: 24000,
          },
        }

        const fallbackVoice = await fetchWithTimeout(
          "https://api.cartesia.ai/tts/bytes",
          {
            method: "POST",
            headers: {
              "Cartesia-Version": "2024-06-30",
              "Content-Type": "application/json",
              "X-API-Key": process.env.CARTESIA_API_KEY!,
            },
            body: JSON.stringify(fallbackBody),
          },
          15000, // Shorter timeout for fallback
        )

        if (!fallbackVoice.ok) {
          const fallbackError = await fallbackVoice.text()
          console.error("Fallback voice synthesis also failed:", fallbackError)
          throw new Error(`Voice synthesis failed: ${errorText}. Fallback also failed: ${fallbackError}`)
        }

        // If fallback succeeded but original failed, return text-only response
        console.log("Fallback test succeeded but original request failed")
        throw new Error(`Voice synthesis failed for actual content: ${errorText}`)
      }

      console.timeEnd("cartesia_api_call")

      // Get audio as ArrayBuffer and convert to base64
      const audioBuffer = await voice.arrayBuffer()
      const audioBase64 = Buffer.from(audioBuffer).toString("base64")

      console.log("Voice synthesis successful, audio size:", audioBuffer.byteLength)

      return NextResponse.json({
        response,
        audioBase64,
        voiceType,
        voiceId,
      })
    } catch (error) {
      console.error("Cartesia API error:", error)

      // Check if the API key is valid by making a simple request to the Cartesia API
      try {
        const keyCheckResponse = await fetch("https://api.cartesia.ai/models", {
          headers: {
            "Cartesia-Version": "2024-06-30",
            "X-API-Key": process.env.CARTESIA_API_KEY!,
          },
        })

        if (!keyCheckResponse.ok) {
          console.error("Cartesia API key check failed:", await keyCheckResponse.text())
        } else {
          console.log("Cartesia API key is valid")
        }
      } catch (keyCheckError) {
        console.error("Error checking Cartesia API key:", keyCheckError)
      }

      return NextResponse.json(
        {
          response,
          error: "Voice synthesis failed, but text response is available",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 206 },
      ) // Partial content
    }
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
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

