"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useTranslations } from "@/hooks/use-translations"
import { Button } from "@/components/ui/button"
import { ArrowRight, Wand2, Zap, Lightbulb } from "lucide-react"

interface WelcomeProps {
  onGetStarted: () => void
}

export function Welcome({ onGetStarted }: WelcomeProps) {
  const { t } = useTranslations()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4"
    >
      <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
        {t("welcomeTitle")}
      </h1>

      <p className="text-xl text-blue-100 dark:text-slate-300 mb-10 max-w-2xl">{t("welcomeDescription")}</p>

      <Button
        onClick={onGetStarted}
        size="lg"
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {t("getStarted")}
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl">
        <FeatureCard
          icon={<Wand2 className="h-8 w-8 text-purple-500" />}
          title="AI-Powered"
          description="Generate professional flowcharts from simple text descriptions"
        />
        <FeatureCard
          icon={<Zap className="h-8 w-8 text-yellow-500" />}
          title="Fast & Easy"
          description="Create complex diagrams in seconds without any design skills"
        />
        <FeatureCard
          icon={<Lightbulb className="h-8 w-8 text-green-500" />}
          title="Customizable"
          description="Edit, style, and download your flowcharts in multiple formats"
        />
      </div>
    </motion.div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-blue-800/50 dark:bg-slate-800/50 p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
    >
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-blue-100 dark:text-slate-300">{description}</p>
    </motion.div>
  )
}

