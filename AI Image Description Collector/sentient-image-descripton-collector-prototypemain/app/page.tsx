"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [description, setDescription] = useState<string>("")
  const [extractedText, setExtractedText] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImageUpload(file: File) {
    if (!file) return

    // Check file size (4.5MB limit)
    if (file.size > 4.5 * 1024 * 1024) {
      alert("Image too large (max 4.5MB)")
      return
    }

    // Check file type
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      alert("Unsupported format. Only JPEG, PNG, GIF, and WEBP files are supported.")
      return
    }

    try {
      setIsLoading(true)
      setDescription("")
      setExtractedText("")

      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file)
      setImageUrl(objectUrl)

      // Convert file to base64
      const base64 = await toBase64(file)

      // Send to API
      const response = await fetch("/api/completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: base64 }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      // Process the streaming response
      const reader = response.body?.getReader()
      if (!reader) throw new Error("Failed to get response reader")

      let result = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Convert the Uint8Array to a string
        const chunk = new TextDecoder().decode(value)
        result += chunk

        // Split by the triangle symbol
        const parts = result.split("▲").filter(Boolean)
        if (parts.length > 0) setDescription(parts[0].trim())
        if (parts.length > 1) setExtractedText(parts[1].trim())
      }
    } catch (error) {
      console.error("Error processing image:", error)
      alert("Failed to process image. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleImageUpload(file)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files[0]
    if (file) handleImageUpload(file)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard")
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
        Sentient Image Description Collector
      </h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {imageUrl ? (
            <div className="relative w-full h-64 mb-4">
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt="Uploaded image"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xl mb-2">Drop image here</p>
              <p className="text-gray-400">or click to upload</p>
              <p className="mt-4 text-sm text-gray-500">(JPEG, PNG, GIF, WEBP - max 4.5MB)</p>
            </div>
          )}

          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/jpeg, image/png, image/gif, image/webp"
          />
        </div>

        {/* Results Area */}
        <div className="bg-gray-900 rounded-lg p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-300">Description</h2>
                  {description && (
                    <button
                      onClick={() => copyToClipboard(description)}
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      Copy
                    </button>
                  )}
                </div>
                {description ? (
                  <p className="text-white">{description}</p>
                ) : (
                  <p className="text-gray-500 italic">Upload an image to get a description</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-300">Extracted Text</h2>
                  {extractedText && (
                    <button
                      onClick={() => copyToClipboard(extractedText)}
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      Copy
                    </button>
                  )}
                </div>
                {extractedText ? (
                  <p className="text-white whitespace-pre-wrap">{extractedText}</p>
                ) : (
                  <p className="text-gray-500 italic">
                    {description ? "No text found in image" : "Upload an image to extract text"}
                  </p>
                )}
              </div>

              {(description || extractedText) && (
                <button
                  onClick={() => copyToClipboard(`${description}\n\n${extractedText}`)}
                  className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-white transition-colors"
                >
                  Copy All
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>
          <a href="https://github.com/petroff69" className="text-gray-400 hover:text-white">
            sentient-ai
          </a>{" "}
          /
          <a href="https://zlatimir-petroff-portfolio.vercel.app/" className="text-gray-400 hover:text-white ml-1">
            zlatimir petrov
          </a>
        </p>
        <p className="mt-1">Built with Vercel AI SDK & OpenAI • 2024-2025</p>
      </footer>
    </div>
  )
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (typeof reader.result !== "string") return reject("Failed to convert to base64")
      resolve(reader.result)
    }
    reader.onerror = (error) => reject(error)
  })
}

