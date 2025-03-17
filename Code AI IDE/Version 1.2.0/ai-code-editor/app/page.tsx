"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Undo, Redo, X, Globe, Settings, Search, ChevronDown, Save, Download, Keyboard } from "lucide-react"
import { AIAssistant } from "@/components/ai-assistant"
import { useTranslation } from "@/hooks/use-translation"
import { motion } from "framer-motion"
import debounce from "lodash/debounce"
import { WelcomeModal } from "@/components/welcome-modal"
import { PulsingAIButton } from "@/components/pulsing-ai-button"
import { AIHelpPanel } from "@/components/ai-help-panel"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CommandPalette } from "@/components/command-palette"
import { ResizableLayout } from "@/components/resizable-layout"
import { StatusBar } from "@/components/status-bar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

type File = {
  name: string
  language: string
  content: string
  type?: "file" | "folder"
}

type FileHistory = {
  past: File[][]
  present: File[]
  future: File[][]
}

export default function CodeEditor() {
  const [activeTab, setActiveTab] = useState("explorer")
  const [activeFile, setActiveFile] = useState("index.html")
  const [showPreview, setShowPreview] = useState(false)
  const [fileHistory, setFileHistory] = useState<FileHistory>({
    past: [],
    present: [
      { name: "index.html", language: "html", content: "<h1>Hello, World!</h1>", type: "file" },
      {
        name: "styles.css",
        language: "css",
        content: "body {\n  font-family: Arial, sans-serif;\n  margin: 20px;\n}\n\nh1 {\n  color: #333;\n}",
        type: "file",
      },
      { name: "script.js", language: "javascript", content: 'console.log("Hello from JavaScript!");', type: "file" },
    ],
    future: [],
  })
  const [compileError, setCompileError] = useState<string | null>(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const { t, toggleLanguage, currentLanguage } = useTranslation()
  const [isSideMenuCollapsed, setIsSideMenuCollapsed] = useState(false)
  const [currentLine, setCurrentLine] = useState(1)
  const [currentColumn, setCurrentColumn] = useState(1)
  const [indentationSize, setIndentationSize] = useState(2)
  const [showAITip, setShowAITip] = useState(false)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [editorTheme, setEditorTheme] = useState("vs-dark")
  const [fontSize, setFontSize] = useState(14)
  const [isSaved, setIsSaved] = useState(true)

  const editorRef = useRef<any>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // Function to toggle AI Assistant visibility
  const toggleAIAssistant = useCallback(() => {
    setShowAIAssistant((prev) => !prev)
    // Hide the tip after first interaction
    setShowAITip(false)
    if (typeof window !== "undefined") {
      localStorage.setItem("sentient-ai-tip-shown", "true")
    }
  }, [])

  // Check if the tip has been shown before - only run in browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      const tipShown = localStorage.getItem("sentient-ai-tip-shown")
      if (tipShown) {
        setShowAITip(false)
      } else {
        setShowAITip(true)
      }
    }
  }, [])

  // Function to handle tab change with special handling for AI assistant
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab)
    if (tab === "ai-assistant") {
      setShowAIAssistant(true)
      setShowAITip(false)
      if (typeof window !== "undefined") {
        localStorage.setItem("sentient-ai-tip-shown", "true")
      }
    }
  }, [])

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
        return "🌐"
      case "css":
        return "🎨"
      case "javascript":
        return "⚙️"
      default:
        return "📄"
    }
  }

  const updateOutput = useCallback(() => {
    const htmlFile = fileHistory.present.find((f) => f.name === "index.html")
    const cssFile = fileHistory.present.find((f) => f.name === "styles.css")
    const jsFile = fileHistory.present.find((f) => f.name === "script.js")

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sentient AI IDE Preview</title>
          <style>${cssFile?.content || ""}</style>
        </head>
        <body>
          ${htmlFile?.content || ""}
          <script>${jsFile?.content || ""}</script>
        </body>
      </html>
    `
  }, [fileHistory.present])

  const handleFileChange = (content: string | undefined) => {
    if (content === undefined) return
    setFileHistory((prevHistory) => {
      const newPresent = prevHistory.present.map((file) => (file.name === activeFile ? { ...file, content } : file))
      return {
        past: [...prevHistory.past, prevHistory.present],
        present: newPresent,
        future: [],
      }
    })
    setIsSaved(false)
  }

  const handleAddFile = (name: string, language: string, type: "file" | "folder") => {
    setFileHistory((prevHistory) => {
      const newFile: File = { name, language, content: "", type }
      const newPresent = [...prevHistory.present, newFile]
      return {
        past: [...prevHistory.past, prevHistory.present],
        present: newPresent,
        future: [],
      }
    })
    if (type === "file") {
      setActiveFile(name)
    }
  }

  const handleRenameFile = (oldName: string, newName: string) => {
    setFileHistory((prevHistory) => {
      const newPresent = prevHistory.present.map((file) => (file.name === oldName ? { ...file, name: newName } : file))
      return {
        past: [...prevHistory.past, prevHistory.present],
        present: newPresent,
        future: [],
      }
    })
    if (activeFile === oldName) {
      setActiveFile(newName)
    }
  }

  const handleExportFile = (file: File) => {
    const blob = new Blob([file.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)
  }

  const deleteFile = (name: string) => {
    setFileHistory((prevHistory) => {
      const newPresent = prevHistory.present.filter((file) => file.name !== name)
      return {
        past: [...prevHistory.past, prevHistory.present],
        present: newPresent,
        future: [],
      }
    })
    if (activeFile === name) {
      setActiveFile(fileHistory.present[0]?.name || "")
    }
  }

  const compileCode = () => {
    setCompileError(null)
    try {
      const output = updateOutput()
      const parser = new DOMParser()
      const doc = parser.parseFromString(output, "text/html")

      // Check for HTML parsing errors
      const parseError = doc.querySelector("parsererror")
      if (parseError) {
        throw new Error("HTML parsing error: " + parseError.textContent)
      }

      // Basic CSS validation
      const cssFile = fileHistory.present.find((f) => f.name === "styles.css")
      if (cssFile) {
        const cssContent = cssFile.content
        if (cssContent.includes("{") && !cssContent.includes("}")) {
          throw new Error("CSS error: Missing closing brace")
        }
      }

      // Basic JavaScript validation
      const jsFile = fileHistory.present.find((f) => f.name === "script.js")
      if (jsFile) {
        const reservedWords = [
          "package",
          "interface",
          "private",
          "protected",
          "implements",
          "static",
          "public",
          "yield",
          "let",
          "const",
          "class",
          "enum",
          "export",
          "extends",
          "import",
          "super",
        ]
        const usesReservedWord = reservedWords.some((word) => {
          const regex = new RegExp(`\\b${word}\\b`, "g")
          return regex.test(jsFile.content)
        })
        if (usesReservedWord) {
          throw new Error("JavaScript error: Usage of strict mode reserved word detected")
        }
        new Function(jsFile.content)
      }

      return output
    } catch (error) {
      setCompileError((error as Error).message)
      return null
    }
  }

  const runCode = () => {
    const output = compileCode()
    if (output) {
      const previewWindow = window.open("", "_blank")
      if (previewWindow) {
        previewWindow.document.write(output)
        previewWindow.document.close()
      }
    }
  }

  const saveFile = () => {
    // In a real app, this would save to a server or local storage
    setIsSaved(true)
    // Show a toast notification
    const toast = document.createElement("div")
    toast.className =
      "fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-up"
    toast.textContent = `${activeFile} saved successfully`
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.classList.add("animate-fade-out-down")
      setTimeout(() => document.body.removeChild(toast), 500)
    }, 3000)
  }

  const undo = useCallback(() => {
    setFileHistory((prevHistory) => {
      if (prevHistory.past.length === 0) return prevHistory
      const newPast = prevHistory.past.slice(0, -1)
      const newPresent = prevHistory.past[prevHistory.past.length - 1]
      return {
        past: newPast,
        present: newPresent,
        future: [prevHistory.present, ...prevHistory.future],
      }
    })
    setIsSaved(false)
  }, [])

  const redo = useCallback(() => {
    setFileHistory((prevHistory) => {
      if (prevHistory.future.length === 0) return prevHistory
      const [newPresent, ...newFuture] = prevHistory.future
      return {
        past: [...prevHistory.past, prevHistory.present],
        present: newPresent,
        future: newFuture,
      }
    })
    setIsSaved(false)
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Save shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        saveFile()
      }
      // Undo shortcut
      else if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault()
        undo()
      }
      // Redo shortcut
      else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault()
        redo()
      }
      // Command palette shortcut
      else if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault()
        setShowCommandPalette(true)
      }
    },
    [undo, redo],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    const resizeObserver = new ResizeObserver(
      debounce(() => {
        if (editorRef.current) {
          editorRef.current.layout()
        }
      }, 100),
    )

    if (editorContainerRef.current) {
      resizeObserver.observe(editorContainerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const toggleIndentationSize = () => {
    const newSize = indentationSize === 2 ? 4 : 2
    setIndentationSize(newSize)
    if (editorRef.current) {
      editorRef.current.updateOptions({ tabSize: newSize, indentSize: newSize })
    }
  }

  const activeFileData = fileHistory.present.find((f) => f.name === activeFile)

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-950 overflow-hidden">
        {/* Welcome Modal for first-time users */}
        <WelcomeModal />

        {/* Command Palette */}
        <CommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
          files={fileHistory.present}
          onFileSelect={setActiveFile}
          onOpenPreview={() => setShowPreview(true)}
          onOpenAIAssistant={toggleAIAssistant}
        />

        <motion.div
          initial={false}
          animate={{ width: isSideMenuCollapsed ? 50 : 240 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-gray-900 border-r border-gray-800 flex flex-col h-full shadow-xl"
        >
          <Sidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isCollapsed={isSideMenuCollapsed}
            files={fileHistory.present}
            activeFile={activeFile}
            onFileSelect={setActiveFile}
            onAddFile={handleAddFile}
            onDeleteFile={deleteFile}
            onRenameFile={handleRenameFile}
            onExportFile={handleExportFile}
            onToggleCollapse={() => setIsSideMenuCollapsed(!isSideMenuCollapsed)}
            onOpenPreview={() => setShowPreview(true)}
            onOpenAIAssistant={toggleAIAssistant}
          />
        </motion.div>

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top Bar */}
          <div className="bg-gray-900 border-b border-gray-800 p-2 flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white mr-2" onClick={saveFile}>
                <Save className="w-4 h-4 mr-1" />
                {t("save")}
              </Button>

              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white mr-2" onClick={undo}>
                <Undo className="w-4 h-4 mr-1" />
                {t("undo")}
              </Button>

              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={redo}>
                <Redo className="w-4 h-4 mr-1" />
                {t("redo")}
              </Button>
            </div>

            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white mr-2"
                onClick={() => setShowCommandPalette(true)}
              >
                <Search className="w-4 h-4 mr-1" />
                {t("search")}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Settings className="w-4 h-4 mr-1" />
                    {t("settings")}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                  <DropdownMenuItem onClick={toggleLanguage} className="flex items-center cursor-pointer">
                    <Globe className="w-4 h-4 mr-2" />
                    {currentLanguage === "en" ? "Switch to Bulgarian" : "Switch to English"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setEditorTheme(editorTheme === "vs-dark" ? "light" : "vs-dark")}
                    className="flex items-center cursor-pointer"
                  >
                    <span className="w-4 h-4 mr-2 flex items-center justify-center">
                      {editorTheme === "vs-dark" ? "☀️" : "🌙"}
                    </span>
                    {editorTheme === "vs-dark" ? "Light Theme" : "Dark Theme"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFontSize(fontSize === 14 ? 16 : 14)}
                    className="flex items-center cursor-pointer"
                  >
                    <span className="w-4 h-4 mr-2 flex items-center justify-center">
                      {fontSize === 14 ? "A" : "A+"}
                    </span>
                    {fontSize === 14 ? "Increase Font Size" : "Decrease Font Size"}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center cursor-pointer">
                    <Keyboard className="w-4 h-4 mr-2" />
                    {t("keyboardShortcuts")}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center cursor-pointer">
                    <Download className="w-4 h-4 mr-2" />
                    {t("exportProject")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex bg-gray-900 border-b border-gray-800 overflow-x-auto">
            <Tabs defaultValue={activeFile} onValueChange={setActiveFile} className="w-full">
              <TabsList className="bg-transparent h-10 p-0">
                {fileHistory.present.map((file) => (
                  <TabsTrigger
                    key={file.name}
                    value={file.name}
                    className={`px-4 py-2 text-sm rounded-t-lg data-[state=active]:bg-gray-800 data-[state=active]:text-white data-[state=active]:border-t data-[state=active]:border-x data-[state=active]:border-blue-500 data-[state=active]:border-b-0 data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white relative`}
                  >
                    <span className="mr-1">{getLanguageIcon(file.language)}</span>
                    <span className={getLanguageColor(file.language)}>{file.name}</span>
                    {activeFile === file.name && !isSaved && <span className="ml-2 text-gray-400">•</span>}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="ml-auto flex items-center gap-2 p-2">
              <AIHelpPanel />
            </div>
          </div>

          {/* Editor and Preview */}
          <div className="flex-1 flex overflow-hidden" ref={editorContainerRef}>
            {showPreview ? (
              <ResizableLayout
                direction="horizontal"
                defaultSizes={[50, 50]}
                minSizes={[200, 200]}
                className="w-full h-full"
              >
                <div className="h-full overflow-hidden">
                  <MonacoEditor
                    height="100%"
                    language={activeFileData?.language}
                    theme={editorTheme}
                    value={activeFileData?.content}
                    onChange={handleFileChange}
                    onMount={(editor) => {
                      editorRef.current = editor
                      editor.onDidChangeCursorPosition((e) => {
                        setCurrentLine(e.position.lineNumber)
                        setCurrentColumn(e.position.column)
                      })
                      const updateIndentationSize = () => {
                        const model = editor.getModel()
                        if (model) {
                          const newSize = model.getOptions().tabSize
                          setIndentationSize(newSize)
                        }
                      }
                      updateIndentationSize()
                      editor.onDidChangeModelOptions(updateIndentationSize)
                    }}
                    options={{
                      minimap: { enabled: true },
                      fontSize: fontSize,
                      lineNumbers: "on",
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      readOnly: false,
                      theme: editorTheme,
                      automaticLayout: true,
                      tabSize: indentationSize,
                      indentSize: indentationSize,
                      wordWrap: "on",
                      cursorBlinking: "smooth",
                      cursorSmoothCaretAnimation: "on",
                      smoothScrolling: true,
                      bracketPairColorization: {
                        enabled: true,
                      },
                    }}
                  />
                </div>

                <div className="h-full relative overflow-hidden bg-white">
                  <div className="absolute top-0 left-0 right-0 bg-gray-100 text-gray-800 px-4 py-2 flex justify-between items-center border-b">
                    <span className="font-medium">Preview</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-900"
                      onClick={() => setShowPreview(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="pt-10 h-full">
                    <iframe
                      srcDoc={updateOutput()}
                      title="preview"
                      className="w-full h-full bg-white"
                      sandbox="allow-scripts"
                    />
                  </div>
                </div>
              </ResizableLayout>
            ) : (
              <div className="w-full h-full overflow-hidden">
                <MonacoEditor
                  height="100%"
                  language={activeFileData?.language}
                  theme={editorTheme}
                  value={activeFileData?.content}
                  onChange={handleFileChange}
                  onMount={(editor) => {
                    editorRef.current = editor
                    editor.onDidChangeCursorPosition((e) => {
                      setCurrentLine(e.position.lineNumber)
                      setCurrentColumn(e.position.column)
                    })
                    const updateIndentationSize = () => {
                      const model = editor.getModel()
                      if (model) {
                        const newSize = model.getOptions().tabSize
                        setIndentationSize(newSize)
                      }
                    }
                    updateIndentationSize()
                    editor.onDidChangeModelOptions(updateIndentationSize)
                  }}
                  options={{
                    minimap: { enabled: true },
                    fontSize: fontSize,
                    lineNumbers: "on",
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    readOnly: false,
                    theme: editorTheme,
                    automaticLayout: true,
                    tabSize: indentationSize,
                    indentSize: indentationSize,
                    wordWrap: "on",
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on",
                    smoothScrolling: true,
                    bracketPairColorization: {
                      enabled: true,
                    },
                  }}
                />
              </div>
            )}
          </div>

          {/* Status Bar */}
          <StatusBar
            currentLine={currentLine}
            currentColumn={currentColumn}
            indentationSize={indentationSize}
            toggleIndentationSize={toggleIndentationSize}
            togglePreview={() => setShowPreview(!showPreview)}
            showPreview={showPreview}
            runCode={runCode}
            toggleAIAssistant={toggleAIAssistant}
            showAITip={showAITip}
            setShowAITip={setShowAITip}
            language={activeFileData?.language || ""}
            isSaved={isSaved}
          />

          {/* Error Display */}
          {compileError && (
            <div className="bg-red-600 text-white p-2 text-sm flex items-center">
              <span className="font-bold mr-2">{t("compileError")}:</span> {compileError}
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-white hover:bg-red-700"
                onClick={() => setCompileError(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Floating AI Button (visible on mobile) */}
        <div className="fixed bottom-4 right-4 md:hidden z-50">
          <PulsingAIButton onClick={toggleAIAssistant} />
        </div>

        {/* AI Assistant */}
        <AIAssistant
          currentFile={fileHistory.present.find((f) => f.name === activeFile)}
          onUpdateFile={handleFileChange}
          isOpen={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
        />
      </div>
    </TooltipProvider>
  )
}

