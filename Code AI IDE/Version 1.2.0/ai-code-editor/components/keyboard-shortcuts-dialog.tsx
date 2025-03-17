"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Keyboard } from "lucide-react"
import { formatShortcut } from "@/hooks/use-keyboard-shortcuts"
import { useTranslation } from "@/hooks/use-translation"

export function KeyboardShortcutsDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  const shortcutCategories = [
    {
      name: t("general"),
      shortcuts: [
        { keys: "ctrl+p", description: t("commandPalette") },
        { keys: "ctrl+,", description: t("settings") },
        { keys: "ctrl+`", description: t("toggleTerminal") },
        { keys: "ctrl+b", description: t("toggleSidebar") },
        { keys: "ctrl+j", description: t("togglePanel") },
      ],
    },
    {
      name: t("navigation"),
      shortcuts: [
        { keys: "ctrl+e", description: t("goToExplorer") },
        { keys: "ctrl+p", description: t("goToPreview") },
        { keys: "ctrl+a", description: t("openAIAssistant") },
        { keys: "alt+left", description: t("navigateBack") },
        { keys: "alt+right", description: t("navigateForward") },
      ],
    },
    {
      name: t("editing"),
      shortcuts: [
        { keys: "ctrl+s", description: t("save") },
        { keys: "ctrl+z", description: t("undo") },
        { keys: "ctrl+y", description: t("redo") },
        { keys: "ctrl+f", description: t("find") },
        { keys: "ctrl+h", description: t("replace") },
      ],
    },
    {
      name: t("aiAssistant"),
      shortcuts: [
        { keys: "ctrl+space", description: t("aiSuggestion") },
        { keys: "ctrl+shift+a", description: t("generateCode") },
        { keys: "ctrl+shift+e", description: t("explainCode") },
        { keys: "ctrl+shift+d", description: t("debugCode") },
      ],
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
          aria-label={t("keyboardShortcuts")}
        >
          <Keyboard className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 text-blue-400">
            <Keyboard className="h-5 w-5" />
            {t("keyboardShortcuts")}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {shortcutCategories.map((category) => (
            <div key={category.name} className="space-y-3">
              <h3 className="text-sm font-medium text-blue-400 uppercase">{category.name}</h3>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut) => (
                  <div key={shortcut.keys} className="flex justify-between">
                    <span className="text-gray-300">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded">
                      {formatShortcut(shortcut.keys)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

