"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import {
  Loader2,
  Sparkles,
  SunMoon,
  Save,
  Copy,
  Trash2,
  Undo,
  Redo,
  Menu,
  Settings,
  X,
  Plus,
  Search,
  Folder,
  ChevronDown,
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff,
  Replace,
  History,
  PanelLeftOpen,
  PanelRightOpen,
  Download,
} from "lucide-react"
import { toast } from "sonner"
import { useHotkeys } from "react-hotkeys-hook"
import { motion, AnimatePresence } from "framer-motion"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Highlight from "@tiptap/extension-highlight"
import Typography from "@tiptap/extension-typography"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import Underline from "@tiptap/extension-underline"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Minimap } from "@/components/ui/minimap"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface File {
  id: string
  name: string
  content: string
  type: "file" | "folder"
  parentId: string | null
}

const AI_MODEL = { name: "Llama 3.3 70B Versatile" }

const TextEditor: React.FC = () => {
  const [files, setFiles] = useState<File[]>([
    { id: "root", name: "Root", content: "", type: "folder", parentId: null },
    { id: "1", name: "Untitled", content: "", type: "file", parentId: "root" },
  ])
  const [selectedFile, setSelectedFile] = useState<string>("1")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [temperature, setTemperature] = useState(0.7)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [showSidebar, setShowSidebar] = useState(true)
  const [fontSize, setFontSize] = useState(16)
  const [maxTokens, setMaxTokens] = useState(2000)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [customInstructions, setCustomInstructions] = useState("")
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [versionHistory, setVersionHistory] = useState<{ timestamp: Date; content: string }[]>([])
  const [colorScheme, setColorScheme] = useState("default")
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [findText, setFindText] = useState("")
  const [replaceText, setReplaceText] = useState("")
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Typography,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      Underline,
    ],
    content: "",
    onUpdate: ({ editor }) => {
      const content = editor.getText()
      setWordCount(content.trim().split(/\s+/).length)
      setCharCount(content.length)
      const currentFile = files.find((f) => f.id === selectedFile)
      if (currentFile) {
        setFiles(files.map((f) => (f.id === selectedFile ? { ...f, content: editor.getHTML() } : f)))
      }
    },
    onCreate: ({ editor }) => {
      setIsEditorReady(true)
    },
  })

  const generateText = useCallback(async () => {
    if (!editor?.getText().trim()) {
      toast.error("Please enter some text to edit.")
      return
    }

    setIsLoading(true)
    setProgress(0)

    try {
      const response = await fetch("/api/generate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          text: editor.getText(),
          temperature,
          maxTokens,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (!data.result) {
        throw new Error("No result received from the API")
      }

      editor.commands.setContent(data.result)
      setVersionHistory([...versionHistory, { timestamp: new Date(), content: data.result }])
      setChatHistory([
        ...chatHistory,
        { role: "user", content: prompt, timestamp: new Date() },
        { role: "assistant", content: data.result, timestamp: new Date() },
      ])
      toast.success("Text edited successfully!")
    } catch (error) {
      console.error("Error in generateText:", error)
      toast.error(`An error occurred: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
      setProgress(100)
    }
  }, [prompt, editor, temperature, maxTokens, versionHistory, chatHistory])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await generateText()
  }

  const handleSave = (format: "html" | "txt" = "html") => {
    const content = format === "html" ? editor?.getHTML() : editor?.getText()
    const blob = new Blob([content || ""], { type: format === "html" ? "text/html" : "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    const fileName = files.find((f) => f.id === selectedFile)?.name || "untitled"
    link.download = `${fileName}.${format}`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`File saved as ${fileName}.${format}`)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editor?.getText() || "")
    toast.success("Text copied to clipboard!")
  }

  const handleClear = () => {
    editor?.commands.clearContent()
    setVersionHistory([])
    toast.info("Text cleared")
  }

  const handleUndo = () => {
    editor?.commands.undo()
  }

  const handleRedo = () => {
    editor?.commands.redo()
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleNewFile = () => {
    const newFile: File = {
      id: Date.now().toString(),
      name: `Untitled-${files.length}`,
      content: "",
      type: "file",
      parentId: "root",
    }
    setFiles([...files, newFile])
    setSelectedFile(newFile.id)
    editor?.commands.clearContent()
  }

  const handleNewFolder = () => {
    const newFolder: File = {
      id: Date.now().toString(),
      name: `New Folder`,
      content: "",
      type: "folder",
      parentId: "root",
    }
    setFiles([...files, newFolder])
  }

  const handleFileSelect = (id: string) => {
    setSelectedFile(id)
    const file = files.find((f) => f.id === id)
    if (file && file.type === "file") {
      editor?.commands.setContent(file.content || "")
    }
  }

  const handleFileNameChange = (id: string, newName: string) => {
    setFiles(files.map((f) => (f.id === id ? { ...f, name: newName } : f)))
  }

  const handleDeleteFile = (id: string) => {
    if (files.length > 1) {
      const newFiles = files.filter((f) => f.id !== id)
      setFiles(newFiles)
      if (id === selectedFile) {
        setSelectedFile(newFiles[0].id)
        editor?.commands.setContent(newFiles[0].content)
      }
      toast.success("File deleted successfully!")
    } else {
      toast.error("Cannot delete the last file.")
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        const newFile: File = {
          id: Date.now().toString(),
          name: file.name,
          content: content,
          type: "file",
          parentId: "root",
        }
        setFiles([...files, newFile])
        setSelectedFile(newFile.id)
        editor?.commands.setContent(content)
      }
      reader.readAsText(file)
    }
  }

  const handleFindReplace = () => {
    if (findText) {
      const regex = new RegExp(findText, "g")
      const content = editor?.getHTML() || ""
      const newContent = content.replace(regex, replaceText)
      editor?.commands.setContent(newContent)
      toast.success(`Replaced all occurrences of "${findText}" with "${replaceText}"`)
    }
  }

  useHotkeys("ctrl+s, cmd+s", (event) => {
    event.preventDefault()
    handleSave()
  })

  useHotkeys("ctrl+z, cmd+z", (event) => {
    event.preventDefault()
    handleUndo()
  })

  useHotkeys("ctrl+shift+z, cmd+shift+z", (event) => {
    event.preventDefault()
    handleRedo()
  })

  useHotkeys("ctrl+k, cmd+k", (event) => {
    event.preventDefault()
    setShowCommandPalette(true)
  })

  return (
    <div
      className={`flex flex-col h-screen ${isDarkMode ? "dark bg-gray-900" : "bg-gray-100"} transition-colors duration-300`}
      style={
        {
          "--color-primary":
            colorScheme === "default"
              ? "#3b82f6"
              : colorScheme === "green"
                ? "#10b981"
                : colorScheme === "purple"
                  ? "#8b5cf6"
                  : "#3b82f6",
        } as React.CSSProperties
      }
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 p-4 flex justify-between items-center shadow-md transition-colors duration-300">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setShowSidebar(!showSidebar)} className="mr-4 md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-3">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/me2-OudokPClNUFrsZbgoWJXCAQtZShq2Y.png"
              alt="Sentient AI Logo"
              className="h-10 w-10"
            />
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white truncate">
              Sentient AI Text Editor
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://www.sentient-aiep.xyz/", "_blank")}
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Website
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <SunMoon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">Editor Settings</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="font-size" className="text-right">
                    Font Size
                  </Label>
                  <Slider
                    id="font-size"
                    min={12}
                    max={24}
                    step={1}
                    value={[fontSize]}
                    onValueChange={(value) => setFontSize(value[0])}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">AI Model</Label>
                  <div className="col-span-3 text-sm">{AI_MODEL.name}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="max-tokens" className="text-right">
                    Max Tokens
                  </Label>
                  <Slider
                    id="max-tokens"
                    min={100}
                    max={4000}
                    step={100}
                    value={[maxTokens]}
                    onValueChange={(value) => setMaxTokens(value[0])}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="color-scheme" className="text-right">
                    Color Scheme
                  </Label>
                  <Select value={colorScheme} onValueChange={setColorScheme}>
                    <SelectTrigger id="color-scheme" className="col-span-3">
                      <SelectValue placeholder="Select a color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="custom-instructions" className="text-right">
                    Custom Instructions
                  </Label>
                  <textarea
                    id="custom-instructions"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    className="col-span-3 p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={3}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {(showSidebar || !isMobile) && (
            <motion.div
              key="sidebar"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`${isMobile ? "fixed inset-0 z-50" : "relative"} bg-gray-800 dark:bg-gray-900 border-r border-gray-700 overflow-hidden`}
              style={{ width: isMobile ? "100%" : "300px" }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.2,
                  delay: 0.1,
                  staggerChildren: 0.05,
                }}
              >
                <Tabs defaultValue="files">
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TabsList className="w-full">
                      <TabsTrigger value="files" className="w-1/2">
                        Files
                      </TabsTrigger>
                      <TabsTrigger value="chat" className="w-1/2">
                        Chat History
                      </TabsTrigger>
                    </TabsList>
                  </motion.div>
                  <AnimatePresence mode="wait">
                    <TabsContent value="files">
                      <motion.div
                        className="p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-bold text-white">Files</h2>
                          <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)}>
                            <X className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                        <ScrollArea className="h-[calc(100vh-8rem)]">
                          {files
                            .filter((f) => f.parentId === "root")
                            .map((file) => (
                              <div key={file.id} className="mb-2">
                                {file.type === "folder" ? (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center w-full p-2 rounded-md hover:bg-gray-700">
                                      <Folder className="h-4 w-4 mr-2" />
                                      <span className="text-white truncate">{file.name}</span>
                                      <ChevronDown className="h-4 w-4 ml-auto" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem onClick={() => handleNewFile()}>New File</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleNewFolder()}>New Folder</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                ) : (
                                  <div className="flex items-center w-full">
                                    <Input
                                      value={file.name}
                                      onChange={(e) => handleFileNameChange(file.id, e.target.value)}
                                      onClick={() => handleFileSelect(file.id)}
                                      className={`flex-grow p-2 rounded-md ${
                                        selectedFile === file.id ? "bg-blue-600" : "bg-transparent hover:bg-gray-700"
                                      } text-white`}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setFileToDelete(file.id)}
                                      className="text-gray-400 hover:text-red-500"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                        </ScrollArea>
                        <div className="mt-4 flex space-x-2">
                          <Button onClick={handleNewFile} className="w-1/2">
                            <Plus className="h-4 w-4 mr-2" /> New File
                          </Button>
                          <Button onClick={() => handleNewFolder()} className="w-1/2">
                            <Folder className="h-4 w-4 mr-2" /> New Folder
                          </Button>
                        </div>
                      </motion.div>
                    </TabsContent>
                    <TabsContent value="chat">
                      <motion.div
                        className="p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Chat History</h2>
                            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)}>
                              <X className="h-4 w-4 text-white" />
                            </Button>
                          </div>
                          <ScrollArea className="h-[calc(100vh-8rem)]">
                            {chatHistory.map((message, index) => (
                              <div
                                key={index}
                                className={`mb-4 p-3 rounded-lg ${
                                  message.role === "user"
                                    ? "bg-blue-600 dark:bg-blue-800"
                                    : "bg-gray-700 dark:bg-gray-800"
                                } transition-colors duration-300`}
                              >
                                <p className="text-sm text-gray-300 mb-1">
                                  {message.role === "user" ? "You" : "AI"} - {message.timestamp.toLocaleTimeString()}
                                </p>
                                <p className="text-white">{message.content}</p>
                              </div>
                            ))}
                          </ScrollArea>
                        </div>
                      </motion.div>
                    </TabsContent>
                  </AnimatePresence>
                </Tabs>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor */}
          <div className="flex-1 p-4 md:p-6 overflow-auto bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="flex flex-wrap gap-2 mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
              <Button
                onClick={() => editor?.chain().focus().toggleBold().run()}
                variant="outline"
                size="icon"
                className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                variant="outline"
                size="icon"
                className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                variant="outline"
                size="icon"
                className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <UnderlineIcon className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                variant="outline"
                size="icon"
                className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                variant="outline"
                size="icon"
                className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => editor?.chain().focus().setTextAlign("left").run()}
                variant="outline"
                size="icon"
                className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => editor?.chain().focus().setTextAlign("center").run()}
                variant="outline"
                size="icon"
                className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => editor?.chain().focus().setTextAlign("right").run()}
                variant="outline"
                size="icon"
                className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setShowFindReplace(!showFindReplace)}
                variant="outline"
                size="icon"
                className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Replace className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setIsFocusMode(!isFocusMode)}
                variant="outline"
                size="icon"
                className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {isFocusMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => setShowVersionHistory(!showVersionHistory)}
                variant="outline"
                size="icon"
                className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <History className="h-4 w-4" />
              </Button>
            </div>
            {showFindReplace && (
              <div className="mb-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                <Input
                  placeholder="Find"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  className="text-gray-900 dark:text-white"
                />
                <Input
                  placeholder="Replace"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  className="text-gray-900 dark:text-white"
                />
                <Button onClick={handleFindReplace}>Replace All</Button>
              </div>
            )}
            <div className={`flex flex-col md:flex-row ${showPreview ? "md:space-x-4" : ""}`}>
              <div className={`${showPreview ? "md:w-1/2" : "w-full"} relative mb-4 md:mb-0`}>
                {!isEditorReady ? (
                  <div className="flex items-center justify-center h-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <EditorContent
                    editor={editor}
                    className={`prose dark:prose-invert max-w-none ${
                      isFocusMode ? "focus-mode" : ""
                    } p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-lg min-h-[300px] relative`}
                  >
                    {isLoading && (
                      <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 bg-opacity-50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin" />
                      </div>
                    )}
                  </EditorContent>
                )}
                {editor && <Minimap editor={editor} />}
              </div>
              {showPreview && (
                <div className="w-full md:w-1/2 prose dark:prose-invert max-w-none p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-auto">
                  <div dangerouslySetInnerHTML={{ __html: editor?.getHTML() || "" }} />
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{wordCount} words</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-4">{charCount} characters</span>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => setShowPreview(!showPreview)}>
                  {showPreview ? (
                    <PanelLeftOpen className="h-4 w-4 mr-2" />
                  ) : (
                    <PanelRightOpen className="h-4 w-4 mr-2" />
                  )}
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSave("html")}>Export as HTML</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSave("txt")}>Export as Text</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <form onSubmit={handleFormSubmit} className="mt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prompt-input" className="text-gray-700 dark:text-gray-300">
                  Enter your editing prompt:
                </Label>
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2">
                  <input
                    id="prompt-input"
                    className="flex-grow p-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-md transition-colors duration-300"
                    placeholder="Make the text more unique..."
                    onChange={(e) => setPrompt(e.target.value)}
                    value={prompt}
                    required
                  />
                  <Button type="submit" disabled={isLoading || !editor?.getText()} className="w-full md:w-auto">
                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                    {isLoading ? "Processing..." : "Edit"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature-slider" className="text-gray-700 dark:text-gray-300">
                  Temperature: {temperature}
                </Label>
                <Slider
                  id="temperature-slider"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[temperature]}
                  onValueChange={(value) => setTemperature(value[0])}
                  className="my-2"
                />
              </div>
              {isLoading && (
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Processing...</Label>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setShowCommandPalette(true)}
                size="icon"
                className="rounded-full w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
              >
                <Search className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open command palette (Ctrl+K)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Command Palette */}
      <CommandDialog open={showCommandPalette} onOpenChange={setShowCommandPalette}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                handleSave()
                setShowCommandPalette(false)
              }}
            >
              <Save className="mr-2 h-4 w-4" />
              <span>Save</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                handleCopy()
                setShowCommandPalette(false)
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                handleClear()
                setShowCommandPalette(false)
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Clear</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                handleUndo()
                setShowCommandPalette(false)
              }}
            >
              <Undo className="mr-2 h-4 w-4" />
              <span>Undo</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                handleRedo()
                setShowCommandPalette(false)
              }}
            >
              <Redo className="mr-2 h-4 w-4" />
              <span>Redo</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() => {
                setShowSettings(true)
                setShowCommandPalette(false)
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Open Settings</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                toggleTheme()
                setShowCommandPalette(false)
              }}
            >
              <SunMoon className="mr-2 h-4 w-4" />
              <span>Toggle Theme</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px] mt-4">
            {versionHistory.map((version, index) => (
              <div key={index} className="mb-4 p-2 border rounded">
                <p className="text-sm text-gray-500">{version.timestamp.toLocaleString()}</p>
                <p className="mt-1 truncate">{version.content.substring(0, 50)}...</p>
                <Button
                  onClick={() => {
                    editor?.commands.setContent(version.content)
                    setShowVersionHistory(false)
                  }}
                  className="mt-2"
                  size="sm"
                >
                  Restore
                </Button>
              </div>
            ))}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this file? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setFileToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (fileToDelete) {
                  handleDeleteFile(fileToDelete)
                  setFileToDelete(null)
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chat History</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px] mt-4">
            {chatHistory.map((message, index) => (
              <div key={index} className="mb-4 p-2 border rounded">
                <p className="text-sm text-gray-500">
                  {message.role === "user" ? "You" : "AI"} - {message.timestamp.toLocaleString()}
                </p>
                <p className="mt-1">{message.content}</p>
              </div>
            ))}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TextEditor

