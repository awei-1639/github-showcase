export interface Repo {
  id: string
  name: string
  description: string
  url: string
  stars: string
  starsCount: number
  tags: string[]
  category: string
  author: string
  featured: boolean
  // Activity metrics
  openIssues?: number
  closedIssues?: number
  recentCommits?: number
  lastCommitDate?: string
  // Quality metrics
  qualityScore?: number
  activityLevel?: 'high' | 'medium' | 'low'
}

export interface FetchResult {
  name: string
  description: string
  url: string
  stars: string
  starsCount: number
  primaryLanguage: string | null
  updatedAt: string
  createdAt: string
  pushedAt: string
  isArchived: boolean
  isFork: boolean
  openIssuesCount: number
  closedIssuesCount: number
  forksCount: number
  subscribersCount: number
  topics: string[]
  license: string | null
  homepage: string | null
}

export interface FilterConfig {
  minStars: number
  maxAgeDays: number
  requireDescription: boolean
  excludeArchived: boolean
  excludeForked: boolean
  minActivityRatio: number // open issues / total issues ratio
  maxLastCommitDays: number // max days since last commit
  minQualityScore: number
}

export interface CategoryConfig {
  name: string
  searchTerms: string[]
  trendingPath: string
  keywords: string[]
  weight: number // category matching weight
}

export interface SearchQuery {
  query: string
  perPage: number
  sort: 'stars' | 'updated' | 'relevance'
  order: 'desc' | 'asc'
}

export interface UpdatePayload {
  date: string
  action: 'add' | 'remove' | 'update'
  projects: Array<{
    name: string
    description: string
    url: string
    stars: string
    starsCount: number
    category: string
    tags: string[]
    author: string
    source: 'trending' | 'search' | 'category'
    reason: string
    activityMetrics: {
      openIssues: number
      recentCommits: number
      lastCommitDate: string
    }
  }>
  removed: Array<{
    name: string
    url: string
    reason: 'archived' | 'removed' | 'quality_drop'
  }>
  stats: {
    totalFetched: number
    totalFiltered: number
    totalAdded: number
    totalRemoved: number
    byCategory: Record<string, number>
    bySource: Record<string, number>
  }
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  resetAt: Date
  used: number
}

export interface QueueItem {
  id: string
  priority: number
  execute: () => Promise<unknown>
  resolve: (value: unknown) => void
  reject: (error: Error) => void
}
