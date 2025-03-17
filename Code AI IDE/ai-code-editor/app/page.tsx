"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Terminal, Play, Split, Undo, Redo, X, Globe, MessageSquare } from "lucide-react"
import { AIAssistant } from "@/components/ai-assistant"
import { useTranslation } from "@/hooks/use-translation"
import { motion, AnimatePresence } from "framer-motion"
import debounce from "lodash/debounce"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

type File = {
  name: string
  language: string
  content: string
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
      { name: "index.html", language: "html", content: "<h1>Hello, World!</h1>" },
      {
        name: "styles.css",
        language: "css",
        content: "body {\n  font-family: Arial, sans-serif;\n  margin: 20px;\n}\n\nh1 {\n  color: #333;\n}",
      },
      { name: "script.js", language: "javascript", content: 'console.log("Hello from JavaScript!");' },
    ],
    future: [],
  })
  const [compileError, setCompileError] = useState<string | null>(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const { t, toggleLanguage, currentLanguage } = useTranslation()
  const [isSideMenuCollapsed, setIsSideMenuCollapsed] = useState(false)

  const editorRef = useRef<any>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

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

  const updateOutput = useCallback(() => {
    const htmlFile = fileHistory.present.find((f) => f.name === "index.html")
    const cssFile = fileHistory.present.find((f) => f.name === "styles.css")
    const jsFile = fileHistory.present.find((f) => f.name === "script.js")

    return `
      <!DOCTYPE html>
      <html>
        <head>
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
  }

  const addNewFile = (name: string, language: string) => {
    setFileHistory((prevHistory) => {
      const newPresent = [...prevHistory.present, { name, language, content: "" }]
      return {
        past: [...prevHistory.past, prevHistory.present],
        present: newPresent,
        future: [],
      }
    })
    setActiveFile(name)
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
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault()
        undo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault()
        redo()
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
      <motion.div
        initial={false}
        animate={{ width: isSideMenuCollapsed ? 50 : 240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-gray-800 border-r border-gray-700 flex flex-col h-full"
      >
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isCollapsed={isSideMenuCollapsed}
          files={fileHistory.present}
          activeFile={activeFile}
          onFileSelect={setActiveFile}
          onAddFile={addNewFile}
          onDeleteFile={deleteFile}
          onToggleCollapse={() => setIsSideMenuCollapsed(!isSideMenuCollapsed)}
        />
      </motion.div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Tab Bar */}
        <div className="flex bg-gray-800 border-b border-gray-700 p-2 overflow-x-auto">
          {fileHistory.present.map((file) => (
            <Button
              key={file.name}
              variant="ghost"
              className={`px-4 py-2 text-sm mr-2 rounded-t-lg whitespace-nowrap ${
                activeFile === file.name ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveFile(file.name)}
            >
              <span className={getLanguageColor(file.language)}>{file.name}</span>
            </Button>
          ))}
          <div className="ml-auto flex items-center">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={toggleLanguage}>
              <Globe className="w-5 h-5" />
            </Button>
            <span className="ml-2 text-gray-400">{currentLanguage === "en" ? "EN" : "BG"}</span>
          </div>
        </div>

        {/* Editor and Preview */}
        <div className="flex-1 flex overflow-hidden" ref={editorContainerRef}>
          <div className={`flex-1 ${showPreview ? "w-1/2" : "w-full"} overflow-hidden`}>
            <MonacoEditor
              height="100%"
              language={fileHistory.present.find((f) => f.name === activeFile)?.language}
              theme="vs-dark"
              value={fileHistory.present.find((f) => f.name === activeFile)?.content}
              onChange={handleFileChange}
              onMount={(editor) => {
                editorRef.current = editor
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                theme: "vs-dark",
                automaticLayout: true,
              }}
            />
          </div>

          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "50%" }}
                exit={{ width: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="border-l border-gray-700 relative overflow-hidden"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-gray-400 hover:text-white z-10"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
                <iframe
                  srcDoc={updateOutput()}
                  title="preview"
                  className="w-full h-full bg-white"
                  sandbox="allow-scripts"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Bar */}
        <div className="h-8 bg-gray-800 text-white flex items-center px-4 text-sm overflow-x-auto">
          <div className="flex items-center gap-4 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 hover:bg-gray-700"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <Split className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="ml-1">{t(showPreview ? "splitView" : "preview")}</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 hover:bg-gray-700" onClick={runCode}>
              <Play className="w-4 h-4" />
              <span className="ml-1">{t("run")}</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 hover:bg-gray-700" onClick={undo}>
              <Undo className="w-4 h-4" />
              <span className="ml-1">{t("undo")}</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 hover:bg-gray-700" onClick={redo}>
              <Redo className="w-4 h-4" />
              <span className="ml-1">{t("redo")}</span>
            </Button>
          </div>
          <div className="flex items-center gap-4 ml-auto flex-shrink-0">
            <span>
              {t("line")} 1, {t("column")} 1
            </span>
            <span>{t("spaces")}: 2</span>
            <span>UTF-8</span>
            <Terminal className="w-4 h-4" />
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 hover:bg-gray-700"
              onClick={() => setShowAIAssistant(!showAIAssistant)}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              {t("aiAssistant")}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {compileError && (
          <div className="bg-red-600 text-white p-2 text-sm">
            {t("compileError")}: {compileError}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAIAssistant && (
          <AIAssistant
            isOpen={showAIAssistant}
            onClose={() => setShowAIAssistant(false)}
            currentFile={fileHistory.present.find((f) => f.name === activeFile)}
            onUpdateFile={handleFileChange}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

