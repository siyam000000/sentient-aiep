"use client"

import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParticles } from "@/context/ParticleContext"

interface AnimationCanvasProps {
  isAnimating: boolean
  mousePosition: { x: number; y: number }
  intensity: number
  particleColor: string
}

export function AnimationCanvas({ isAnimating, mousePosition, intensity, particleColor }: AnimationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { particles, addParticles, updateParticles } = useParticles()
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Generate particles when animation is triggered
  useEffect(() => {
    if (isAnimating) {
      const particleCount = Math.floor(intensity * 0.8)
      addParticles(particleCount, dimensions.width / 2, dimensions.height / 2)
    }
  }, [isAnimating, addParticles, dimensions, intensity])

  // Update particles based on mouse position
  useEffect(() => {
    if (mousePosition.x && mousePosition.y) {
      updateParticles(mousePosition.x, mousePosition.y)
    }
  }, [mousePosition, updateParticles])

  // Draw particles on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = dimensions.width
    canvas.height = dimensions.height

    const animationFrame = requestAnimationFrame(function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        ctx.beginPath()

        // Create gradient for each particle
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size)

        gradient.addColorStop(0, `${particleColor}`)
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.fillStyle = gradient
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        // Update particle position
        particle.x += particle.vx
        particle.y += particle.vy

        // Add gravity effect
        particle.vy += 0.05

        // Add friction
        particle.vx *= 0.99
        particle.vy *= 0.99

        // Reduce size over time
        particle.size -= 0.1

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.8
        }

        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.8
          particle.y = Math.max(0, Math.min(particle.y, canvas.height))
        }
      })

      // Remove particles that are too small
      updateParticles(mousePosition.x, mousePosition.y, true)

      requestAnimationFrame(animate)
    })

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [particles, dimensions, mousePosition, updateParticles, particleColor])

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [1, 2, 0],
              opacity: [0.8, 0.2, 0],
              borderRadius: ["20%", "50%", "50%"],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{
              position: "absolute",
              left: dimensions.width / 2,
              top: dimensions.height / 2,
              width: 100,
              height: 100,
              x: -50,
              y: -50,
              backgroundColor: particleColor,
              boxShadow: `0 0 60px ${particleColor}`,
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

