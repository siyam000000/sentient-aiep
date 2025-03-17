"use client"

import { useState } from "react"
import { Files, Play, MessageSquare, ChevronDown, FileCode, Folder, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { useTranslation } from "@/hooks/use-translation"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type File = {
  name: string
  language: string
  content: string
}

type SidebarProps = {
  activeTab: string
  onTabChange: (tab: string) => void
  isCollapsed: boolean
  files?: File[]
  activeFile: string
  onFileSelect: (fileName: string) => void
  onAddFile: (name: string, language: string) => void
  onDeleteFile: (name: string) => void
}

export function Sidebar({
  activeTab,
  onTabChange,
  isCollapsed,
  files = [],
  activeFile,
  onFileSelect,
  onAddFile,
  onDeleteFile,
}: SidebarProps) {
  const { t } = useTranslation()
  const [isAddingFile, setIsAddingFile] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [newFileLanguage, setNewFileLanguage] = useState("html")

  const sidebarItems = [
    { icon: Files, label: t("explorer"), id: "explorer" },
    { icon: Play, label: t("preview"), id: "preview" },
    { icon: MessageSquare, label: t("aiAssistant"), id: "ai-assistant" },
  ]

  const handleAddFile = () => {
    if (newFileName) {
      const extension = getFileExtension(newFileLanguage)
      const fullFileName = newFileName.includes(".") ? newFileName : `${newFileName}${extension}`
      onAddFile(fullFileName, newFileLanguage)
      setNewFileName("")
      setIsAddingFile(false)
    }
  }

  const getFileExtension = (language: string) => {
    switch (language) {
      case "html":
        return ".html"
      case "css":
        return ".css"
      case "javascript":
        return ".js"
      default:
        return ""
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

  return (
    <TooltipProvider>
      <div className={`bg-[#252525] flex flex-col h-full ${isCollapsed ? "w-12" : "w-60"}`}>
        <div className="flex flex-col items-center py-4">
          {sidebarItems.map((item) => (
            <Tooltip key={item.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "w-10 h-10 p-2 my-1 rounded-lg transition-all duration-200 ease-in-out",
                    activeTab === item.id
                      ? "bg-[#37373d] text-white"
                      : "text-gray-400 hover:text-white hover:bg-[#37373d]",
                  )}
                  onClick={() => onTabChange(item.id)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="sr-only">{item.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        {!isCollapsed && activeTab === "explorer" && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 text-sm font-semibold text-gray-400 uppercase flex justify-between items-center">
              <span>Explorer</span>
              <Dialog open={isAddingFile} onOpenChange={setIsAddingFile}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New File</DialogTitle>
                  </DialogHeader>
                  <Input placeholder="File name" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} />
                  <select
                    className="w-full p-2 bg-[#3c3c3c] text-white rounded"
                    value={newFileLanguage}
                    onChange={(e) => setNewFileLanguage(e.target.value)}
                  >
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                  <Button onClick={handleAddFile}>Add File</Button>
                </DialogContent>
              </Dialog>
            </div>
            <div className="px-2">
              <div className="flex items-center gap-1 p-1 hover:bg-[#2a2a2a] rounded">
                <ChevronDown className="w-4 h-4" />
                <Folder className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Project</span>
              </div>
              <div className="ml-4">
                {files &&
                  files.map((file) => (
                    <div
                      key={file.name}
                      className={`flex items-center gap-1 p-1 hover:bg-[#2a2a2a] rounded ${
                        activeFile === file.name ? "bg-[#37373d]" : ""
                      }`}
                      onClick={() => onFileSelect(file.name)}
                    >
                      <FileCode className={`w-4 h-4 ${getLanguageColor(file.language)}`} />
                      <span className="text-sm flex-grow">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteFile(file.name)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

