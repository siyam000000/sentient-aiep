"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, FileCode, Play, MessageSquare, Settings, Terminal, Code, HelpCircle } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { motion, AnimatePresence } from "framer-motion"

type CommandItem = {
  id: string
  name: string
  description?: string
  icon: React.ElementType
  shortcut?: string
  action: () => void
  category: string
}

type CommandPaletteProps = {
  isOpen: boolean
  onClose: () => void
  files: Array<{ name: string; language: string; content: string; type?: string }>
  onFileSelect: (fileName: string) => void
  onOpenPreview: () => void
  onOpenAIAssistant: () => void
}

export function CommandPalette({
  isOpen,
  onClose,
  files,
  onFileSelect,
  onOpenPreview,
  onOpenAIAssistant,
}: CommandPaletteProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSearch("")
      setSelectedIndex(0)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Base commands
  const baseCommands: CommandItem[] = [
    {
      id: "preview",
      name: t("openPreview"),
      description: t("preview"),
      icon: Play,
      shortcut: "ctrl+p",
      action: () => {
        onOpenPreview()
        onClose()
      },
      category: "views",
    },
    {
      id: "ai-assistant",
      name: t("openAIAssistant"),
      description: t("aiAssistant"),
      icon: MessageSquare,
      shortcut: "ctrl+a",
      action: () => {
        onOpenAIAssistant()
        onClose()
      },
      category: "ai",
    },
    {
      id: "settings",
      name: t("settings"),
      description: t("settings"),
      icon: Settings,
      shortcut: "ctrl+,",
      action: () => {
        // Implement settings dialog
        onClose()
      },
      category: "app",
    },
    {
      id: "terminal",
      name: t("toggleTerminal"),
      description: t("toggleTerminal"),
      icon: Terminal,
      shortcut: "ctrl+`",
      action: () => {
        // Implement terminal toggle
        onClose()
      },
      category: "views",
    },
    {
      id: "generate-code",
      name: t("generateCode"),
      description: t("generateCode"),
      icon: Code,
      shortcut: "ctrl+shift+g",
      action: () => {
        onOpenAIAssistant()
        onClose()
      },
      category: "ai",
    },
    {
      id: "help",
      name: t("help"),
      description: t("help"),
      icon: HelpCircle,
      action: () => {
        // Implement help dialog
        onClose()
      },
      category: "app",
    },
  ]

  // File commands
  const fileCommands: CommandItem[] = files.map((file) => ({
    id: `file-${file.name}`,
    name: file.name,
    description: t("openFile"),
    icon: FileCode,
    action: () => {
      onFileSelect(file.name)
      onClose()
    },
    category: "files",
  }))

  // Combine all commands
  const allCommands = [...baseCommands, ...fileCommands]

  // Filter commands based on search
  const filteredCommands =
    search.trim() === ""
      ? allCommands
      : allCommands.filter(
          (cmd) =>
            cmd.name.toLowerCase().includes(search.toLowerCase()) ||
            (cmd.description && cmd.description.toLowerCase().includes(search.toLowerCase())),
        )

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
        break
      case "Enter":
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
        }
        break
      case "Escape":
        e.preventDefault()
        onClose()
        break
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[550px] p-0 bg-gray-900 border-gray-800 text-white overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center border-b border-gray-800 p-4">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder={t("typeToSearch")}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-2">
          <AnimatePresence>
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400">{t("noCommandsFound")}</div>
            ) : (
              filteredCommands.map((command, index) => (
                <motion.div
                  key={command.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15, delay: index * 0.03 }}
                  className={`px-4 py-2 cursor-pointer flex items-center ${
                    selectedIndex === index ? "bg-blue-600/20 text-blue-400" : "hover:bg-gray-800"
                  }`}
                  onClick={() => {
                    setSelectedIndex(index)
                    command.action()
                  }}
                >
                  <div className="mr-3 text-gray-400">
                    <command.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{command.name}</div>
                    {command.description && <div className="text-xs text-gray-400">{command.description}</div>}
                  </div>
                  {command.shortcut && (
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded ml-2">
                      {command.shortcut.replace("ctrl+", "⌘/Ctrl+")}
                    </kbd>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

