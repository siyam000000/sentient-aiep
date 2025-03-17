"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import {
  Files,
  Play,
  MessageSquare,
  Folder,
  Plus,
  Edit2,
  Globe,
  ChevronLeft,
  ChevronRight,
  FileIcon,
  Trash2,
  Download,
  MoreVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useTranslation } from "@/hooks/use-translation"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"

type File = {
  name: string
  language: string
  content: string
  type: "file" | "folder"
  children?: File[]
}

type SidebarProps = {
  activeTab: string
  onTabChange: (tab: string) => void
  isCollapsed: boolean
  files: File[]
  activeFile: string
  onFileSelect: (fileName: string) => void
  onAddFile: (name: string, language: string, type: "file" | "folder") => void
  onDeleteFile: (name: string) => void
  onRenameFile: (oldName: string, newName: string) => void
  onExportFile: (file: File) => void
  onToggleCollapse: () => void
  onOpenPreview: () => void
  onOpenAIAssistant: () => void
}

export function Sidebar({
  activeTab,
  onTabChange,
  isCollapsed,
  files,
  activeFile,
  onFileSelect,
  onAddFile,
  onDeleteFile,
  onRenameFile,
  onExportFile,
  onToggleCollapse,
  onOpenPreview,
  onOpenAIAssistant,
}: SidebarProps) {
  const { t } = useTranslation()
  const [isAddingFile, setIsAddingFile] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [newFileType, setNewFileType] = useState<"file" | "folder">("file")
  const [newFileLanguage, setNewFileLanguage] = useState("html")
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const collapseTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Check if user has interacted with the AI before - only run in browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasInteractedBefore = localStorage.getItem("sentient-ai-interacted")
      if (hasInteractedBefore) {
        setHasInteracted(true)
      }
    }
  }, [])

  // Handle auto-expand on hover when collapsed
  const handleMouseEnter = () => {
    setIsHovering(true)
    if (isCollapsed) {
      collapseTimerRef.current = setTimeout(() => {
        onToggleCollapse()
      }, 600) // Delay before expanding
    }
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current)
      collapseTimerRef.current = null
    }
  }

  const sidebarItems = [
    { icon: Files, label: t("explorer"), id: "explorer" },
    { icon: Play, label: t("preview"), id: "preview" },
    {
      icon: MessageSquare,
      label: t("aiAssistant"),
      id: "ai-assistant",
      highlight: !hasInteracted,
    },
  ]

  const handleAddFile = () => {
    if (newFileName) {
      onAddFile(newFileName, newFileLanguage, newFileType)
      setNewFileName("")
      setIsAddingFile(false)
    }
  }

  const handleRenameFile = (oldName: string) => {
    if (newName && onRenameFile) {
      onRenameFile(oldName, newName)
      setRenamingFile(null)
      setNewName("")
    }
  }

  // Handle tab click with special cases
  const handleTabClick = (id: string) => {
    onTabChange(id)

    if (id === "preview") {
      onOpenPreview()
    } else if (id === "ai-assistant") {
      onOpenAIAssistant()
      if (!hasInteracted) {
        setHasInteracted(true)
        if (typeof window !== "undefined") {
          localStorage.setItem("sentient-ai-interacted", "true")
        }
      }
    }
  }

  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case "html":
        return "text-blue-400"
      case "css":
        return "text-purple-400"
      case "javascript":
        return "text-yellow-400"
      default:
        return "text-white"
    }
  }

  const getLanguageIcon = (lang: string) => {
    switch (lang) {
      case "html":
        return <FileIcon className="w-4 h-4 text-blue-400" />
      case "css":
        return <FileIcon className="w-4 h-4 text-purple-400" />
      case "javascript":
        return <FileIcon className="w-4 h-4 text-yellow-400" />
      default:
        return <FileIcon className="w-4 h-4 text-white" />
    }
  }

  // Filter files based on search query
  const filteredFiles = searchQuery
    ? files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : files

  const renderFileTree = (fileList: File[]) => {
    return fileList.map((file) => (
      <div key={file.name} className="ml-4">
        <div
          className={`flex items-center gap-1 p-1 hover:bg-gray-800 rounded transition-colors duration-150 ${
            activeFile === file.name ? "bg-gray-800 text-white" : ""
          } group`}
          onClick={() => file.type === "file" && onFileSelect(file.name)}
        >
          {file.type === "folder" ? <Folder className="w-4 h-4 text-yellow-400" /> : getLanguageIcon(file.language)}
          <span className="text-sm flex-grow">{file.name}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setRenamingFile(file.name)
                  setNewName(file.name)
                }}
                className="flex items-center cursor-pointer"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                {t("rename")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteFile(file.name)
                }}
                className="flex items-center cursor-pointer text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t("delete")}
              </DropdownMenuItem>
              {file.type === "file" && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onExportFile(file)
                  }}
                  className="flex items-center cursor-pointer"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t("export")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {file.type === "folder" && file.children && renderFileTree(file.children)}
      </div>
    ))
  }

  return (
    <TooltipProvider>
      <div
        className={`bg-gradient-to-b from-gray-900 to-gray-950 flex flex-col h-full ${
          isCollapsed ? "w-full" : "w-60"
        } transition-all duration-300 ease-in-out relative group`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Collapse toggle button */}
        <button
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-gray-800 rounded-full p-1 shadow-md border border-gray-700 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            onToggleCollapse()
          }}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          )}
        </button>

        <div className="flex flex-col justify-center items-center p-4 border-b border-gray-800">
          <motion.div
            initial={false}
            animate={{ scale: isCollapsed ? 0.8 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/me2-o2rvoSXljeeyQHyMFvGgnvsLPVwHYU.png"
              alt="Sentient AI IDE Logo"
              width={isCollapsed ? 40 : 100}
              height={isCollapsed ? 40 : 100}
              className="transition-all duration-300 rounded-full bg-blue-900/30 p-1"
            />
          </motion.div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mt-2 text-lg font-semibold text-center text-gray-100 tracking-wider"
              >
                Sentient AI IDE
              </motion.h1>
            )}
          </AnimatePresence>

          <a
            href="https://www.sentient-aiep.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-3 flex items-center justify-center ${
              isCollapsed ? "p-2" : "px-4 py-2"
            } bg-blue-800 hover:bg-blue-700 text-white rounded-md transition-all duration-200 shadow-md hover:shadow-lg`}
          >
            <Globe className={`${isCollapsed ? "w-5 h-5" : "w-4 h-4 mr-2"}`} />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {t("visitWebsite")}
                </motion.span>
              )}
            </AnimatePresence>
          </a>
        </div>
        <div
          className={`flex ${isCollapsed ? "flex-col" : "flex-row"} items-center justify-center py-4 ${isCollapsed ? "space-y-4" : "space-x-2"}`}
        >
          {sidebarItems.map((item) => {
            // Create a direct click handler for each item
            const handleItemClick = (e) => {
              e.preventDefault()
              e.stopPropagation()

              // For AI assistant, directly call the open function
              if (item.id === "ai-assistant") {
                onOpenAIAssistant()
                if (!hasInteracted) {
                  setHasInteracted(true)
                  if (typeof window !== "undefined") {
                    localStorage.setItem("sentient-ai-interacted", "true")
                  }
                }
              } else {
                // For other items, use the normal tab change flow
                handleTabClick(item.id)
              }
            }

            return (
              <div key={item.id} className="relative group/item">
                {item.highlight && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-blue-500/30"
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

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onClick={handleItemClick}
                      className={cn(
                        "w-10 h-10 rounded-xl transition-all duration-200 ease-in-out relative z-10",
                        "hover:bg-gray-800 hover:shadow-md inline-flex items-center justify-center cursor-pointer",
                        activeTab === item.id
                          ? "bg-gray-800 text-white shadow-lg"
                          : item.id === "ai-assistant"
                            ? "text-blue-400 hover:text-blue-300"
                            : "text-gray-400 hover:text-white",
                      )}
                      aria-label={item.label}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="sr-only">{item.label}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">
                    {item.label}
                    {item.highlight && <div className="text-xs text-blue-300">AI-powered coding assistance</div>}
                  </TooltipContent>
                </Tooltip>
              </div>
            )
          })}
        </div>

        <AnimatePresence>
          {!isCollapsed && activeTab === "explorer" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-y-auto"
            >
              <div className="p-2 text-sm font-semibold text-gray-400 uppercase flex justify-between items-center">
                <span>Explorer</span>
                <Dialog open={isAddingFile} onOpenChange={setIsAddingFile}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-gray-800">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-800 text-white">
                    <DialogHeader>
                      <DialogTitle>{t("addFile")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <Input
                        placeholder={t("name")}
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                      <select
                        className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                        value={newFileType}
                        onChange={(e) => setNewFileType(e.target.value as "file" | "folder")}
                      >
                        <option value="file">{t("addFile")}</option>
                        <option value="folder">{t("addFolder")}</option>
                      </select>
                      {newFileType === "file" && (
                        <select
                          className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700"
                          value={newFileLanguage}
                          onChange={(e) => setNewFileLanguage(e.target.value)}
                        >
                          <option value="html">HTML</option>
                          <option value="css">CSS</option>
                          <option value="javascript">JavaScript</option>
                        </select>
                      )}
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddFile} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {t("add")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="px-3 pb-2">
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white mb-2 h-8 text-sm"
                />
              </div>

              <div className="px-2">{renderFileTree(filteredFiles)}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special AI Assistant Callout when Explorer is active */}
        <AnimatePresence>
          {!isCollapsed && activeTab === "explorer" && !hasInteracted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="p-3 mx-3 mb-3 bg-blue-900/30 rounded-lg border border-blue-800/50"
            >
              <h4 className="text-sm font-medium text-blue-400 flex items-center gap-1.5 mb-1">
                <MessageSquare className="h-4 w-4" />
                {t("aiCodingHelper")}
              </h4>
              <p className="text-xs text-gray-300">{t("getAIAssistance")}</p>
              <Button
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 h-auto"
                onClick={() => handleTabClick("ai-assistant")}
                variant="gradient"
              >
                {t("tryItNow")}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {renamingFile && (
          <Dialog open={!!renamingFile} onOpenChange={() => setRenamingFile(null)}>
            <DialogContent className="bg-gray-900 border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>{t("rename")}</DialogTitle>
              </DialogHeader>
              <div className="py-2">
                <Input
                  placeholder={t("newName")}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={() => handleRenameFile(renamingFile)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {t("rename")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  )
}

