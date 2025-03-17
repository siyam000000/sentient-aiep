"use client"

import { useState } from "react"
import { Files, Play, MessageSquare, FileCode, Folder, Plus, Edit2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { useTranslation } from "@/hooks/use-translation"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
}: SidebarProps) {
  const { t } = useTranslation()
  const [isAddingFile, setIsAddingFile] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [newFileType, setNewFileType] = useState<"file" | "folder">("file")
  const [newFileLanguage, setNewFileLanguage] = useState("html")
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [newName, setNewName] = useState("")

  const sidebarItems = [
    { icon: Files, label: t("explorer"), id: "explorer" },
    { icon: Play, label: t("preview"), id: "preview" },
    { icon: MessageSquare, label: t("aiAssistant"), id: "ai-assistant" },
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

  const renderFileTree = (fileList: File[]) => {
    return fileList.map((file) => (
      <div key={file.name} className="ml-4">
        <div
          className={`flex items-center gap-1 p-1 hover:bg-[#2a2a2a] rounded ${
            activeFile === file.name ? "bg-[#37373d]" : ""
          }`}
          onClick={() => file.type === "file" && onFileSelect(file.name)}
        >
          {file.type === "folder" ? (
            <Folder className="w-4 h-4 text-yellow-400" />
          ) : (
            <FileCode className={`w-4 h-4 ${getLanguageColor(file.language)}`} />
          )}
          <span className="text-sm flex-grow">{file.name}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Edit2 className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => {
                  setRenamingFile(file.name)
                  setNewName(file.name)
                }}
              >
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeleteFile(file.name)}>Delete</DropdownMenuItem>
              {file.type === "file" && <DropdownMenuItem onClick={() => onExportFile(file)}>Export</DropdownMenuItem>}
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
        className={`bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col h-full ${isCollapsed ? "w-full" : "w-60"} transition-all duration-300 ease-in-out`}
      >
        <div
          className={`flex ${isCollapsed ? "flex-col" : "flex-row"} items-center justify-center py-4 ${isCollapsed ? "space-y-4" : "space-x-2"}`}
        >
          {sidebarItems.map((item) => (
            <Tooltip key={item.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "w-10 h-10 rounded-xl transition-all duration-200 ease-in-out",
                    "hover:bg-gray-700 hover:shadow-md",
                    activeTab === item.id ? "bg-gray-700 text-white shadow-lg" : "text-gray-400 hover:text-white",
                  )}
                  onClick={() => {
                    onTabChange(item.id)
                    if (item.id === "preview") {
                      onOpenPreview()
                    }
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="sr-only">{item.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side={isCollapsed ? "right" : "bottom"}
                className="bg-gray-800 text-white border-gray-700"
              >
                {item.label}
              </TooltipContent>
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
                    <DialogTitle>Add New File or Folder</DialogTitle>
                  </DialogHeader>
                  <Input placeholder="Name" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} />
                  <select
                    className="w-full p-2 bg-[#3c3c3c] text-white rounded"
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value as "file" | "folder")}
                  >
                    <option value="file">File</option>
                    <option value="folder">Folder</option>
                  </select>
                  {newFileType === "file" && (
                    <select
                      className="w-full p-2 bg-[#3c3c3c] text-white rounded"
                      value={newFileLanguage}
                      onChange={(e) => setNewFileLanguage(e.target.value)}
                    >
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="javascript">JavaScript</option>
                    </select>
                  )}
                  <Button onClick={handleAddFile}>Add</Button>
                </DialogContent>
              </Dialog>
            </div>
            <div className="px-2">{renderFileTree(files)}</div>
          </div>
        )}

        {renamingFile && (
          <Dialog open={!!renamingFile} onOpenChange={() => setRenamingFile(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rename File</DialogTitle>
              </DialogHeader>
              <Input placeholder="New name" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <Button onClick={() => handleRenameFile(renamingFile)}>Rename</Button>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  )
}

