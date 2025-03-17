import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if Cartesia API key is available
    if (!process.env.CARTESIA_API_KEY) {
      return NextResponse.json({ error: "CARTESIA_API_KEY is not set" }, { status: 500 })
    }

    // Simple test message
    const testMessage = "This is a simple test of the voice synthesis system."

    // Use the correct parameter naming format (camelCase) as shown in the example
    const requestBody = {
      modelId: "sonic-2",
      transcript: testMessage,
      voice: {
        mode: "id",
        id: "79a125e8-cd45-4c13-8a67-188112f4dd22", // Sonic (male) voice ID
      },
      outputFormat: {
        container: "wav",
        encoding: "pcm_f32le",
        sampleRate: 44100,
      },
    }

    console.log("Testing Cartesia API with simplified request")
    console.log("Request body:", JSON.stringify(requestBody, null, 2))

    const voiceResponse = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      headers: {
        "Cartesia-Version": "2024-06-10",
        "Content-Type": "application/json",
        "X-API-Key": process.env.CARTESIA_API_KEY,
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
      message: "Voice synthesis test successful",
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

