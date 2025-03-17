"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sanitizeUserInput } from "@/utils/input-sanitizers"

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
  helpText?: string
  sanitize?: boolean
  pattern?: string
  patternMessage?: string
}

export function ValidatedInput({
  id,
  label,
  error,
  helpText,
  className = "",
  sanitize = false,
  pattern,
  patternMessage = "Invalid format",
  onChange,
  onBlur,
  ...props
}: ValidatedInputProps) {
  const [localError, setLocalError] = useState<string | null>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Clear validation errors when input changes
      setLocalError(null)

      // Apply sanitization if needed
      if (sanitize) {
        const sanitizedValue = sanitizeUserInput(e.target.value)
        // Create a new synthetic event with the sanitized value
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: sanitizedValue,
          },
        }
        onChange?.(syntheticEvent as React.ChangeEvent<HTMLInputElement>)
      } else {
        onChange?.(e)
      }
    },
    [onChange, sanitize],
  )

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      // Validate against pattern if provided
      if (pattern && e.target.value) {
        const regex = new RegExp(pattern)
        if (!regex.test(e.target.value)) {
          setLocalError(patternMessage)
        } else {
          setLocalError(null)
        }
      }

      onBlur?.(e)
    },
    [onBlur, pattern, patternMessage],
  )

  // Use provided error or local validation error
  const displayError = error || localError

  return (
    <div className={`space-y-2 ${className}`} data-testid="input-container">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={displayError ? "true" : "false"}
        aria-describedby={displayError ? `${id}-error` : helpText ? `${id}-help` : undefined}
        onChange={handleChange}
        onBlur={handleBlur}
        className={displayError ? "border-red-500 focus-visible:ring-red-500" : ""}
        {...props}
      />
      {displayError && (
        <p id={`${id}-error`} className="text-sm text-red-500">
          {displayError}
        </p>
      )}
      {helpText && !displayError && (
        <p id={`${id}-help`} className="text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  )
}

