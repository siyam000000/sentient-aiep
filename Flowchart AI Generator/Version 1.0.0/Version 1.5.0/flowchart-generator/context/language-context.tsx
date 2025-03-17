"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type SupportedLanguage, SUPPORTED_LANGUAGES } from "@/config/app-config"

type LanguageContextType = {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Try to get the language from localStorage, default to 'en'
  const [language, setLanguage] = useState<SupportedLanguage>("en")

  useEffect(() => {
    // Get language preference from localStorage on mount
    const savedLanguage = localStorage.getItem("preferredLanguage") as SupportedLanguage | null
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      setLanguage(savedLanguage)
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split("-")[0] as SupportedLanguage
      if (SUPPORTED_LANGUAGES.includes(browserLang)) {
        setLanguage(browserLang)
      }
    }
  }, [])

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("preferredLanguage", language)
    // Also set the lang attribute on the html element
    document.documentElement.lang = language
  }, [language])

  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === "en" ? "bg" : "en"))
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

