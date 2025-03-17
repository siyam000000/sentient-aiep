import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if API key is available
    if (!process.env.elevenlabs_api_key) {
      return NextResponse.json({ error: "elevenlabs_api_key is not set" }, { status: 500 })
    }

    // Simple test message
    const testMessage = "This is a test of the ElevenLabs voice synthesis system using Arabella and Benjamin voices."

    // Voice IDs for Arabella and Benjamin - using the exact IDs provided by the user
    const voiceIds = {
      benjamin: "LruHrtVF6PSyGItzMNHS",
      arabella: "aEO01A4wXwd1O8GPgGlF",
    }

    // Test results for each voice
    const results = []

    // Test each voice
    for (const [name, voiceId] of Object.entries(voiceIds)) {
      console.log(`Testing ${name} voice with ID: ${voiceId}`)

      // ElevenLabs request body
      const requestBody = {
        text: `This is a test of the ${name} voice.`,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }

      try {
        const voiceResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": process.env.elevenlabs_api_key,
          },
          body: JSON.stringify(requestBody),
        })

        if (voiceResponse.ok) {
          const audioBuffer = await voiceResponse.arrayBuffer()
          if (audioBuffer && audioBuffer.byteLength > 0) {
            // Convert to base64
            const audioBase64 = Buffer.from(audioBuffer).toString("base64")

            results.push({
              name,
              voiceId,
              status: "success",
              audioSize: audioBuffer.byteLength,
              audioBase64,
            })
          } else {
            results.push({
              name,
              voiceId,
              status: "empty response",
            })
          }
        } else {
          const errorText = await voiceResponse.text()
          results.push({
            name,
            voiceId,
            status: "error",
            statusCode: voiceResponse.status,
            error: errorText,
          })
        }
      } catch (error) {
        results.push({
          name,
          voiceId,
          status: "exception",
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Check if any voices succeeded
    const successfulVoices = results.filter((result) => result.status === "success")

    if (successfulVoices.length > 0) {
      return NextResponse.json({
        success: true,
        message: `Successfully tested ${successfulVoices.length} voices`,
        results,
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "No voices were successfully tested",
        results,
      })
    }
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

