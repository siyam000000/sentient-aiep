"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTranslations } from "@/hooks/use-translations"
import { Keyboard } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShortcutItem {
  keys: string[]
  description: string
}

interface ShortcutCategory {
  name: string
  shortcuts: ShortcutItem[]
}

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslations()

  const shortcuts: ShortcutCategory[] = [
    {
      name: "General",
      shortcuts: [
        { keys: ["?"], description: "Show keyboard shortcuts" },
        { keys: ["Ctrl", "Enter"], description: "Generate flowchart" },
        { keys: ["Ctrl", "S"], description: "Save current flowchart" },
        { keys: ["Ctrl", "N"], description: "New chat" },
        { keys: ["Esc"], description: "Close dialogs" },
      ],
    },
    {
      name: "Navigation",
      shortcuts: [
        { keys: ["Alt", "1"], description: "Go to input tab" },
        { keys: ["Alt", "2"], description: "Go to output tab" },
        { keys: ["Alt", "H"], description: "Toggle sidebar" },
      ],
    },
    {
      name: "Flowchart",
      shortcuts: [
        { keys: ["Ctrl", "D"], description: "Download as SVG" },
        { keys: ["Ctrl", "C"], description: "Copy code" },
        { keys: ["+"], description: "Zoom in" },
        { keys: ["-"], description: "Zoom out" },
        { keys: ["R"], description: "Rotate diagram" },
        { keys: ["G"], description: "Toggle grid" },
        { keys: ["F"], description: "Toggle fullscreen" },
      ],
    },
  ]

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
        aria-label="Keyboard shortcuts"
      >
        <Keyboard className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Keyboard Shortcuts</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {shortcuts.map((category) => (
              <div key={category.name} className="space-y-3">
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{shortcut.description}</span>
                      <div className="flex space-x-1">
                        {shortcut.keys.map((key) => (
                          <kbd
                            key={key}
                            className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

