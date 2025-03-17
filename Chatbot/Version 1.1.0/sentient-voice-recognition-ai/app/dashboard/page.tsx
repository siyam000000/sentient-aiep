import VoiceRecognition from "@/components/Dashboard/VoiceRecognition"
import AnalyticsChart from "@/components/Dashboard/AnalyticsChart"
import ConversationHistory from "@/components/Dashboard/ConversationHistory"

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Voice Recognition</h2>
          <VoiceRecognition />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
          <AnalyticsChart />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Conversation History</h2>
        <ConversationHistory />
      </div>
    </div>
  )
}

