import type { LightbulbIcon as LucideProps } from "lucide-react"

export function TestTube(props: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 2v17.5A2.5 2.5 0 0 0 11.5 22h1a2.5 2.5 0 0 0 2.5-2.5V2" />
      <path d="M12 2a4 4 0 0 0-4 4v9.5a2.5 2.5 0 0 0 2.5 2.5h3a2.5 2.5 0 0 0 2.5-2.5V6a4 4 0 0 0-4-4Z" />
      <path d="M11 17.5a1.5 1.5 0 0 0 3 0v-8h-3Z" />
    </svg>
  )
}

