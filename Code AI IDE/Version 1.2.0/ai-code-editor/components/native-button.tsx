"use client"
import { cn } from "@/lib/utils"

// Стилове за бутони, които можете да използвате директно с HTML бутони
export const buttonStyles = {
  base: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",

  variants: {
    default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow",
    outline: "border border-gray-700 bg-transparent hover:bg-gray-800 text-white",
    secondary: "bg-gray-800 text-white hover:bg-gray-700 shadow-sm hover:shadow",
    ghost: "bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white",
    link: "text-blue-500 underline-offset-4 hover:underline bg-transparent",
    gradient:
      "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 shadow-md hover:shadow-lg",
  },

  sizes: {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3 text-xs",
    lg: "h-11 rounded-md px-8 text-base",
    icon: "h-10 w-10",
  },

  // Помощна функция за комбиниране на стилове
  getStyles: (variant = "default", size = "default", className = "") => {
    return cn(buttonStyles.base, buttonStyles.variants[variant], buttonStyles.sizes[size], className)
  },
}

// Примерен компонент за зареждащ се индикатор
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin h-4 w-4", className)}
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
  )
}

