'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-[60vh] flex flex-col items-center justify-center px-4 pt-20 pb-16 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-50" />
      
      {/* Glowing orb decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-neon-pink/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Label badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 mb-8"
        >
          <Sparkles className="w-4 h-4 text-neon-cyan animate-pulse" />
          <span className="text-sm font-jetbrains text-neon-cyan tracking-wider">CURATED Open Source</span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-orbitron text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
        >
          <span className="neon-text-cyan">GitHub</span>
          <br />
          <span className="text-text-primary">Showcase</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-jetbrains text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          精心筛选的优质开源项目集合
          <br />
          <span className="text-neon-cyan">{'// 找到真正值得使用的工具'}</span>
        </motion.p>

        {/* Decorative code line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-jetbrains text-sm text-text-muted/60"
        >
          <span className="text-neon-pink">const</span>{' '}
          <span className="text-neon-cyan">awesome</span>{' = '}
          <span className="text-text-muted">await</span>{' '}
          <span className="text-neon-purple">discover</span>
          <span className="text-text-muted">(</span>
          <span className="text-neon-cyan">&apos;open-source&apos;</span>
          <span className="text-text-muted">)</span>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-neon-cyan/30 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 bg-neon-cyan rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
