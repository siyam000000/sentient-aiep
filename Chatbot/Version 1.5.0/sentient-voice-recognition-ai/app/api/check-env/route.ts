import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if API key is available
    const hasElevenLabsKey = !!process.env.elevenlabs_api_key
    const keyLength = hasElevenLabsKey ? process.env.elevenlabs_api_key!.length : 0

    return NextResponse.json({
      success: true,
      hasElevenLabsKey,
      keyLength,
      keyFirstChar: hasElevenLabsKey && keyLength > 0 ? process.env.elevenlabs_api_key![0] : null,
      keyLastChar: hasElevenLabsKey && keyLength > 0 ? process.env.elevenlabs_api_key![keyLength - 1] : null,
    })
  } catch (error) {
    console.error("Error checking environment:", error)
    return NextResponse.json(
      {
        error: "Failed to check environment",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

