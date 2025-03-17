import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { token } = await request.json()

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 })
  }

  // In a real-world scenario, you would securely store the token here
  // For this example, we'll just simulate storing it
  console.log("Token received:", token)

  return NextResponse.json({ success: true })
}

