"use client"

import { useState } from "react"
import type { File as FileType } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTranslation } from "@/hooks/use-translation"
import { FileCode, Folder, Plus, Edit2, Trash2, Download, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppContext } from "@/context/app-context"
import { useToast } from "@/hooks/use-toast"

export function FileExplorer() {
  const { t } = useTranslation()
  const { state, dispatch } = useAppContext()
  const { toast } = useToast()
  const [isAddingFile, setIsAddingFile] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [newFileType, setNewFileType] = useState<"file" | "folder">("file")
  const [newFileLanguage, setNewFileLanguage] = useState("html")
  const [renamingFile, setRenamingFile] = useState<string | null>(null)
  const [newName, setNewName] = useState("")

  const handleAddFile = () => {
    if (newFileName) {
      const newFile: FileType = {
        name: newFileName,
        language: newFileLanguage,
        content: "",
        type: newFileType,
      }

      dispatch({ type: "ADD_FILE", payload: newFile })
      setNewFileName("")
      setIsAddingFile(false)

      toast({
        title: t("fileCreated"),
        description: newFileName,
        variant: "success",
      })
    }
  }

  const handleRenameFile = (oldName: string) => {
    if (newName) {
      dispatch({
        type: "RENAME_FILE",
        payload: { oldName, newName },
      })
      setRenamingFile(null)
      setNewName("")

      toast({
        title: t("fileRenamed"),
        description: `${oldName} → ${newName}`,
        variant: "info",
      })
    }
  }

  const handleDeleteFile = (name: string) => {
    dispatch({ type: "DELETE_FILE", payload: name })

    toast({
      title: t("fileDeleted"),
      description: name,
      variant: "warning",
    })
  }

  const handleExportFile = (file: FileType) => {
    const blob = new Blob([file.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: t("fileExported"),
      description: file.name,
      variant: "success",
    })
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
    <div className="h-full flex flex-col">
      <div className="p-2 text-sm font-semibold text-gray-400 uppercase flex justify-between items-center">
        <span>{t("explorer")}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsAddingFile(true)}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {state.fileHistory.present.map((file) => (
          <div
            key={file.name}
            className={cn(
              "flex items-center gap-1 p-2 hover:bg-[#2a2a2a] rounded transition-colors duration-150 group",
              state.activeFile === file.name && "bg-[#37373d]",
            )}
            onClick={() => dispatch({ type: "SET_ACTIVE_FILE", payload: file.name })}
          >
            {file.type === "folder" ? (
              <Folder className="w-4 h-4 text-yellow-400" />
            ) : (
              <FileCode className={`w-4 h-4 ${getLanguageColor(file.language)}`} />
            )}
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
                    handleDeleteFile(file.name)
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
                      handleExportFile(file)
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
        ))}
      </div>

      {/* Add File Dialog */}
      <Dialog open={isAddingFile} onOpenChange={setIsAddingFile}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>{t("addFile")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder={t("name")}
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="bg-gray-700 border-gray-600"
            />
            <select
              className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
              value={newFileType}
              onChange={(e) => setNewFileType(e.target.value as "file" | "folder")}
            >
              <option value="file">{t("file")}</option>
              <option value="folder">{t("folder")}</option>
            </select>
            {newFileType === "file" && (
              <select
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                value={newFileLanguage}
                onChange={(e) => setNewFileLanguage(e.target.value)}
              >
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="javascript">JavaScript</option>
              </select>
            )}
            <div className="flex justify-end">
              <Button onClick={handleAddFile} className="bg-blue-600 hover:bg-blue-700 text-white">
                {t("add")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename File Dialog */}
      <Dialog open={!!renamingFile} onOpenChange={() => setRenamingFile(null)}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>{t("rename")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder={t("newName")}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-gray-700 border-gray-600"
            />
            <div className="flex justify-end">
              <Button
                onClick={() => renamingFile && handleRenameFile(renamingFile)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {t("rename")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

