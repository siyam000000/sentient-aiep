"use client"

import { useState, useCallback, useEffect } from "react"

const translations = {
  en: {
    explorer: "Explorer",
    search: "Search",
    preview: "Preview",
    aiAssistant: "AI Assistant",
    splitView: "Split View",
    run: "Run",
    undo: "Undo",
    redo: "Redo",
    line: "Ln",
    column: "Col",
    spaces: "Spaces",
    compileError: "Compile Error",
    you: "You",
    ai: "AI",
    chat: "Chat",
    generate: "Generate",
    applyChanges: "Apply Changes",
    describeCodeToGenerate: "Describe the code you want to generate...",
    generateCode: "Generate Code",
    askForCodingHelp: "Ask for coding help...",
    thinking: "Thinking",
    close: "Close",
    fullScreen: "Full Screen",
    exitFullScreen: "Exit Full Screen",
    clickToToggleIndentation: "Click to toggle indentation",
    addFile: "Add File",
    addFolder: "Add Folder",
    rename: "Rename",
    delete: "Delete",
    export: "Export",
    visitWebsite: "Visit Website",
    tryItNow: "Try it now",
    aiCodingHelper: "AI Coding Helper",
    getAIAssistance: "Get AI-powered assistance with your code. Ask questions, generate code, or debug issues!",
    name: "Name",
    newName: "New name",
    add: "Add",
    send: "Send",
  },
  bg: {
    explorer: "Изследовател",
    search: "Търсене",
    preview: "Преглед",
    aiAssistant: "ИИ Асистент",
    splitView: "Разделен изглед",
    run: "Изпълни",
    undo: "Отмени",
    redo: "Повтори",
    line: "Ред",
    column: "Кол",
    spaces: "Интервали",
    compileError: "Грешка при компилиране",
    you: "Вие",
    ai: "ИИ",
    chat: "Чат",
    generate: "Генериране",
    applyChanges: "Приложи промените",
    describeCodeToGenerate: "Опишете кода, който искате да генерирате...",
    generateCode: "Генерирай код",
    askForCodingHelp: "Поискайте помощ за кодиране...",
    thinking: "Мисля",
    close: "Затвори",
    fullScreen: "Цял екран",
    exitFullScreen: "Изход от цял екран",
    clickToToggleIndentation: "Щракнете, за да превключите отстъпа",
    addFile: "Добави файл",
    addFolder: "Добави папка",
    rename: "Преименувай",
    delete: "Изтрий",
    export: "Експортирай",
    visitWebsite: "Посети уебсайта",
    tryItNow: "Опитай сега",
    aiCodingHelper: "ИИ Помощник за кодиране",
    getAIAssistance:
      "Получете помощ с кода си, базирана на ИИ. Задавайте въпроси, генерирайте код или отстранявайте проблеми!",
    name: "Име",
    newName: "Ново име",
    add: "Добави",
    send: "Изпрати",
  },
}

type Language = "en" | "bg"
type TranslationKey = keyof typeof translations.en

export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    // Check if we're in the browser and if there's a stored preference
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("app-language")
      return (storedLanguage as Language) || "bg"
    }
    return "bg" // Default to Bulgarian
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("app-language", currentLanguage)
    }
  }, [currentLanguage])

  const t = useCallback(
    (key: TranslationKey) => {
      return translations[currentLanguage][key] || key
    },
    [currentLanguage],
  )

  const toggleLanguage = useCallback(() => {
    setCurrentLanguage((prev) => (prev === "en" ? "bg" : "en"))
  }, [])

  return { t, toggleLanguage, currentLanguage }
}

