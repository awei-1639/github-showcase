'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Fuse from 'fuse.js'
import { Layers, Search, Star } from 'lucide-react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import SearchBar from '@/components/SearchBar'
import TagCloud from '@/components/TagCloud'
import RepoGrid from '@/components/RepoGrid'
import RepoPanel from '@/components/RepoPanel'
import { Repo } from '@/components/RepoCard'
import reposData from '@/data/repos.json'

function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('searchHistory')
    if (stored) {
      setHistory(JSON.parse(stored))
    }
  }, [])

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return
    const newHistory = [query, ...history.filter(h => h !== query)].slice(0, 5)
    setHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
  }, [history])

  return { history, addToHistory }
}

const fuseOptions = {
  keys: ['name', 'description', 'tags', 'author', 'category'],
  threshold: 0.35,
  ignoreLocation: true,
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null)
  const [mounted, setMounted] = useState(false)

  const { history, addToHistory } = useSearchHistory()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (searchQuery.length > 2) {
      addToHistory(searchQuery)
    }
  }, [searchQuery, addToHistory])

  const fuse = useMemo(() => new Fuse(reposData as Repo[], fuseOptions), [])

  // Personalized recommendations based on search history
  const recommendations = useMemo(() => {
    if (history.length === 0) {
      // Fallback: top starred repos
      return (reposData as Repo[])
        .sort((a, b) => parseInt(b.stars) - parseInt(a.stars))
        .slice(0, 3)
    }

    // Find repos matching search history
    const matched = new Set<string>()
    history.forEach(query => {
      const results = new Fuse(reposData as Repo[], fuseOptions)
        .search(query)
        .map(r => r.item.id)
      results.forEach(id => matched.add(id))
    })

    return Array.from(matched)
      .map(id => reposData.find(r => r.id === id))
      .filter(Boolean)
      .slice(0, 3) as Repo[]
  }, [history])

  // Calculate categories with counts
  const categories = useMemo(() => {
    const counts: Record<string, number> = {}
    reposData.forEach((repo) => {
      counts[repo.category] = (counts[repo.category] || 0) + 1
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [])

  // Calculate all tags with counts
  const allTags = useMemo(() => {
    const counts: Record<string, number> = {}
    reposData.forEach((repo) => {
      repo.tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1
      })
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)
  }, [])

  // Filter repos
  const filteredRepos = useMemo(() => {
    let results = reposData as Repo[]

    // Category filter
    if (selectedCategory) {
      results = results.filter((repo) => repo.category === selectedCategory)
    }

    // Tag filter (AND logic)
    if (selectedTags.length > 0) {
      results = results.filter((repo) =>
        selectedTags.every((tag) => repo.tags.includes(tag))
      )
    }

    // Search filter
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery)
      const searchIds = new Set(searchResults.map((r) => r.item.id))
      results = results.filter((repo) => searchIds.has(repo.id))
    }

    return results
  }, [searchQuery, selectedCategory, selectedTags, fuse])

  // Editorial picks - featured repos
  const editorialPicks = useMemo(() => {
    return (reposData as Repo[])
      .filter(repo => repo.featured)
      .slice(0, 5)
  }, [])

  // Related repos for panel
  const relatedRepos = useMemo(() => {
    if (!selectedRepo) return []
    return reposData
      .filter((r) => r.id !== selectedRepo.id && r.category === selectedRepo.category)
      .slice(0, 3)
  }, [selectedRepo])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base">
      <Header />

      {editorialPicks.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 flex items-center justify-center">
              <Star className="w-4 h-4 text-neon-cyan" />
            </div>
            <h2 className="text-lg font-bold text-primary">编辑精选</h2>
            <span className="text-xs text-muted px-2 py-0.5 rounded-full bg-elevated">推荐项目</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {editorialPicks.map((repo, index) => (
              <motion.button
                key={repo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedRepo(repo)}
                className="relative p-5 bg-surface rounded-xl border border-border-light hover:border-neon-cyan/50 transition-all text-left group overflow-hidden"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                    <span className="font-bold text-sm text-primary group-hover:text-neon-cyan transition-colors">
                      {repo.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted line-clamp-2 mb-3">{repo.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted">
                      <Star className="w-3 h-3 text-amber-400" />
                      <span>{repo.stars}</span>
                    </div>
                    <span className="text-xs text-neon-purple/70 group-hover:text-neon-purple transition-colors">查看 →</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <Sidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            recommendations={recommendations.map(r => ({ id: r.id, name: r.name, description: r.description }))}
            onRecommendationClick={(id) => {
              const repo = reposData.find((r: Repo) => r.id === id)
              if (repo) setSelectedRepo(repo)
            }}
          />

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Search */}
            <div className="mb-6">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            {/* Tags */}
            <div className="mb-6">
              <TagCloud
                tags={allTags}
                selectedTags={selectedTags}
                onToggleTag={toggleTag}
                onClearTags={() => setSelectedTags([])}
              />
            </div>

            {/* Results info */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted">
                找到 <span className="font-semibold text-primary">{filteredRepos.length}</span> 个项目
                {selectedCategory && (
                  <span> · <span className="font-medium text-secondary">{selectedCategory}</span></span>
                )}
              </p>
            </div>

            {/* Grid */}
            <RepoGrid repos={filteredRepos} onCardClick={setSelectedRepo} />
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 py-6 border-t border-border text-center">
        <p className="text-sm text-muted">
          GitHub Showcase · 优秀开源项目精选
        </p>
      </footer>

      {/* Detail panel */}
      <RepoPanel
        repo={selectedRepo}
        onClose={() => setSelectedRepo(null)}
        relatedRepos={relatedRepos}
        onRelatedClick={setSelectedRepo}
      />
    </div>
  )
}
