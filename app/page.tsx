'use client'

import { useState, useMemo, useEffect } from 'react'
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

  const addToHistory = (query: string) => {
    if (!query.trim()) return
    const newHistory = [query, ...history.filter(h => h !== query)].slice(0, 5)
    setHistory(newHistory)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
  }

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
  }, [searchQuery])

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
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-primary">编辑精选</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {editorialPicks.map(repo => (
              <button
                key={repo.id}
                onClick={() => setSelectedRepo(repo)}
                className="p-4 bg-white rounded-xl border border-border-light hover:border-accent hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm text-primary group-hover:text-accent transition-colors">
                    {repo.name}
                  </span>
                </div>
                <p className="text-xs text-secondary line-clamp-2">{repo.description}</p>
                <div className="flex items-center gap-1 mt-3 text-xs text-muted">
                  <Star className="w-3 h-3 text-amber-400" />
                  <span>{repo.stars}</span>
                </div>
              </button>
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
