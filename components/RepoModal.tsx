'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Star, User, Tag, Github } from 'lucide-react'
import { Repo } from './RepoCard'

interface RepoModalProps {
  repo: Repo | null
  onClose: () => void
}

const categoryColors: Record<string, string> = {
  learning: 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/10',
  tools: 'text-neon-pink border-neon-pink/30 bg-neon-pink/10',
  frontend: 'text-neon-purple border-neon-purple/30 bg-neon-purple/10',
  api: 'text-green-400 border-green-400/30 bg-green-400/10',
  devops: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  security: 'text-red-400 border-red-400/30 bg-red-400/10',
  backend: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  apps: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  ai: 'text-pink-400 border-pink-400/30 bg-pink-400/10',
  monitoring: 'text-indigo-400 border-indigo-400/30 bg-indigo-400/10',
  automation: 'text-teal-400 border-teal-400/30 bg-teal-400/10',
  analytics: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
}

export default function RepoModal({ repo, onClose }: RepoModalProps) {
  return (
    <AnimatePresence>
      {repo && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-void/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="
              relative w-full max-w-2xl
              bg-surface border border-neon-cyan/30 rounded-2xl
              shadow-[0_0_60px_rgba(0,245,255,0.2)]
              pointer-events-auto overflow-hidden
            ">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-elevated/50 border border-text-muted/10 text-text-muted hover:text-neon-cyan hover:border-neon-cyan/30 transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Top border glow */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/80 to-transparent" />

              <div className="p-8">
                {/* Category */}
                <div className={`inline-flex items-center px-3 py-1 rounded-full border font-jetbrains text-sm mb-4 ${categoryColors[repo.category] || 'text-text-muted border-text-muted/30 bg-text-muted/10'}`}>
                  /{repo.category}
                </div>

                {/* Title */}
                <h2 className="font-orbitron text-3xl font-bold text-text-primary mb-3">
                  {repo.name}
                </h2>

                {/* Description */}
                <p className="font-jetbrains text-text-muted leading-relaxed mb-6">
                  {repo.description}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-elevated/50 border border-text-muted/10">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="font-jetbrains text-text-primary">{repo.stars} stars</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-elevated/50 border border-text-muted/10">
                    <User className="w-4 h-4 text-neon-cyan" />
                    <span className="font-jetbrains text-text-primary">{repo.author}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  <Tag className="w-4 h-4 text-text-muted/50 mt-1" />
                  {repo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full border border-text-muted/20 font-jetbrains text-sm text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex items-center gap-2 px-6 py-3 rounded-xl
                      bg-neon-cyan/10 border border-neon-cyan/30
                      text-neon-cyan font-jetbrains font-medium
                      hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_rgba(0,245,255,0.3)]
                      transition-all duration-300
                    "
                  >
                    <Github className="w-5 h-5" />
                    View on GitHub
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
