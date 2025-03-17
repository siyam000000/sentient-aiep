import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if API key is available
    if (!process.env.elevenlabs_api_key) {
      return NextResponse.json({ error: "elevenlabs_api_key is not set" }, { status: 500 })
    }

    // Log the API key length (don't log the actual key for security)
    console.log("ElevenLabs API key length:", process.env.elevenlabs_api_key.length)

    // Simple test message
    const testMessage = "This is a test of the ElevenLabs voice synthesis system."

    // Update the voice IDs to the exact ones provided by the user
    const voiceIds = {
      benjamin: "LruHrtVF6PSyGItzMNHS",
      arabella: "aEO01A4wXwd1O8GPgGlF",
    }

    // Use Benjamin as the test voice
    const voiceId = voiceIds.benjamin

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
    console.log("Voice ID:", voiceId)
    console.log("API URL:", `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`)

    // First, let's check if we can access the voices endpoint to verify API key works
    console.log("Testing ElevenLabs API key with voices endpoint...")
    const voicesResponse = await fetch("https://api.elevenlabs.io/v1/voices", {
      method: "GET",
      headers: {
        "xi-api-key": process.env.elevenlabs_api_key,
      },
    })

    if (!voicesResponse.ok) {
      const voicesErrorText = await voicesResponse.text()
      console.error("Voices API error:", voicesResponse.status, voicesErrorText)
      return NextResponse.json(
        {
          error: "Failed to access ElevenLabs voices API",
          status: voicesResponse.status,
          details: voicesErrorText,
        },
        { status: 500 },
      )
    }

    const voicesData = await voicesResponse.json()
    console.log("Voices API response successful. Found", voicesData.voices?.length || 0, "voices")

    // Now let's try the text-to-speech endpoint
    console.log("Testing text-to-speech endpoint...")
    const voiceResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.elevenlabs_api_key,
      },
      body: JSON.stringify(requestBody),
    })

    // Log the response status and headers
    console.log("TTS Response status:", voiceResponse.status)
    console.log("TTS Response headers:", Object.fromEntries([...voiceResponse.headers.entries()]))

    // Check for HTTP errors
    if (!voiceResponse.ok) {
      const errorText = await voiceResponse.text()
      console.error("Voice test HTTP error:", voiceResponse.status, errorText)

      // Try to parse the error response if it's JSON
      let parsedError = errorText
      try {
        const errorJson = JSON.parse(errorText)
        parsedError = JSON.stringify(errorJson, null, 2)
      } catch (e) {
        // If it's not JSON, use the raw text
      }

      return NextResponse.json(
        {
          error: `Voice synthesis test failed with status ${voiceResponse.status}`,
          details: parsedError,
          requestBody: requestBody,
          voiceId: voiceId,
          availableVoices:
            voicesData.voices?.map((v: any) => ({
              voice_id: v.voice_id,
              name: v.name,
            })) || [],
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
          voiceId: voiceId,
          availableVoices:
            voicesData.voices?.map((v: any) => ({
              voice_id: v.voice_id,
              name: v.name,
            })) || [],
        },
        { status: 500 },
      )
    }

    console.log("Successfully received audio data, size:", audioBuffer.byteLength, "bytes")

    // Convert to base64
    const audioBase64 = Buffer.from(audioBuffer).toString("base64")

    return NextResponse.json({
      success: true,
      message: "ElevenLabs voice synthesis test successful",
      audioSize: audioBuffer.byteLength,
      contentType: voiceResponse.headers.get("content-type"),
      voiceId: voiceId,
      availableVoices:
        voicesData.voices?.map((v: any) => ({
          voice_id: v.voice_id,
          name: v.name,
        })) || [],
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

