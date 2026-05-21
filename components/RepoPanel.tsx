'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Star, User, Tag, Github, ArrowRight, Sparkles } from 'lucide-react'
import { Repo } from './RepoCard'
import reposData from '@/data/repos.json'

const panelVariants = {
  hidden: { x: '100%', opacity: 0 },
  show: { x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 200 } },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.2 } }
}

function getSimilarRepos(currentRepo: Repo, allRepos: Repo[], count: number = 3): Repo[] {
  return allRepos
    .filter(r => r.id !== currentRepo.id)
    .map(r => {
      let score = 0
      if (r.category === currentRepo.category) score += 2
      r.tags.forEach(tag => {
        if (currentRepo.tags.includes(tag)) score += 1
      })
      return { repo: r, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(item => item.repo)
}

interface RepoPanelProps {
  repo: Repo | null
  onClose: () => void
  relatedRepos?: Repo[]
  onRelatedClick?: (repo: Repo) => void
}

export default function RepoPanel({ repo, onClose, relatedRepos = [], onRelatedClick }: RepoPanelProps) {
  const similarRepos = useMemo(() => {
    if (!repo) return []
    return getSimilarRepos(repo, reposData as Repo[])
  }, [repo])

  return (
    <AnimatePresence>
      {repo && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          <motion.div
            key="panel"
            variants={panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-surface z-50 shadow-2xl overflow-hidden"
          >
            <div className="sticky top-0 z-10 bg-surface/90 backdrop-blur-xl border-b border-border-light px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center shadow-lg shadow-accent/20">
                  <Github className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-primary">项目详情</h2>
                  <p className="text-xs text-muted">查看完整信息</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-elevated hover:bg-border-light flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
              <div className="relative">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-accent/10 to-purple-500/10 rounded-full blur-2xl" />
                <div className="relative">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-accent/10 text-accent text-sm font-semibold mb-4">
                    {repo.category}
                  </span>
                  <h3 className="text-3xl font-bold text-primary mb-3 leading-tight">{repo.name}</h3>
                  <p className="text-secondary leading-relaxed text-lg">{repo.description}</p>
                </div>
              </div>

              <div className="flex items-stretch gap-3">
                <div className="flex-1 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-5 h-5 text-amber-500" />
                    <span className="text-sm text-muted">Stars</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{repo.stars}</p>
                </div>
                <div className="flex-1 p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-purple-50 border border-accent/10">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-5 h-5 text-accent" />
                    <span className="text-sm text-muted">作者</span>
                  </div>
                  <p className="text-lg font-bold text-primary">{repo.author}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-muted" />
                  <span className="text-sm font-semibold text-secondary">相关标签</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {repo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 rounded-xl bg-elevated text-sm text-secondary font-medium border border-border-light hover:border-accent/30 hover:text-accent transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn relative overflow-hidden w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-accent to-purple-600 text-white font-semibold shadow-xl shadow-accent/25 hover:shadow-2xl hover:shadow-accent/30 transition-all duration-300"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-accent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center gap-3">
                    <Github className="w-5 h-5" />
                    在 GitHub 上查看
                    <ExternalLink className="w-4 h-4 opacity-70 group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                </a>
              </div>

              {relatedRepos.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-sm font-semibold text-secondary">相关项目</span>
                  </div>
                  <div className="space-y-2">
                    {relatedRepos.map((r) => (
                      <motion.button
                        key={r.id}
                        onClick={() => onRelatedClick?.(r)}
                        whileHover={{ x: 4 }}
                        className="w-full text-left p-4 rounded-2xl bg-elevated border border-border-light hover:border-accent/30 hover:bg-surface transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-primary group-hover:text-accent transition-colors">{r.name}</span>
                          <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                        </div>
                        <p className="text-sm text-muted line-clamp-1">{r.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400" />
                            {r.stars}
                          </span>
                          <span>@{r.author}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {similarRepos.length > 0 && (
                <div className="border-t border-border-light pt-6 mt-6">
                  <h4 className="text-sm font-semibold text-primary mb-4">相似项目</h4>
                  <div className="space-y-3">
                    {similarRepos.map(r => (
                      <button
                        key={r.id}
                        onClick={() => onRelatedClick?.(r)}
                        className="w-full p-3 rounded-xl bg-elevated hover:bg-accent-light transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-primary">{r.name}</span>
                          <span className="text-xs text-muted">★ {r.stars}</span>
                        </div>
                        <p className="text-xs text-secondary mt-1 line-clamp-1">{r.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
