"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { Notification, type NotificationType } from "@/components/notification"
import { v4 as uuidv4 } from "uuid"

interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  actions?: {
    label: string
    onClick: () => void
  }[]
}

interface NotificationContextType {
  notifications: NotificationItem[]
  showNotification: (notification: Omit<NotificationItem, "id">) => string
  hideNotification: (id: string) => void
  clearAllNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const showNotification = useCallback((notification: Omit<NotificationItem, "id">) => {
    const id = uuidv4()
    setNotifications((prev) => [...prev, { ...notification, id }])
    return id
  }, [])

  const hideNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, hideNotification, clearAllNotifications }}>
      {children}
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          duration={notification.duration}
          actions={notification.actions}
          onClose={() => hideNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}

