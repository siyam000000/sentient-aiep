import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Check if API key is available
    if (!process.env.elevenlabs_api_key) {
      return NextResponse.json({ error: "elevenlabs_api_key is not set" }, { status: 500 })
    }

    // Parse request body
    const { voiceId, text } = await request.json()

    if (!voiceId || !text) {
      return NextResponse.json({ error: "voiceId and text are required" }, { status: 400 })
    }

    // ElevenLabs request body
    const requestBody = {
      text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }

    console.log("Testing voice:", voiceId)
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
      console.error("Voice test HTTP error:", voiceResponse.status, errorText)

      return NextResponse.json(
        {
          error: `Voice synthesis test failed with status ${voiceResponse.status}`,
          details: errorText,
          requestBody: requestBody,
          voiceId,
        },
        { status: 500 },
      )
    }

    // Check if response is empty
    const audioBuffer = await voiceResponse.arrayBuffer()
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      return NextResponse.json(
        {
          error: "Voice synthesis test returned empty audio data",
          voiceId,
        },
        { status: 500 },
      )
    }

    // Convert to base64
    const audioBase64 = Buffer.from(audioBuffer).toString("base64")

    return NextResponse.json({
      success: true,
      message: "Voice test successful",
      audioSize: audioBuffer.byteLength,
      contentType: voiceResponse.headers.get("content-type"),
      voiceId,
      audioBase64,
    })
  } catch (error) {
    console.error("Voice test error:", error)
    return NextResponse.json(
      {
        error: "Voice test failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

