"use client"

import { useState } from "react"
import { Menu, X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function NavBarPreview() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeView, setActiveView] = useState<"desktop" | "mobile">("desktop")

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex justify-center space-x-4 mb-4">
        <Button variant={activeView === "desktop" ? "default" : "outline"} onClick={() => setActiveView("desktop")}>
          Desktop View
        </Button>
        <Button variant={activeView === "mobile" ? "default" : "outline"} onClick={() => setActiveView("mobile")}>
          Mobile View
        </Button>
      </div>

      <div
        className={`border rounded-lg overflow-hidden shadow-lg ${activeView === "mobile" ? "max-w-sm" : "w-full"} mx-auto`}
      >
        {/* Navigation Bar */}
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
                <div className={activeView === "mobile" ? "hidden" : "block"}>
                  <h1 className="text-xl font-semibold text-white">Sentient AI Flowcharts</h1>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className={activeView === "mobile" ? "hidden" : "flex items-center space-x-4"}>
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-slate-700 flex items-center gap-2"
                >
                  <span>Website</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-slate-700">
                  Settings
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <div className={activeView === "desktop" ? "hidden" : "block"}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-300 hover:text-white hover:bg-slate-700"
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {activeView === "mobile" && isMobileMenuOpen && (
            <div className="bg-slate-800">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <h1 className="text-xl font-semibold text-white px-3 py-2">Sentient AI Flowcharts</h1>
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-slate-700 w-full justify-start flex items-center gap-2"
                >
                  <span>Website</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-slate-700 w-full justify-start"
                >
                  Settings
                </Button>
              </div>
            </div>
          )}
        </nav>

        {/* Content Preview */}
        <div className="bg-slate-100 p-6 h-40 flex items-center justify-center">
          <p className="text-slate-500 text-center">Main content area would appear here</p>
        </div>
      </div>

      {/* Design Features */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Updated Design Features</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>Replaced Features and Examples links with a Website button</li>
          <li>Added external link icon to indicate the button opens in a new tab</li>
          <li>Maintained responsive design for both desktop and mobile views</li>
          <li>Preserved the modern gradient background and visual styling</li>
          <li>Ensured proper language support for Bulgarian translation</li>
          <li>Implemented secure link opening with noopener,noreferrer</li>
        </ul>
      </div>
    </div>
  )
}

