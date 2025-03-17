"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

interface PulsingAIButtonProps {
  onClick: () => void
  className?: string
}

export function PulsingAIButton({ onClick, className }: PulsingAIButtonProps) {
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    // Check if user has interacted with the AI before - only run in browser
    if (typeof window !== "undefined") {
      const hasInteractedBefore = localStorage.getItem("sentient-ai-interacted")
      if (hasInteractedBefore) {
        setHasInteracted(true)
      }
    }
  }, [])

  const handleClick = () => {
    onClick()
    if (!hasInteracted) {
      setHasInteracted(true)
      if (typeof window !== "undefined") {
        localStorage.setItem("sentient-ai-interacted", "true")
      }
    }
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className="relative">
            {!hasInteracted && (
              <motion.div
                className="absolute inset-0 rounded-full bg-blue-500/30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 0.3, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                }}
              />
            )}
            <Button
              onClick={handleClick}
              className={`relative z-10 bg-blue-600 hover:bg-blue-700 text-white ${className}`}
              size="icon"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-gray-800 text-white border-gray-700">
          <div className="text-sm font-medium">AI Coding Helper</div>
          <p className="text-xs text-gray-300">Get help with coding, debugging, and more!</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

