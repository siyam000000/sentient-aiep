"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LanguageSelector } from "@/components/LanguageSelector"

const Header = () => {
  const pathname = usePathname()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          VoiceAI SaaS
        </Link>
        <nav>
          <ul className="flex space-x-4 items-center">
            <li>
              <Button variant={pathname === "/dashboard" ? "default" : "ghost"} asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </li>
            <li>
              <Button variant={pathname === "/settings" ? "default" : "ghost"} asChild>
                <Link href="/settings">Settings</Link>
              </Button>
            </li>
            <li>
              <LanguageSelector />
            </li>
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header

