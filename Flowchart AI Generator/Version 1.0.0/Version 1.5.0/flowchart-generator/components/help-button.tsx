"use client"

import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { SupportedLanguage } from "@/config/app-config"

interface HelpButtonProps {
  onClick: () => void
  language: SupportedLanguage
}

export function HelpButton({ onClick, language }: HelpButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onClick}
            className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white border-blue-500 rounded-full h-12 w-12 shadow-lg"
          >
            <HelpCircle className="h-6 w-6" />
            <span className="sr-only">{language === "en" ? "Help" : "Помощ"}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{language === "en" ? "Show tutorial" : "Покажи урока"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

