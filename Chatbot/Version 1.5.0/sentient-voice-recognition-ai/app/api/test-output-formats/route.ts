import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if Cartesia API key is available
    if (!process.env.CARTESIA_API_KEY) {
      return NextResponse.json({ error: "CARTESIA_API_KEY is not set" }, { status: 500 })
    }

    // Simple test message
    const testMessage = "This is a test of different output formats."

    // Voice ID for testing (Sonic - male)
    const voiceId = "79a125e8-cd45-4c13-8a67-188112f4dd22"

    // Test different output formats with correct camelCase naming
    const outputFormats = [
      { container: "wav", encoding: "pcm_f32le", sampleRate: 44100 },
      { container: "wav", encoding: "pcm_s16le", sampleRate: 44100 },
      { container: "mp3" },
      { container: "wav" },
      { container: "raw", encoding: "pcm_f32le", sampleRate: 44100 },
    ]

    const results = []

    for (const outputFormat of outputFormats) {
      console.log(`Testing output format:`, outputFormat)

      // Use the correct parameter naming format (camelCase) as shown in the example
      const requestBody = {
        modelId: "sonic-2",
        transcript: testMessage,
        voice: {
          mode: "id",
          id: voiceId,
        },
        outputFormat: outputFormat,
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
              outputFormat,
              status: "success",
              audioSize: audioBuffer.byteLength,
            })

            // We found a working format, return it
            const audioBase64 = Buffer.from(audioBuffer).toString("base64")
            return NextResponse.json({
              success: true,
              message: `Found working output format: ${JSON.stringify(outputFormat)}`,
              outputFormat,
              audioSize: audioBuffer.byteLength,
              audioBase64,
            })
          } else {
            results.push({
              outputFormat,
              status: "empty response",
            })
          }
        } else {
          const errorText = await voiceResponse.text()
          results.push({
            outputFormat,
            status: "error",
            statusCode: voiceResponse.status,
            error: errorText,
          })
        }
      } catch (error) {
        results.push({
          outputFormat,
          status: "exception",
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // If we get here, none of the formats worked
    return NextResponse.json({
      success: false,
      message: "No working output formats found",
      results,
    })
  } catch (error) {
    console.error("Output format test error:", error)
    return NextResponse.json(
      {
        error: "Output format test failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

