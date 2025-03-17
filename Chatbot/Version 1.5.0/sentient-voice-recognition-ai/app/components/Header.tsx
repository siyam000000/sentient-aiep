import Link from "next/link"

export const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-3">
        <ul className="flex space-x-4">
          <li>
            <Link href="/" className="text-gray-800 hover:text-gray-600">
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className="text-gray-800 hover:text-gray-600">
              About
            </Link>
          </li>
          {/* Add more navigation items as needed */}
        </ul>
      </nav>
    </header>
  )
}

