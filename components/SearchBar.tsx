'use client'

import { Search } from 'lucide-react'
import { motion } from 'framer-motion'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = '搜索项目名称、描述或标签...' }: SearchBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative max-w-2xl mx-auto w-full px-4"
    >
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-cyan/60 z-10" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full pl-14 pr-6 py-4
            bg-surface/80 backdrop-blur-sm
            border border-neon-cyan/20 rounded-xl
            font-jetbrains text-text-primary placeholder:text-text-muted/50
            focus:outline-none focus:border-neon-cyan/50 focus:shadow-[0_0_25px_rgba(0,245,255,0.2)]
            transition-all duration-300
          "
        />
        {/* Glow effect behind input */}
        <div className="absolute inset-0 rounded-xl bg-neon-cyan/5 blur-xl opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </motion.div>
  )
}
