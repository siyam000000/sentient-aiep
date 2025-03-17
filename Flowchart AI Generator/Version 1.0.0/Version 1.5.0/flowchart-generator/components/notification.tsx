"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export type NotificationType = "success" | "error" | "warning" | "info"

interface NotificationProps {
  type: NotificationType
  title: string
  message: string
  duration?: number
  onClose?: () => void
  actions?: {
    label: string
    onClick: () => void
  }[]
}

export function Notification({ type, title, message, duration = 5000, onClose, actions = [] }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    if (onClose) {
      onClose()
    }
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      case "warning":
        return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
      case "info":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className={`fixed top-4 right-4 z-50 max-w-md rounded-lg shadow-lg border ${getBgColor()}`}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">{getIcon()}</div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
                {actions.length > 0 && (
                  <div className="mt-3 flex space-x-2">
                    {actions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          action.onClick()
                          handleClose()
                        }}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="rounded-md inline-flex text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

