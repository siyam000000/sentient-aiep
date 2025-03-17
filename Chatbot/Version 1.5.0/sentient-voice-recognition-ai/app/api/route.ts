import Groq from "groq-sdk"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { LRUCache } from "lru-cache"

// Ensure environment variables are set
if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set")
}

// Update the environment variable check
if (!process.env.elevenlabs_api_key) {
  throw new Error("elevenlabs_api_key is not set")
}

// Simple response cache with reasonable defaults
const responseCache = new LRUCache<string, { response: string; audioBase64?: string; timestamp: number }>({
  max: 100, // Store up to 100 responses
  ttl: 1000 * 60 * 60, // Cache for 1 hour
})

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Voice IDs for ElevenLabs - using the exact IDs provided by the user
const VOICE_IDS = {
  // Primary voice IDs
  male: "LruHrtVF6PSyGItzMNHS", // Benjamin
  female: "aEO01A4wXwd1O8GPgGlF", // Arabella

  // Alternative voice IDs to try if the primary ones fail
  alt_male: "TxGEqnHWrfWFTfGW9XjX", // Josh (fallback)
  alt_female: "EXAVITQu4vr4xnSDxMaL", // Bella (fallback)
}

// Default fallback model
const FALLBACK_MODEL = "llama3-8b-8192"

// Sanitize input to prevent issues
function sanitizeInput(input: string): string {
  return input.trim().slice(0, 300) // Limit input length for faster processing
}

// Generate a cache key from the input, voice type, and model
function getCacheKey(input: string, voiceType: string, modelType: string): string {
  return `${input.toLowerCase().trim()}:${voiceType}:${modelType}`
}

// Get system prompt for consistent, clear responses
function getSystemPrompt() {
  return `You are a helpful AI assistant. Respond briefly and clearly in 1-2 sentences. Be direct and concise. User location is ${location()}. The current time is ${time()}.`
}

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const formData = await request.formData()
    const rawInput = formData.get("input")
    const voiceType = (formData.get("voiceType") as string) || "male"
    const modelType = (formData.get("modelType") as string) || "gemma2-9b-it"

    // Input validation
    if (!rawInput || typeof rawInput !== "string") {
      return NextResponse.json({ error: "Input is required" }, { status: 400 })
    }

    const input = sanitizeInput(rawInput)
    const cacheKey = getCacheKey(input, voiceType, modelType)

    // Check cache
    const cachedResponse = responseCache.get(cacheKey)
    if (cachedResponse) {
      console.log("Cache hit for:", input)
      return NextResponse.json({
        response: cachedResponse.response,
        audioBase64: cachedResponse.audioBase64,
        voiceType,
        voiceId: voiceType === "female" ? VOICE_IDS.female : VOICE_IDS.male,
        modelType,
        fromCache: true,
        responseTime: Date.now() - startTime,
      })
    }

    // Get the correct voice ID
    const primaryVoiceId = voiceType === "female" ? VOICE_IDS.female : VOICE_IDS.male
    const alternativeVoiceId = voiceType === "female" ? VOICE_IDS.alt_female : VOICE_IDS.alt_male

    // Generate AI response
    let response: string
    let completion: any // Declare completion variable
    try {
      console.time("groq_api_call")
      console.log(`Using model: ${modelType}`)

      // Use the selected model
      completion = await groq.chat.completions.create({
        model: modelType, // Use the model selected by the user
        messages: [
          {
            role: "system",
            content: getSystemPrompt(),
          },
          {
            role: "user",
            content: input,
          },
        ],
        max_tokens: 75, // Reduced for faster responses
        temperature: 0.5, // Lower temperature for more deterministic responses
      })

      console.timeEnd("groq_api_call")
      response = completion.choices[0].message.content
    } catch (error) {
      console.error(`Error with model ${modelType}:`, error)

      // Fallback to default model if selected model fails
      try {
        console.log(`Trying fallback model ${FALLBACK_MODEL}`)
        const fallbackCompletion = await groq.chat.completions.create({
          model: FALLBACK_MODEL,
          messages: [
            {
              role: "system",
              content: getSystemPrompt(),
            },
            {
              role: "user",
              content: input,
            },
          ],
          max_tokens: 75,
          temperature: 0.5,
        })
        response = fallbackCompletion.choices[0].message.content
      } catch (fallbackError) {
        console.error("Fallback model error:", fallbackError)
        return NextResponse.json(
          {
            error: "Failed to generate AI response",
            details: error instanceof Error ? error.message : String(error),
            responseTime: Date.now() - startTime,
          },
          { status: 500 },
        )
      }
    }

    // Try voice synthesis with ElevenLabs
    async function tryVoiceSynthesis(voiceId: string, isAlternative = false) {
      console.time(`elevenlabs_api_call_${isAlternative ? "alternative" : "primary"}`)

      // Check if ElevenLabs API key is available
      if (!process.env.elevenlabs_api_key) {
        throw new Error("elevenlabs_api_key is not set or is invalid")
      }

      // ElevenLabs request body
      const requestBody = {
        text: response,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }

      // Log the request to help with debugging
      console.log(
        `Sending request to ElevenLabs API with ${isAlternative ? "alternative" : "primary"} voice ID:`,
        voiceId,
      )
      console.log("Request body:", JSON.stringify(requestBody, null, 2))

      const voiceResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.elevenlabs_api_key,
        },
        body: JSON.stringify(requestBody),
      })

      // Check for HTTP errors
      if (!voiceResponse.ok) {
        const errorText = await voiceResponse.text()
        console.error(
          `Voice synthesis HTTP error (${isAlternative ? "alternative" : "primary"} voice):`,
          voiceResponse.status,
          errorText,
        )

        // Try to parse the error response if it's JSON
        let parsedError = errorText
        try {
          const errorJson = JSON.parse(errorText)
          parsedError = JSON.stringify(errorJson, null, 2)
        } catch (e) {
          // If it's not JSON, use the raw text
        }

        throw new Error(`Voice synthesis failed with status ${voiceResponse.status}: ${parsedError}`)
      }

      // Check if response is empty
      const audioBuffer = await voiceResponse.arrayBuffer()
      if (!audioBuffer || audioBuffer.byteLength === 0) {
        console.error(`Voice synthesis returned empty response (${isAlternative ? "alternative" : "primary"} voice)`)
        throw new Error("Voice synthesis returned empty audio data")
      }

      console.timeEnd(`elevenlabs_api_call_${isAlternative ? "alternative" : "primary"}`)
      console.log(
        `Voice synthesis successful with ${isAlternative ? "alternative" : "primary"} voice, audio size:`,
        audioBuffer.byteLength,
        "bytes",
      )

      // Convert to base64
      return Buffer.from(audioBuffer).toString("base64")
    }

    try {
      // Try primary voice ID first
      let audioBase64: string
      try {
        audioBase64 = await tryVoiceSynthesis(primaryVoiceId, false)
      } catch (primaryError) {
        console.error("Primary voice synthesis failed, trying alternative voice:", primaryError)
        // If primary voice fails, try alternative voice
        audioBase64 = await tryVoiceSynthesis(alternativeVoiceId, true)
      }

      // Cache the full response with audio
      responseCache.set(cacheKey, {
        response,
        audioBase64,
        timestamp: Date.now(),
      })

      return NextResponse.json({
        response,
        audioBase64,
        voiceType,
        voiceId: primaryVoiceId,
        modelType,
        responseTime: Date.now() - startTime,
      })
    } catch (error) {
      console.error("All voice synthesis attempts failed:", error)

      // Cache the text response
      responseCache.set(cacheKey, {
        response,
        timestamp: Date.now(),
      })

      // Return text response if voice synthesis fails
      return NextResponse.json(
        {
          response,
          error: "Voice synthesis failed, but text response is available",
          details: error instanceof Error ? error.message : String(error),
          responseTime: Date.now() - startTime,
        },
        { status: 206 }, // Partial content
      )
    }
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
        responseTime: Date.now() - startTime,
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

