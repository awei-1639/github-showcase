import { FetchResult, FilterConfig } from './types'

const DEFAULT_FILTERS: FilterConfig = {
  minStars: 10000,
  maxAgeDays: 180,
  requireDescription: true,
  excludeArchived: true,
  excludeForked: true
}

const categoryKeywords: Record<string, string[]> = {
  'learning': ['learn', 'tutorial', 'course', 'book', 'guide', 'awesome'],
  'tools': ['cli', 'tool', 'utility', 'library', 'package'],
  'frontend': ['react', 'vue', 'angular', 'css', 'ui', 'component'],
  'api': ['api', 'rest', 'graphql', 'endpoint', 'server'],
  'devops': ['docker', 'kubernetes', 'ci/cd', 'deploy', 'infrastructure'],
  'security': ['security', 'auth', 'crypto', 'vulnerability'],
  'backend': ['backend', 'database', 'server', 'node', 'python'],
  'ai': ['ai', 'machine learning', 'neural', 'gpt', 'llm', 'deep learning']
}

export function filterRepos(repos: FetchResult[], filters: FilterConfig = DEFAULT_FILTERS): FetchResult[] {
  const now = new Date()

  return repos.filter((repo) => {
    // Filter by minimum stars
    if (repo.starsCount < filters.minStars) {
      return false
    }

    // Filter by maximum age
    if (filters.maxAgeDays > 0) {
      const updatedDate = new Date(repo.updatedAt)
      const ageInDays = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24))
      if (ageInDays > filters.maxAgeDays) {
        return false
      }
    }

    // Filter by description requirement
    if (filters.requireDescription && (!repo.description || repo.description.trim() === '')) {
      return false
    }

    // Filter out archived repos
    if (filters.excludeArchived && repo.isArchived) {
      return false
    }

    // Filter out forked repos
    if (filters.excludeForked && repo.isFork) {
      return false
    }

    return true
  })
}

export function deduplicateByUrl(newRepos: FetchResult[], existingUrls: Set<string>): FetchResult[] {
  return newRepos.filter((repo) => !existingUrls.has(repo.url))
}

export function assignCategory(repo: FetchResult, categories: string[]): string {
  const searchText = `${repo.name} ${repo.description}`.toLowerCase()

  let bestMatch = 'tools' // default category
  let highestScore = 0

  for (const category of categories) {
    const keywords = categoryKeywords[category]
    if (!keywords) continue

    let score = 0
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        score++
      }
    }

    if (score > highestScore) {
      highestScore = score
      bestMatch = category
    }
  }

  return bestMatch
}

export function generateTags(repo: FetchResult): string[] {
  const tags: string[] = []
  const searchText = `${repo.name} ${repo.description}`.toLowerCase()

  // Add primary language as tag
  if (repo.primaryLanguage) {
    tags.push(repo.primaryLanguage)
  }

  // Match keywords in name/description
  const allKeywords = new Set<string>()
  for (const keywords of Object.values(categoryKeywords)) {
    for (const keyword of keywords) {
      allKeywords.add(keyword.toLowerCase())
    }
  }

  for (const keyword of allKeywords) {
    if (searchText.includes(keyword)) {
      const capitalizedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1)
      if (!tags.includes(capitalizedKeyword)) {
        tags.push(capitalizedKeyword)
      }
    }
  }

  return tags
}
