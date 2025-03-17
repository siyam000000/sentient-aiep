"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"

export default function TestElevenLabs() {
  const [loading, setLoading] = useState(false)
  const [voices, setVoices] = useState<any[]>([])
  const [selectedVoice, setSelectedVoice] = useState("")
  const [testText, setTestText] = useState("This is a test of the ElevenLabs voice synthesis system.")
  const [audioSrc, setAudioSrc] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Fetch available voices
  useEffect(() => {
    async function fetchVoices() {
      try {
        const response = await fetch("/api/elevenlabs-voices")
        const data = await response.json()

        if (data.success && data.voices) {
          setVoices(data.voices)
          if (data.voices.length > 0) {
            setSelectedVoice(data.voices[0].voice_id)
          }
        } else {
          toast.error("Failed to fetch voices")
          setDebugInfo(data)
        }
      } catch (error) {
        console.error("Error fetching voices:", error)
        toast.error("Error fetching voices")
      }
    }

    fetchVoices()
  }, [])

  // Run diagnostic test
  const runDiagnostic = async () => {
    setLoading(true)
    setAudioSrc("")
    setDebugInfo(null)

    try {
      const response = await fetch("/api/elevenlabs-debug")
      const data = await response.json()

      setDebugInfo(data)

      if (data.success && data.audioBase64) {
        setAudioSrc(`data:audio/mpeg;base64,${data.audioBase64}`)
        toast.success("Diagnostic test successful")
      } else {
        toast.error("Diagnostic test failed")
      }
    } catch (error) {
      console.error("Error running diagnostic:", error)
      toast.error("Error running diagnostic")
    } finally {
      setLoading(false)
    }
  }

  // Test specific voice
  const testVoice = async () => {
    if (!selectedVoice) {
      toast.error("Please select a voice")
      return
    }

    setLoading(true)
    setAudioSrc("")

    try {
      const response = await fetch("/api/test-voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voiceId: selectedVoice,
          text: testText,
        }),
      })

      const data = await response.json()
      setDebugInfo(data)

      if (data.success && data.audioBase64) {
        setAudioSrc(`data:audio/mpeg;base64,${data.audioBase64}`)
        toast.success("Voice test successful")
      } else {
        toast.error("Voice test failed")
      }
    } catch (error) {
      console.error("Error testing voice:", error)
      toast.error("Error testing voice")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">ElevenLabs Integration Test</h1>

      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Diagnostic Test</h2>
        <button
          onClick={runDiagnostic}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Running..." : "Run Diagnostic Test"}
        </button>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Voice Test</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Voice</label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded"
            disabled={loading || voices.length === 0}
          >
            {voices.length === 0 && <option>No voices available</option>}
            {voices.map((voice) => (
              <option key={voice.voice_id} value={voice.voice_id}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Test Text</label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded"
            rows={3}
            disabled={loading}
          />
        </div>

        <button
          onClick={testVoice}
          disabled={loading || !selectedVoice}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Voice"}
        </button>
      </div>

      {/* Add specific voices section */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Test Specific Voices</h2>
        <p className="mb-4">Test Arabella and Benjamin voices specifically</p>
        <button
          onClick={async () => {
            setLoading(true)
            try {
              const response = await fetch("/api/test-specific-voices")
              const data = await response.json()
              setDebugInfo(data)

              if (data.success) {
                toast.success("Specific voices test completed")
                // If we have audio for Benjamin, set it as the current audio
                const benjaminResult = data.results.find((r) => r.name === "benjamin" && r.status === "success")
                if (benjaminResult && benjaminResult.audioBase64) {
                  setAudioSrc(`data:audio/mpeg;base64,${benjaminResult.audioBase64}`)
                }
              } else {
                toast.error("Specific voices test failed")
              }
            } catch (error) {
              console.error("Error testing specific voices:", error)
              toast.error("Error testing specific voices")
            } finally {
              setLoading(false)
            }
          }}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Arabella & Benjamin"}
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

