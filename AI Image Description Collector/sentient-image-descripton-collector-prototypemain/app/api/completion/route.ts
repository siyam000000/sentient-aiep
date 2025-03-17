import { OpenAIStream, StreamingTextResponse } from "ai"
import OpenAI from "openai"

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt || typeof prompt !== "string") {
      return new Response("Invalid request: prompt is required", { status: 400 })
    }

    // Check file size (roughly 4.5MB in base64)
    if (prompt.length > 6_464_471) {
      return new Response("Image too large, maximum file size is 4.5MB.", { status: 400 })
    }

    // Use OpenAI's GPT-4 Vision model
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      max_tokens: 300,
      stream: true,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Begin each of the following with a triangle symbol (▲ U+25B2): First, a brief description of the image to be used as alt text. Do not describe or extract text in the description. Second, the text extracted from the image, with newlines where applicable. If there is no text in the image, only respond with the description. Do not include any other information.",
            },
            {
              type: "image_url",
              image_url: {
                url: prompt,
              },
            },
          ],
        },
      ],
    })

    // Convert the response to a streaming response
    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error("Error processing image:", error)
    return new Response("Error processing image. Please try again later.", { status: 500 })
  }
}

