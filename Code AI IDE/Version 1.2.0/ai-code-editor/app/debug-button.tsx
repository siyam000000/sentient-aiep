"use client"

import { Button } from "@/components/ui/button"

interface DebugButtonProps {
  onClick: () => void
}

export function DebugButton({ onClick }: DebugButtonProps) {
  return (
    <Button onClick={onClick} className="fixed top-4 left-4 z-50 bg-red-600 hover:bg-red-700 text-white">
      Open AI Assistant (Debug)
    </Button>
  )
}

