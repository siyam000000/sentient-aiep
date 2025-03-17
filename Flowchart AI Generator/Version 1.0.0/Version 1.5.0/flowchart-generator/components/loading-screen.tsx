"use client"

import { motion } from "framer-motion"
import { useTranslations } from "@/hooks/use-translations"

export function LoadingScreen() {
  const { t } = useTranslations()

  return (
    <div className="fixed inset-0 bg-blue-900 dark:bg-slate-900 flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-24 h-24 mb-8">
          <svg
            className="animate-spin w-full h-full text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{t("loading")}</h2>
        <p className="text-blue-200 dark:text-slate-300">{t("preparingApplication")}</p>
      </motion.div>
    </div>
  )
}

