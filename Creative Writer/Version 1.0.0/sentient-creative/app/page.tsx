import HomeClient from "./components/home-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sentient AI Text Editor",
  description: "AI-powered text editing for more precise and creative writing",
}

export default function Home() {
  return <HomeClient />
}

