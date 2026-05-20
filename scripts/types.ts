export interface Repo {
  id: string
  name: string
  description: string
  url: string
  stars: string
  starsCount: number // numeric for sorting
  tags: string[]
  category: string
  author: string
  featured: boolean
}

export interface FetchResult {
  name: string
  description: string
  url: string
  stars: string
  starsCount: number
  primaryLanguage: string | null
  updatedAt: string
  isArchived: boolean
  isFork: boolean
}

export interface FilterConfig {
  minStars: number
  maxAgeDays: number
  requireDescription: boolean
  excludeArchived: boolean
  excludeForked: boolean
}

export interface CategoryConfig {
  name: string
  searchTerms: string[]
  trendingPath: string
}

export interface UpdatePayload {
  date: string
  action: 'add'
  projects: Array<{
    name: string
    description: string
    url: string
    stars: string
    category: string
    tags: string[]
    author: string
    source: 'trending' | 'search' | 'category'
    reason: string
  }>
  removed: string[]
}