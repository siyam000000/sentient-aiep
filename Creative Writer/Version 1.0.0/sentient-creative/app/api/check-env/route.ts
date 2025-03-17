import { NextResponse } from "next/server"

export async function GET() {
  try {
    const isReady = !!process.env.OPENAI_API_KEY
    if (!isReady) {
      console.warn("OPENAI_API_KEY is not set in the environment.")
    }
    return NextResponse.json({ isReady })
  } catch (error) {
    console.error("Error checking environment:", error)
    return NextResponse.json({ isReady: false, error: "Failed to check environment" }, { status: 500 })
  }
}

