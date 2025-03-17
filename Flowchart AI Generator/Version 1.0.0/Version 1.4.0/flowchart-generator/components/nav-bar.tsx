"use client"

import { useState } from "react"
import { Menu, X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface NavBarProps {
  onSettingsClick?: () => void
  language?: "en" | "bg"
}

export function NavBar({ onSettingsClick, language = "en" }: NavBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const openWebsite = () => {
    window.open("https://www.sentient-aiep.xyz/", "_blank", "noopener,noreferrer")
  }

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title Section */}
          <div className="flex-shrink-0 flex items-center space-x-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/me2-Sl1gR0FgEl7vAMBMCsrY79WJbZxhgF.png"
              alt="Sentient Logo"
              width={40}
              height={40}
              className="rounded-full"
              priority
            />
            <div className="hidden md:block">
              <h1 className="text-xl font-semibold text-white">Sentient AI Flowcharts</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={openWebsite}
              className="text-gray-300 hover:text-white hover:bg-slate-700 flex items-center gap-2"
            >
              <span>{language === "en" ? "Website" : "Уебсайт"}</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={onSettingsClick}
              className="text-gray-300 hover:text-white hover:bg-slate-700"
            >
              {language === "en" ? "Settings" : "Настройки"}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white hover:bg-slate-700"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <h1 className="text-xl font-semibold text-white px-3 py-2">Sentient AI Flowcharts</h1>
            <Button
              variant="ghost"
              onClick={openWebsite}
              className="text-gray-300 hover:text-white hover:bg-slate-700 w-full justify-start flex items-center gap-2"
            >
              <span>{language === "en" ? "Website" : "Уебсайт"}</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                onSettingsClick?.()
                setIsMobileMenuOpen(false)
              }}
              className="text-gray-300 hover:text-white hover:bg-slate-700 w-full justify-start"
            >
              {language === "en" ? "Settings" : "Настройки"}
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}

