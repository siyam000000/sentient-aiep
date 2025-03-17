import type React from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  icon?: React.ReactNode
}

export function EnhancedButton({ children, isLoading, loadingText, icon, className, ...props }: EnhancedButtonProps) {
  return (
    <Button className={`flex items-center justify-center space-x-2 ${className}`} disabled={isLoading} {...props}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </Button>
  )
}

