import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if Cartesia API key is available
    if (!process.env.CARTESIA_API_KEY) {
      return NextResponse.json({ error: "CARTESIA_API_KEY is not set" }, { status: 500 })
    }

    // Simple test message
    const testMessage = "This is a test of the voice synthesis system."

    // Voice ID for testing (Sonic - male)
    const voiceId = "79a125e8-cd45-4c13-8a67-188112f4dd22"

    // Try different model IDs
    const modelIds = ["sonic-2", "sonic", "sonic-english", "sonic-2-english"]

    const results = []

    for (const modelId of modelIds) {
      console.log(`Testing model: ${modelId}`)

      // Use the correct parameter naming format (camelCase) as shown in the example
      const requestBody = {
        modelId: modelId,
        transcript: testMessage,
        voice: {
          mode: "id",
          id: voiceId,
        },
        outputFormat: {
          container: "wav",
          encoding: "pcm_f32le",
          sampleRate: 44100,
        },
      }

      try {
        const voiceResponse = await fetch("https://api.cartesia.ai/tts/bytes", {
          method: "POST",
          headers: {
            "Cartesia-Version": "2024-06-10",
            "Content-Type": "application/json",
            "X-API-Key": process.env.CARTESIA_API_KEY,
          },
          body: JSON.stringify(requestBody),
        })

        if (voiceResponse.ok) {
          const audioBuffer = await voiceResponse.arrayBuffer()
          if (audioBuffer && audioBuffer.byteLength > 0) {
            results.push({
              modelId,
              status: "success",
              audioSize: audioBuffer.byteLength,
            })

            // We found a working model, return it
            const audioBase64 = Buffer.from(audioBuffer).toString("base64")
            return NextResponse.json({
              success: true,
              message: `Found working model: ${modelId}`,
              modelId,
              audioSize: audioBuffer.byteLength,
              audioBase64,
            })
          } else {
            results.push({
              modelId,
              status: "empty response",
            })
          }
        } else {
          const errorText = await voiceResponse.text()
          results.push({
            modelId,
            status: "error",
            statusCode: voiceResponse.status,
            error: errorText,
          })
        }
      } catch (error) {
        results.push({
          modelId,
          status: "exception",
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // If we get here, none of the models worked
    return NextResponse.json({
      success: false,
      message: "No working models found",
      results,
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

