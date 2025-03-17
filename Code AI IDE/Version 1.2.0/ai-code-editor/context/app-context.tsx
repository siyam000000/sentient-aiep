"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type { File, FileHistory, UserPreferences, EditorSettings } from "@/types"

// Default editor settings
const defaultEditorSettings: EditorSettings = {
  theme: "vs-dark",
  fontSize: 14,
  tabSize: 2,
  wordWrap: "on",
  minimap: false,
  lineNumbers: "on",
  autoSave: true,
  formatOnSave: false,
}

// Default user preferences
const defaultUserPreferences: UserPreferences = {
  editorSettings: defaultEditorSettings,
  language: "bg",
  sidebarCollapsed: false,
  recentFiles: [],
}

// Initial file state
const initialFiles: File[] = [
  { name: "index.html", language: "html", content: "<h1>Hello, World!</h1>", type: "file" },
  {
    name: "styles.css",
    language: "css",
    content: "body {\n  font-family: Arial, sans-serif;\n  margin: 20px;\n}\n\nh1 {\n  color: #333;\n}",
    type: "file",
  },
  { name: "script.js", language: "javascript", content: 'console.log("Hello from JavaScript!");', type: "file" },
]

// Initial file history
const initialFileHistory: FileHistory = {
  past: [],
  present: initialFiles,
  future: [],
}

// App state interface
interface AppState {
  fileHistory: FileHistory
  activeFile: string
  showPreview: boolean
  showAIAssistant: boolean
  compileError: string | null
  isSideMenuCollapsed: boolean
  currentLine: number
  currentColumn: number
  userPreferences: UserPreferences
}

// Initial app state
const initialState: AppState = {
  fileHistory: initialFileHistory,
  activeFile: "index.html",
  showPreview: false,
  showAIAssistant: false,
  compileError: null,
  isSideMenuCollapsed: false,
  currentLine: 1,
  currentColumn: 1,
  userPreferences: defaultUserPreferences,
}

// Action types
type ActionType =
  | { type: "SET_ACTIVE_FILE"; payload: string }
  | { type: "TOGGLE_PREVIEW" }
  | { type: "TOGGLE_AI_ASSISTANT" }
  | { type: "SET_COMPILE_ERROR"; payload: string | null }
  | { type: "TOGGLE_SIDE_MENU" }
  | { type: "SET_CURSOR_POSITION"; payload: { line: number; column: number } }
  | { type: "UPDATE_FILE_CONTENT"; payload: { name: string; content: string } }
  | { type: "ADD_FILE"; payload: File }
  | { type: "RENAME_FILE"; payload: { oldName: string; newName: string } }
  | { type: "DELETE_FILE"; payload: string }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "UPDATE_EDITOR_SETTINGS"; payload: Partial<EditorSettings> }
  | { type: "SET_LANGUAGE"; payload: "en" | "bg" }
  | { type: "LOAD_USER_PREFERENCES" }
  | { type: "RESET_TO_DEFAULTS" }

// Reducer function
function appReducer(state: AppState, action: ActionType): AppState {
  switch (action.type) {
    case "SET_ACTIVE_FILE":
      return {
        ...state,
        activeFile: action.payload,
        userPreferences: {
          ...state.userPreferences,
          lastOpenFile: action.payload,
          recentFiles: [
            action.payload,
            ...state.userPreferences.recentFiles.filter((file) => file !== action.payload),
          ].slice(0, 5),
        },
      }

    case "TOGGLE_PREVIEW":
      return {
        ...state,
        showPreview: !state.showPreview,
      }

    case "TOGGLE_AI_ASSISTANT":
      return {
        ...state,
        showAIAssistant: !state.showAIAssistant,
      }

    case "SET_COMPILE_ERROR":
      return {
        ...state,
        compileError: action.payload,
      }

    case "TOGGLE_SIDE_MENU":
      const newCollapsedState = !state.isSideMenuCollapsed
      return {
        ...state,
        isSideMenuCollapsed: newCollapsedState,
        userPreferences: {
          ...state.userPreferences,
          sidebarCollapsed: newCollapsedState,
        },
      }

    case "SET_CURSOR_POSITION":
      return {
        ...state,
        currentLine: action.payload.line,
        currentColumn: action.payload.column,
      }

    case "UPDATE_FILE_CONTENT":
      const updatedPresent = state.fileHistory.present.map((file) =>
        file.name === action.payload.name ? { ...file, content: action.payload.content } : file,
      )

      return {
        ...state,
        fileHistory: {
          past: [...state.fileHistory.past, state.fileHistory.present],
          present: updatedPresent,
          future: [],
        },
      }

    case "ADD_FILE":
      return {
        ...state,
        fileHistory: {
          past: [...state.fileHistory.past, state.fileHistory.present],
          present: [...state.fileHistory.present, action.payload],
          future: [],
        },
        activeFile: action.payload.name,
      }

    case "RENAME_FILE":
      const renamedFiles = state.fileHistory.present.map((file) =>
        file.name === action.payload.oldName ? { ...file, name: action.payload.newName } : file,
      )

      return {
        ...state,
        fileHistory: {
          past: [...state.fileHistory.past, state.fileHistory.present],
          present: renamedFiles,
          future: [],
        },
        activeFile: state.activeFile === action.payload.oldName ? action.payload.newName : state.activeFile,
        userPreferences: {
          ...state.userPreferences,
          recentFiles: state.userPreferences.recentFiles.map((file) =>
            file === action.payload.oldName ? action.payload.newName : file,
          ),
          lastOpenFile:
            state.userPreferences.lastOpenFile === action.payload.oldName
              ? action.payload.newName
              : state.userPreferences.lastOpenFile,
        },
      }

    case "DELETE_FILE":
      const filteredFiles = state.fileHistory.present.filter((file) => file.name !== action.payload)
      const newActiveFile = state.activeFile === action.payload ? filteredFiles[0]?.name || "" : state.activeFile

      return {
        ...state,
        fileHistory: {
          past: [...state.fileHistory.past, state.fileHistory.present],
          present: filteredFiles,
          future: [],
        },
        activeFile: newActiveFile,
        userPreferences: {
          ...state.userPreferences,
          recentFiles: state.userPreferences.recentFiles.filter((file) => file !== action.payload),
          lastOpenFile:
            state.userPreferences.lastOpenFile === action.payload ? newActiveFile : state.userPreferences.lastOpenFile,
        },
      }

    case "UNDO":
      if (state.fileHistory.past.length === 0) return state

      const previous = state.fileHistory.past[state.fileHistory.past.length - 1]
      const newPast = state.fileHistory.past.slice(0, -1)

      return {
        ...state,
        fileHistory: {
          past: newPast,
          present: previous,
          future: [state.fileHistory.present, ...state.fileHistory.future],
        },
      }

    case "REDO":
      if (state.fileHistory.future.length === 0) return state

      const next = state.fileHistory.future[0]
      const newFuture = state.fileHistory.future.slice(1)

      return {
        ...state,
        fileHistory: {
          past: [...state.fileHistory.past, state.fileHistory.present],
          present: next,
          future: newFuture,
        },
      }

    case "UPDATE_EDITOR_SETTINGS":
      const updatedSettings = {
        ...state.userPreferences.editorSettings,
        ...action.payload,
      }

      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          editorSettings: updatedSettings,
        },
      }

    case "SET_LANGUAGE":
      // Directly update localStorage to ensure persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("app-language", action.payload)
      }
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          language: action.payload,
        },
      }

    case "LOAD_USER_PREFERENCES":
      // This would normally load from localStorage or an API
      // For now, we'll just return the current state
      return state

    case "RESET_TO_DEFAULTS":
      return {
        ...state,
        userPreferences: defaultUserPreferences,
      }

    default:
      return state
  }
}

// Create context
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<ActionType>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load user preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem("userPreferences")
      if (savedPreferences) {
        const parsedPreferences = JSON.parse(savedPreferences) as UserPreferences
        dispatch({
          type: "UPDATE_EDITOR_SETTINGS",
          payload: parsedPreferences.editorSettings,
        })
        dispatch({
          type: "SET_LANGUAGE",
          payload: parsedPreferences.language,
        })

        // Restore last open file if it exists
        if (
          parsedPreferences.lastOpenFile &&
          state.fileHistory.present.some((file) => file.name === parsedPreferences.lastOpenFile)
        ) {
          dispatch({
            type: "SET_ACTIVE_FILE",
            payload: parsedPreferences.lastOpenFile,
          })
        }
      }
    } catch (error) {
      console.error("Failed to load user preferences:", error)
    }
  }, [])

  // Save user preferences to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem("userPreferences", JSON.stringify(state.userPreferences))
    } catch (error) {
      console.error("Failed to save user preferences:", error)
    }
  }, [state.userPreferences])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

// Custom hook to use the app context
export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

