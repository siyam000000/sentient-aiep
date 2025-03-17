"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface Particle {
  x: number
  y: number
  size: number
  vx: number
  vy: number
  color: string
  life: number
}

interface ParticleContextType {
  particles: Particle[]
  addParticles: (count: number, x: number, y: number) => void
  updateParticles: (mouseX: number, mouseY: number, cleanup?: boolean) => void
}

const ParticleContext = createContext<ParticleContextType | undefined>(undefined)

export function ParticleProvider({ children }: { children: ReactNode }) {
  const [particles, setParticles] = useState<Particle[]>([])

  const addParticles = useCallback((count: number, x: number, y: number) => {
    const newParticles: Particle[] = []

    for (let i = 0; i < count; i++) {
      // Calculate random velocity
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 5 + 2

      newParticles.push({
        x,
        y,
        size: Math.random() * 10 + 5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: `hsl(${Math.random() * 60 + 200}, 100%, 50%)`,
        life: 100,
      })
    }

    setParticles((prev) => [...prev, ...newParticles])
  }, [])

  const updateParticles = useCallback((mouseX: number, mouseY: number, cleanup = false) => {
    setParticles((prev) => {
      // Remove particles that are too small or have expired
      if (cleanup) {
        return prev.filter((p) => p.size > 0.5)
      }

      // Apply mouse influence to particles
      return prev.map((particle) => {
        // Calculate distance to mouse
        const dx = mouseX - particle.x
        const dy = mouseY - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Only affect particles within a certain radius
        if (distance < 200) {
          const force = ((200 - distance) / 200) * 0.5

          return {
            ...particle,
            vx: particle.vx + (dx / distance) * force,
            vy: particle.vy + (dy / distance) * force,
          }
        }

        return particle
      })
    })
  }, [])

  return (
    <ParticleContext.Provider value={{ particles, addParticles, updateParticles }}>{children}</ParticleContext.Provider>
  )
}

export function useParticles() {
  const context = useContext(ParticleContext)
  if (context === undefined) {
    throw new Error("useParticles must be used within a ParticleProvider")
  }
  return context
}

