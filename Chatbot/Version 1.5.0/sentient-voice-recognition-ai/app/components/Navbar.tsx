"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Settings2, MessageSquare, ExternalLink } from "lucide-react"

interface NavbarProps {
  onSettingsClick?: () => void
  onChatHistoryClick?: () => void
  showChatHistory?: boolean
}

export function Navbar({ onSettingsClick, onChatHistoryClick, showChatHistory }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)

  // Add scroll effect to navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [scrolled])

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="relative w-10 h-10 mr-3">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/me2-8HOE5vM0UkfFRySvoCd8ZQagQdjJa3.png"
              alt="Sentient AI Logo"
              fill
              className="rounded-full object-contain"
              priority
            />
          </div>
          <motion.h1
            className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Sentient AI
          </motion.h1>
        </div>

        <div className="flex space-x-2">
          <motion.a
            href="https://www.sentient-aiep.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center"
            aria-label="Visit Sentient AI website"
          >
            <span className="hidden sm:inline text-xs mr-1 text-white">Website</span>
            <ExternalLink size={18} className="text-white" />
          </motion.a>

          {onChatHistoryClick && (
            <motion.button
              whileHover={{ scale: 1.1, boxShadow: "0 0 8px rgba(59, 130, 246, 0.6)" }}
              whileTap={{ scale: 0.9 }}
              onClick={onChatHistoryClick}
              className={`p-2 rounded-full relative overflow-hidden ${
                showChatHistory ? "bg-blue-500" : "bg-gray-800/30 hover:bg-gray-800/50"
              }`}
              aria-label="Chat History"
              animate={
                showChatHistory
                  ? {
                      rotate: 0,
                      backgroundColor: "rgb(59, 130, 246)",
                      boxShadow: "0 0 12px rgba(59, 130, 246, 0.7)",
                    }
                  : {
                      rotate: [0, -15, 15, -8, 8, 0],
                      backgroundColor: ["rgba(31, 41, 55, 0.3)", "rgba(31, 41, 55, 0.5)", "rgba(31, 41, 55, 0.3)"],
                      boxShadow: [
                        "0 0 0px rgba(59, 130, 246, 0)",
                        "0 0 15px rgba(124, 58, 237, 0.5)",
                        "0 0 0px rgba(59, 130, 246, 0)",
                      ],
                      transition: {
                        duration: 0.8,
                        ease: [0.25, 0.1, 0.25, 1],
                        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                        repeat: 0,
                      },
                    }
              }
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
              }}
            >
              {/* Ripple effect when hiding */}
              {!showChatHistory && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-purple-500/20"
                  initial={{ scale: 0, opacity: 0.8 }}
                  animate={{
                    scale: [0, 1.5],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut",
                    repeat: 0,
                  }}
                />
              )}

              <motion.div
                animate={
                  showChatHistory
                    ? { scale: 1, rotate: 0 }
                    : {
                        scale: [1, 0.7, 1.2, 0.9, 1],
                        rotate: [0, -10, 10, -5, 0],
                        transition: {
                          duration: 0.7,
                          times: [0, 0.2, 0.5, 0.8, 1],
                        },
                      }
                }
              >
                <MessageSquare size={20} className={showChatHistory ? "text-white" : "text-blue-100"} />
              </motion.div>
            </motion.button>
          )}

          {onSettingsClick && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSettingsClick}
              className="p-2 rounded-full bg-gray-800/30 hover:bg-gray-800/50"
              aria-label="Settings"
            >
              <Settings2 size={20} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.nav>
  )
}

