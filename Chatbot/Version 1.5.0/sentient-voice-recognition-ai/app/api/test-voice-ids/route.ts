import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if Cartesia API key is available
    if (!process.env.CARTESIA_API_KEY) {
      return NextResponse.json({ error: "CARTESIA_API_KEY is not set" }, { status: 500 })
    }

    // Simple test message
    const testMessage = "This is a test of different voice IDs."

    // Try different voice IDs
    const voiceIds = [
      "79a125e8-cd45-4c13-8a67-188112f4dd22", // Sonic (male) - our current ID
      "694f9389-aac1-45b6-b726-9d9369183238", // From the example code
      "b826c3a8-3e1a-4f51-9822-6960b1b89d6f", // Alloy (female) - our current ID
      "21m00Tcm4TlvDq8ikWAM", // Another ID to try
      "MF3mGyEYCl7XYWbV9V6O", // Another ID to try
    ]

    const results = []

    for (const voiceId of voiceIds) {
      console.log(`Testing voice ID: ${voiceId}`)

      // Use minimal request format
      const requestBody = {
        modelId: "sonic-2",
        transcript: testMessage,
        voice: {
          mode: "id",
          id: voiceId,
        },
        // No output format specified
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
              voiceId,
              status: "success",
              audioSize: audioBuffer.byteLength,
            })

            // We found a working voice ID, return it
            const audioBase64 = Buffer.from(audioBuffer).toString("base64")
            return NextResponse.json({
              success: true,
              message: `Found working voice ID: ${voiceId}`,
              voiceId,
              audioSize: audioBuffer.byteLength,
              audioBase64,
            })
          } else {
            results.push({
              voiceId,
              status: "empty response",
            })
          }
        } else {
          const errorText = await voiceResponse.text()
          results.push({
            voiceId,
            status: "error",
            statusCode: voiceResponse.status,
            error: errorText,
          })
        }
      } catch (error) {
        results.push({
          voiceId,
          status: "exception",
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // If we get here, none of the voice IDs worked
    return NextResponse.json({
      success: false,
      message: "No working voice IDs found",
      results,
    })
  } catch (error) {
    console.error("Voice ID test error:", error)
    return NextResponse.json(
      {
        error: "Voice ID test failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

