import { StreamingTextResponse, createStreamDataTransformer } from "ai"
import { OpenAI } from "openai"
import { z } from "zod"

const requestSchema = z.object({
  text: z.string().max(10000),
  prompt: z.string().min(1).max(1000),
  model: z.enum(["gpt-3.5-turbo", "gpt-4"]).default("gpt-3.5-turbo"),
})

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set. AI completions will not work.")
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set")
    }

    const body = await req.json()
    const { text, prompt, model } = requestSchema.parse(body)

    const stream = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: `You are a creative writing assistant focused on enhancing and refining text while maintaining the author's voice and intent. Your task is to:

1. Understand the user's prompt and their desired changes
2. Carefully edit the provided text to fulfill the prompt's requirements
3. Maintain the original tone and style where appropriate
4. Ensure the edits are coherent and flow naturally
5. Only output the final edited text without any explanations or metadata

Remember: Your response should contain only the edited text, nothing else.`,
        },
        {
          role: "user",
          content: `Original Text: ${text.trim()}

Editing Request: ${prompt.trim()}

Modified Text:`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    })

    const transformer = createStreamDataTransformer()
    const transformedStream = stream.pipe(transformer)

    return new StreamingTextResponse(transformedStream)
  } catch (error) {
    console.error("API Error:", error)

    let errorMessage = "An unknown error occurred"
    let statusCode = 500

    if (error instanceof z.ZodError) {
      errorMessage = "Invalid input data"
      statusCode = 400
    } else if (error instanceof Error) {
      errorMessage = error.message
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: errorMessage,
      }),
      {
        status: statusCode,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

