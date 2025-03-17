"use client"

import { useEffect, type RefObject } from "react"

type Handler = (event: MouseEvent | TouchEvent) => void

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: Handler,
  exceptionalRefs: RefObject<HTMLElement>[] = [],
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node

      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(target)) {
        return
      }

      // Do nothing if clicking exceptional refs
      for (const exceptionalRef of exceptionalRefs) {
        if (exceptionalRef.current && exceptionalRef.current.contains(target)) {
          return
        }
      }

      handler(event)
    }

    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)

    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, handler, exceptionalRefs])
}

