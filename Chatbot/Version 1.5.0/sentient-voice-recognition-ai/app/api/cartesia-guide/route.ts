import { NextResponse } from "next/server"

export async function GET() {
  const guide = {
    title: "Troubleshooting Cartesia API Output Format Issues",
    description: "A comprehensive guide to resolving output format issues with the Cartesia API",
    sections: [
      {
        title: "Common Error Messages",
        content: [
          "invalid output specification: unsupported format - The output format you specified is not supported",
          "invalid voice specification - The voice ID or mode you specified is incorrect",
          "invalid model_id - The model ID you specified is not valid",
        ],
      },
      {
        title: "Supported Output Formats",
        content: [
          "Default (no output_format specified) - Let the API choose the default format",
          "MP3: { container: 'mp3' }",
          "WAV: { container: 'wav', encoding: 'pcm_s16le', sampleRate: 44100 }",
          "WAV (float): { container: 'wav', encoding: 'pcm_f32le', sampleRate: 44100 }",
          "Raw PCM: { container: 'raw', encoding: 'pcm_f32le', sampleRate: 44100 }",
        ],
      },
      {
        title: "Parameter Naming",
        content: [
          "Use camelCase for all parameters (e.g., outputFormat, sampleRate)",
          "Don't use snake_case (e.g., output_format, sample_rate)",
        ],
      },
      {
        title: "Supported Voice IDs",
        content: [
          "Sonic (male): 79a125e8-cd45-4c13-8a67-188112f4dd22",
          "Alloy (female): b826c3a8-3e1a-4f51-9822-6960b1b89d6f",
          "Example voice ID: 694f9389-aac1-45b6-b726-9d9369183238",
        ],
      },
      {
        title: "Supported Models",
        content: [
          "sonic-2 - Latest version",
          "sonic - Original version",
          "sonic-english - English-optimized version",
          "sonic-2-english - Latest English-optimized version",
        ],
      },
      {
        title: "Troubleshooting Steps",
        content: [
          "1. Try with minimal format (no outputFormat specified)",
          "2. Test different voice IDs",
          "3. Test different model IDs",
          "4. Test different output formats",
          "5. Check API version in headers (Cartesia-Version)",
          "6. Verify API key is correct and has proper permissions",
        ],
      },
    ],
  }

  return NextResponse.json(guide)
}

