'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlowBorderProps {
  children: ReactNode
  color?: 'cyan' | 'pink' | 'purple'
  className?: string
}

export default function GlowBorder({ children, color = 'cyan', className = '' }: GlowBorderProps) {
  const colorMap = {
    cyan: 'border-neon-cyan/30 hover:border-neon-cyan/60',
    pink: 'border-neon-pink/30 hover:border-neon-pink/60',
    purple: 'border-neon-purple/30 hover:border-neon-purple/60',
  }

  const shadowMap = {
    cyan: 'hover:shadow-[0_0_25px_rgba(0,245,255,0.5)]',
    pink: 'hover:shadow-[0_0_25px_rgba(255,45,106,0.5)]',
    purple: 'hover:shadow-[0_0_25px_rgba(191,90,242,0.5)]',
  }

  return (
    <motion.div
      className={`
        relative rounded-lg border bg-surface/80 backdrop-blur-sm
        transition-all duration-300 ease-out
        ${colorMap[color]} ${shadowMap[color]} ${className}
      `}
      whileHover={{ y: -4, scale: 1.01 }}
    >
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-transparent via-transparent to-neon-cyan/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
