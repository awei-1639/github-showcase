'use client'

import { motion } from 'framer-motion'
import { Layers, Zap } from 'lucide-react'

interface Category {
  name: string
  count: number
}

interface Recommendation {
  id: string
  name: string
  description: string
}

interface SidebarProps {
  categories: Category[]
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
  recommendations?: Recommendation[]
  onRecommendationClick?: (id: string) => void
}

export default function Sidebar({ categories, selectedCategory, onSelectCategory, recommendations, onRecommendationClick }: SidebarProps) {
  return (
    <aside className="w-60 flex-shrink-0">
      <div className="sticky top-24">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">分类</span>
            <div className="flex items-center gap-1 text-xs text-accent">
              <Zap className="w-3 h-3" />
              <span>{categories.reduce((sum, c) => sum + c.count, 0)} 项目</span>
            </div>
          </div>

          <nav className="space-y-1">
            <motion.button
              key="all"
              onClick={() => onSelectCategory(null)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200
                ${selectedCategory === null
                  ? 'bg-accent text-white shadow-lg shadow-accent/25'
                  : 'text-secondary hover:bg-elevated hover:text-primary'
                }
              `}
            >
              <span>全部项目</span>
              <span className={`text-xs ${selectedCategory === null ? 'text-white/70' : 'text-muted'}`}>
                {categories.reduce((sum, c) => sum + c.count, 0)}
              </span>
            </motion.button>

            <div className="h-px bg-border-light my-3" />

            {categories.map((cat, index) => (
              <motion.button
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${selectedCategory === cat.name
                    ? 'bg-accent text-white shadow-lg shadow-accent/25'
                    : 'text-secondary hover:bg-elevated hover:text-primary'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <Layers className={`w-4 h-4 ${selectedCategory === cat.name ? 'text-white/70' : 'text-muted'}`} />
                  {cat.name}
                </span>
                <span className={`text-xs ${selectedCategory === cat.name ? 'text-white/70' : 'text-muted'}`}>
                  {cat.count}
                </span>
              </motion.button>
            ))}
          </nav>
        </div>

        {recommendations && recommendations.length > 0 && (
          <div className="glass rounded-2xl p-4 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">为你推荐</span>
            </div>
            <div className="space-y-2">
              {recommendations.map((rec: Recommendation) => (
                <button
                  key={rec.id}
                  onClick={() => onRecommendationClick?.(rec.id)}
                  className="w-full p-3 rounded-xl bg-white hover:bg-elevated hover:shadow-md transition-all text-left group"
                >
                  <div className="font-medium text-sm text-primary group-hover:text-accent transition-colors">
                    {rec.name}
                  </div>
                  <p className="text-xs text-muted line-clamp-1 mt-1">{rec.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
