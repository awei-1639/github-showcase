'use client'

import { motion } from 'framer-motion'
import { Star, ExternalLink, Folder, TrendingUp } from 'lucide-react'

export interface Repo {
  id: string
  name: string
  description: string
  url: string
  stars: string
  tags: string[]
  category: string
  author: string
  featured: boolean
}

interface RepoCardProps {
  repo: Repo
  onClick: () => void
  index: number
}

const categoryColors: Record<string, { bg: string; text: string; dot: string }> = {
  learning: { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-500' },
  tools: { bg: 'bg-pink-50', text: 'text-pink-600', dot: 'bg-pink-500' },
  frontend: { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500' },
  api: { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' },
  devops: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500' },
  security: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
  backend: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  apps: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  ai: { bg: 'bg-pink-50', text: 'text-pink-600', dot: 'bg-pink-500' },
  monitoring: { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-500' },
  automation: { bg: 'bg-teal-50', text: 'text-teal-600', dot: 'bg-teal-500' },
  analytics: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
}

export default function RepoCard({ repo, onClick, index }: RepoCardProps) {
  const colors = categoryColors[repo.category] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-500' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.99 }}
      className={`
        group relative overflow-hidden
        bg-surface rounded-2xl border border-border-light
        shadow-sm
        transition-all duration-300 ease-out cursor-pointer
        hover:shadow-xl hover:-translate-y-1
      `}
    >
      {/* Top gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Featured badge */}
      {repo.featured && (
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-semibold shadow-lg shadow-amber-500/30">
            <TrendingUp className="w-3 h-3" />
            推荐
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Category */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${colors.bg} ${colors.text} text-xs font-semibold mb-4`}>
          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
          {repo.category}
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-primary mb-2 group-hover:text-accent transition-colors duration-200">
          {repo.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-secondary leading-relaxed mb-4 line-clamp-2">
          {repo.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {repo.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-lg bg-elevated text-xs text-muted font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border-light">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-primary">{repo.stars}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted">
              <Folder className="w-4 h-4" />
              <span>@{repo.author}</span>
            </div>
          </div>
          <ExternalLink className="w-5 h-5 text-muted opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:text-accent" />
        </div>
      </div>
    </motion.div>
  )
}
