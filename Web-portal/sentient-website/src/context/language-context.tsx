"use client"

import type React from "react"

import { useEffect, useState, createContext, useContext } from "react"

type language = "EN" | "BG"

type LanguageContextProviderProps = {
  children: React.ReactNode
}

type LanguageContextType = {
  language: language
  toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export default function LanguageContextProvider({ children }: LanguageContextProviderProps) {
  const [language, setLanguage] = useState<language>("EN")

  const toggleLanguage = () => {
    if (language === "EN") {
      setLanguage("BG")
      window.localStorage.setItem("language", "BG")
      document.documentElement.classList.add("BG")
    } else {
      setLanguage("EN")
      window.localStorage.setItem("language", "EN")
      document.documentElement.classList.remove("BG")
    }
  }

  useEffect(() => {
    const localLanguage = window.localStorage.getItem("language") as language | null

    if (localLanguage) {
      setLanguage(localLanguage)

      if (localLanguage === "BG") {
        document.documentElement.classList.add("BG")
      }
    } else if (window.matchMedia("(prefers-color-scheme: BG)").matches) {
      setLanguage("BG")
      document.documentElement.classList.add("BG")
    }
  }, [])

  return (
    <LanguageContext.Provider
      value={{
        language,
        toggleLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (context === null) {
    throw new Error("useLanguage must be used within a LanguageContextProvider")
  }

  return context
}

