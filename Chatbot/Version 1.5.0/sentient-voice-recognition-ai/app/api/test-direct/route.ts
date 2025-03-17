import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if API key is available
    if (!process.env.elevenlabs_api_key) {
      return NextResponse.json({ error: "elevenlabs_api_key is not set" }, { status: 500 })
    }

    // Voice IDs provided by the user
    const voiceId = "LruHrtVF6PSyGItzMNHS" // Benjamin
    const testText = "This is a direct test of the Benjamin voice with ID LruHrtVF6PSyGItzMNHS."

    console.log("Testing ElevenLabs API with direct voice ID")
    console.log("Voice ID:", voiceId)
    console.log("Test text:", testText)

    // ElevenLabs request body
    const requestBody = {
      text: testText,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }

    // Make the request
    const voiceResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.elevenlabs_api_key,
      },
      body: JSON.stringify(requestBody),
    })

    // Log response details
    console.log("Response status:", voiceResponse.status)
    console.log("Response headers:", Object.fromEntries([...voiceResponse.headers.entries()]))

    // Check for HTTP errors
    if (!voiceResponse.ok) {
      const errorText = await voiceResponse.text()
      console.error("Direct test HTTP error:", voiceResponse.status, errorText)

      return NextResponse.json(
        {
          success: false,
          error: `Voice synthesis failed with status ${voiceResponse.status}`,
          details: errorText,
          voiceId,
          requestBody,
        },
        { status: 500 },
      )
    }

    // Get the audio data
    const audioBuffer = await voiceResponse.arrayBuffer()
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Voice synthesis returned empty audio data",
          voiceId,
        },
        { status: 500 },
      )
    }

    // Convert to base64
    const audioBase64 = Buffer.from(audioBuffer).toString("base64")

    return NextResponse.json({
      success: true,
      message: "Direct voice test successful",
      voiceId,
      audioSize: audioBuffer.byteLength,
      contentType: voiceResponse.headers.get("content-type"),
      audioBase64,
    })
  } catch (error) {
    console.error("Direct test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Direct test failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

