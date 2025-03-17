import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    // In a production environment, you would securely store the API key
    // For this example, we'll just simulate storing it
    console.log("Claude API key received:", apiKey)

    // You might want to validate the API key here before saving it

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error setting API key:", error)
    return NextResponse.json({ error: "Failed to set API key" }, { status: 500 })
  }
}

