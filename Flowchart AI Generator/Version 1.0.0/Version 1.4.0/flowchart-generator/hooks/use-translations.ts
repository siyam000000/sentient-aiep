"use client"

import { useCallback } from "react"
import { TRANSLATIONS, type SupportedLanguage } from "@/config/app-config"

/**
 * Custom hook for handling translations
 *
 * @param language - The current language
 * @returns Object with translation functions
 */
export function useTranslations(language: SupportedLanguage) {
  /**
   * Get a translation by key
   *
   * @param key - The translation key
   * @returns The translated string
   */
  const t = useCallback(
    (key: keyof (typeof TRANSLATIONS)["en"]) => {
      return TRANSLATIONS[language][key] || key
    },
    [language],
  )

  return { t }
}

