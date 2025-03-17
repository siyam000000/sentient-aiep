import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if API key is available
    if (!process.env.elevenlabs_api_key) {
      return NextResponse.json({ error: "elevenlabs_api_key is not set" }, { status: 500 })
    }

    // Simple test message
    const testMessage = "This is a test of the ElevenLabs voice synthesis system."

    // Griffin voice ID
    const voiceId = "MF3mGyEYCl7XYWbV9V6O"

    // ElevenLabs request body
    const requestBody = {
      text: testMessage,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }

    console.log("Testing ElevenLabs API")
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
        },
        { status: 500 },
      )
    }

    // Check if response is empty
    const audioBuffer = await voiceResponse.arrayBuffer()
    if (!audioBuffer || audioBuffer.byteLength === 0) {
      return NextResponse.json({ error: "Voice synthesis test returned empty audio data" }, { status: 500 })
    }

    // Convert to base64
    const audioBase64 = Buffer.from(audioBuffer).toString("base64")

    return NextResponse.json({
      success: true,
      message: "ElevenLabs voice synthesis test successful",
      audioSize: audioBuffer.byteLength,
      audioBase64,
    })
  } catch (error) {
    console.error("Voice test error:", error)
    return NextResponse.json(
      {
        error: "Voice synthesis test failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

