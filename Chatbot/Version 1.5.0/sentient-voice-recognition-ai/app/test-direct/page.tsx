"use client"

import { useState } from "react"
import { toast } from "sonner"

export default function TestDirect() {
  const [loading, setLoading] = useState(false)
  const [audioSrc, setAudioSrc] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const runDirectTest = async () => {
    setLoading(true)
    setAudioSrc("")
    setDebugInfo(null)

    try {
      const response = await fetch("/api/test-direct")
      const data = await response.json()

      setDebugInfo(data)

      if (data.success && data.audioBase64) {
        setAudioSrc(`data:audio/mpeg;base64,${data.audioBase64}`)
        toast.success("Direct test successful")
      } else {
        toast.error("Direct test failed")
      }
    } catch (error) {
      console.error("Error running direct test:", error)
      toast.error("Error running direct test")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Direct Voice ID Test</h1>
      <p className="mb-4">This page tests the Benjamin voice ID directly: LruHrtVF6PSyGItzMNHS</p>

      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <button
          onClick={runDirectTest}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Testing..." : "Run Direct Test"}
        </button>
      </div>

      {audioSrc && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Audio Result</h2>
          <audio controls className="w-full" src={audioSrc} />
        </div>
      )}

      {debugInfo && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
          <pre className="bg-gray-900 p-4 rounded overflow-auto max-h-96 text-sm">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

