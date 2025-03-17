"use client"

import { useEffect } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { useLanguage } from "../context/language-context"

gsap.registerPlugin(ScrollTrigger)

export function useQuoteAnimation(quoteElementSelector: string) {
  const { language } = useLanguage()

  useEffect(() => {
    const h2Element = document.querySelector(quoteElementSelector)

    if (h2Element) {
      const h2Text = h2Element.textContent || ""
      h2Element.textContent = ""

      const h2Timeline = gsap.timeline()

      let isInsideWord = false
      for (const char of h2Text) {
        if (char === " ") {
          const spaceSpan = document.createElement("span")
          spaceSpan.textContent = char
          h2Element.appendChild(spaceSpan)
        } else {
          if (!isInsideWord) {
            const wordSpan = document.createElement("span")
            h2Element.appendChild(wordSpan)
            isInsideWord = true
          }
          const charSpan = document.createElement("span")
          charSpan.textContent = char
          charSpan.style.display = "inline"
          h2Timeline.from(charSpan, {
            opacity: 0.2,
            duration: 0.6,
            ease: "power3.out",
          })
          h2Element.lastChild?.appendChild(charSpan)
        }
      }

      ScrollTrigger.create({
        trigger: h2Element,
        start: "top bottom",
        end: "bottom center",
        scrub: true,

        onToggle: (self) => {
          if (self.isActive) {
            h2Timeline.play()
          } else {
            h2Timeline.pause()
          }
        },
        onUpdate: (self) => {
          if (self.progress >= 1) {
            h2Timeline.progress(1)
          } else if (self.progress <= 0) {
            h2Timeline.progress(0)
          } else {
            h2Timeline.progress(self.progress)
          }
          const scrollDirection = self.getVelocity() > 1 ? 1 : -1 // 1 for scrolling down, -1 for scrolling up
          if (scrollDirection === 1) {
            h2Timeline.play() // Continue animation when the user scrolls down
          } else {
            h2Timeline.pause() // Stop animation when the user scrolls up
          }
        },
      })
    }
  }, [quoteElementSelector])
}

