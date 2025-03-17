import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if API key is available
    if (!process.env.elevenlabs_api_key) {
      return NextResponse.json({ error: "elevenlabs_api_key is not set" }, { status: 500 })
    }

    // Fetch available voices from ElevenLabs
    const voicesResponse = await fetch("https://api.elevenlabs.io/v1/voices", {
      method: "GET",
      headers: {
        "xi-api-key": process.env.elevenlabs_api_key,
      },
    })

    if (!voicesResponse.ok) {
      const errorText = await voicesResponse.text()
      return NextResponse.json(
        {
          error: `Failed to fetch voices with status ${voicesResponse.status}`,
          details: errorText,
        },
        { status: 500 },
      )
    }

    const voicesData = await voicesResponse.json()

    // Return the list of voices
    return NextResponse.json({
      success: true,
      voices: voicesData.voices,
    })
  } catch (error) {
    console.error("Error fetching voices:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch voices",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

