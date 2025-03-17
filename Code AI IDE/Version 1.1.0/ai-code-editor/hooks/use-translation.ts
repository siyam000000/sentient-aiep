"use client"

import { useState, useCallback } from "react"

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
  },
  bg: {
    explorer: "Изследовател",
    search: "Търсене",
    preview: "Преглед",
    aiAssistant: "AI Асистент",
    splitView: "Разделен изглед",
    run: "Изпълни",
    undo: "Отмени",
    redo: "Повтори",
    line: "Ред",
    column: "Кол",
    spaces: "Интервали",
    compileError: "Грешка при компилиране",
    you: "Вие",
    ai: "AI",
    chat: "Чат",
    generate: "Генериране",
    applyChanges: "Приложи промените",
    describeCodeToGenerate: "Опишете кода, който искате да генерирате...",
    generateCode: "Генерирай код",
    askForCodingHelp: "Поискайте помощ за кодиране...",
  },
}

type Language = "en" | "bg"
type TranslationKey = keyof typeof translations.en

export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en")

  const t = useCallback(
    (key: TranslationKey) => {
      return translations[currentLanguage][key]
    },
    [currentLanguage],
  )

  const toggleLanguage = useCallback(() => {
    setCurrentLanguage((prev) => (prev === "en" ? "bg" : "en"))
  }, [])

  return { t, toggleLanguage, currentLanguage }
}

