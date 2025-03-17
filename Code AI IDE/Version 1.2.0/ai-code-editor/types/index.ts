import type React from "react"
// Core application types
export type FileType = "file" | "folder"

export interface File {
  name: string
  language: string
  content: string
  type: FileType
  children?: File[]
}

export interface FileHistory {
  past: File[][]
  present: File[]
  future: File[][]
}

export type EditorTheme = "vs-dark" | "light" | "high-contrast"

export interface EditorSettings {
  theme: EditorTheme
  fontSize: number
  tabSize: number
  wordWrap: "on" | "off"
  minimap: boolean
  lineNumbers: "on" | "off" | "relative"
  autoSave: boolean
  formatOnSave: boolean
}

export interface UserPreferences {
  editorSettings: EditorSettings
  language: "en" | "bg"
  sidebarCollapsed: boolean
  recentFiles: string[]
  lastOpenFile?: string
}

// AI Assistant types
export type MessageRole = "user" | "assistant" | "system" | "data"

export interface Message {
  id: string
  role: MessageRole
  content: string
  data?: any
}

// UI types
export type ToastVariant = "default" | "destructive" | "success" | "info" | "warning"

export interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
  action?: React.ReactNode
}

