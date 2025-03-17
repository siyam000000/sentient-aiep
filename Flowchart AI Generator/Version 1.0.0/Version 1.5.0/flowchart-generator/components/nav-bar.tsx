"use client"

import { useState } from "react"
import { Menu, X, ExternalLink, Globe, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface NavBarProps {
  onSettingsClick?: () => void
  language?: "en" | "bg"
  onLanguageToggle?: () => void
  onToggleSidebar?: () => void
}

export function NavBar({ onSettingsClick, language = "en", onLanguageToggle, onToggleSidebar }: NavBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const openWebsite = () => {
    window.open("https://www.sentient-aiep.xyz/", "_blank", "noopener,noreferrer")
  }

  return (
    <nav className="bg-gradient-to-r from-blue-950 to-blue-900 border-b border-blue-800/50 backdrop-blur-sm shadow-md z-10">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Section with Logo and Title */}
          <div className="flex items-center space-x-4">
            {/* Only show sidebar toggle on desktop */}
            <div className="hidden md:block">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                className="text-blue-300 hover:text-white hover:bg-blue-800/50 mr-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-blue-700 shadow-inner">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/me2-Sl1gR0FgEl7vAMBMCsrY79WJbZxhgF.png"
                  alt="Sentient Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  <span className="text-blue-400">Sentient</span> AI Flowcharts
                </h1>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={openWebsite}
              className="text-blue-300 hover:text-white hover:bg-blue-800/50 flex items-center gap-2"
            >
              <span>{language === "en" ? "Website" : "Уебсайт"}</span>
              <ExternalLink className="h-4 w-4" />
            </Button>

            {/* Language Toggle Button */}
            <Button
              variant="ghost"
              onClick={onLanguageToggle}
              className="text-blue-300 hover:text-white hover:bg-blue-800/50 flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              <span>{language === "en" ? "Български" : "English"}</span>
            </Button>

            <Button
              variant="ghost"
              onClick={onSettingsClick}
              className="text-blue-300 hover:text-white hover:bg-blue-800/50"
            >
              <Settings className="h-4 w-4 mr-2" />
              {language === "en" ? "Settings" : "Настройки"}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="text-blue-300 hover:text-white hover:bg-blue-800/50"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-900 border-b border-blue-800 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Button
              variant="ghost"
              onClick={openWebsite}
              className="text-blue-300 hover:text-white hover:bg-blue-800/50 w-full justify-start flex items-center gap-2"
            >
              <span>{language === "en" ? "Website" : "Уебсайт"}</span>
              <ExternalLink className="h-4 w-4" />
            </Button>

            {/* Language Toggle Button for Mobile */}
            <Button
              variant="ghost"
              onClick={onLanguageToggle}
              className="text-blue-300 hover:text-white hover:bg-blue-800/50 w-full justify-start flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              <span>{language === "en" ? "Български" : "English"}</span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => {
                onSettingsClick?.()
                setIsMobileMenuOpen(false)
              }}
              className="text-blue-300 hover:text-white hover:bg-blue-800/50 w-full justify-start flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span>{language === "en" ? "Settings" : "Настройки"}</span>
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}

