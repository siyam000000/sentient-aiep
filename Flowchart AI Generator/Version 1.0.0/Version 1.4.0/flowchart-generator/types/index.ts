import type React from "react"
import type { SupportedLanguage } from "@/config/app-config"

/**
 * Saved flowchart data structure
 */
export interface SavedFlowchart {
  id: string
  description: string
  mermaidCode: string
}

/**
 * Chat item data structure
 */
export interface ChatItem {
  id: string
  title: string
  flowcharts: SavedFlowchart[]
  canGenerateNewChart: boolean
}

/**
 * Response from Claude API
 */
export interface ClaudeResponse {
  content: Array<{ text: string }>
}

/**
 * Result of Mermaid code validation and correction
 */
export interface MermaidValidationResult {
  correctedCode: string
  wasFixed: boolean
  error?: string
}

/**
 * Props for the MermaidRenderer component
 */
export interface MermaidRendererProps {
  code: string
  className?: string
  onCodeFix?: (fixedCode: string) => void
}

/**
 * Methods exposed by the MermaidRenderer component ref
 */
export interface MermaidRendererRef {
  downloadDiagram: () => Promise<boolean>
  fixCode: () => Promise<boolean>
}

/**
 * Props for the EnhancedButton component
 */
export interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  icon?: React.ReactNode
}

/**
 * Props for the Sidebar component
 */
export interface SidebarProps {
  chats: ChatItem[]
  onChatSelect: (id: string) => void
  onNewChat: () => void
  currentChatId: string | null
  canCreateNewChat: boolean
  language: SupportedLanguage
}

/**
 * Props for the NavBar component
 */
export interface NavBarProps {
  onSettingsClick?: () => void
  language?: SupportedLanguage
}

/**
 * Props for the SettingsModal component
 */
export interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  language: SupportedLanguage
}

/**
 * Props for the EnhancePromptButton component
 */
export interface EnhancePromptButtonProps {
  prompt: string
  onEnhance: (enhancedPrompt: string) => void
  language: SupportedLanguage
}

/**
 * Props for the ValidatedInput component
 */
export interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
  helpText?: string
  sanitize?: boolean
  pattern?: string
  patternMessage?: string
}

/**
 * Props for the ErrorBoundary component
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  renderError?: (error: Error, errorInfo: React.ErrorInfo) => React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

/**
 * State for the ErrorBoundary component
 */
export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

