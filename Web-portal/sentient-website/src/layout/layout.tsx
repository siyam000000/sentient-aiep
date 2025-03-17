import type React from "react"
import type { ReactNode } from "react"
import NavBar from "../components/NavBar"

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="z-10">
      <NavBar />
      {children}
    </div>
  )
}

export default Layout

