import { FetchResult, FilterConfig, CategoryConfig } from './types'

const DEFAULT_FILTERS: FilterConfig = {
  minStars: 10000,
  maxAgeDays: 365,
  requireDescription: true,
  excludeArchived: true,
  excludeForked: true,
  minActivityRatio: 0, // Ratio of open issues to total issues
  maxLastCommitDays: 180, // Max days since last commit
  minQualityScore: 0,
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    name: 'learning',
    searchTerms: ['programming tutorial', 'learn to code', 'free programming books', 'coding education'],
    trendingPath: '',
    keywords: ['learn', 'tutorial', 'course', 'book', 'guide', 'awesome', 'education', 'beginner', 'study'],
    weight: 1.0,
  },
  {
    name: 'tools',
    searchTerms: ['cli tools', 'developer utilities', 'open source tools', 'productivity'],
    trendingPath: '',
    keywords: ['cli', 'tool', 'utility', 'library', 'package', 'manager', 'generator', 'builder'],
    weight: 1.0,
  },
  {
    name: 'frontend',
    searchTerms: ['javascript framework', 'react library', 'vue components', 'css framework'],
    trendingPath: '',
    keywords: ['react', 'vue', 'angular', 'svelte', 'css', 'ui', 'component', 'frontend', 'web', 'dom', 'hook'],
    weight: 1.0,
  },
  {
    name: 'api',
    searchTerms: ['rest api', 'graphql server', 'api gateway', 'http server'],
    trendingPath: '',
    keywords: ['api', 'rest', 'graphql', 'endpoint', 'server', 'http', 'rpc', 'grpc', 'swagger', 'openapi'],
    weight: 1.0,
  },
  {
    name: 'devops',
    searchTerms: ['docker kubernetes', 'ci cd tools', 'infrastructure as code', 'container orchestration'],
    trendingPath: '',
    keywords: ['docker', 'kubernetes', 'k8s', 'ci/cd', 'deploy', 'infrastructure', 'ansible', 'terraform', 'helm', 'container'],
    weight: 1.0,
  },
  {
    name: 'ai',
    searchTerms: ['machine learning', 'neural network', 'llm gpt', 'ai tools'],
    trendingPath: '',
    keywords: ['ai', 'machine learning', 'neural', 'gpt', 'llm', 'deep learning', 'tensorflow', 'pytorch', 'transformer', 'nlp', 'cv', 'stable diffusion'],
    weight: 1.0,
  },
  {
    name: 'security',
    searchTerms: ['security tools', 'authentication', 'cryptography'],
    trendingPath: '',
    keywords: ['security', 'auth', 'crypto', 'vulnerability', 'penetration', 'owasp', 'encryption', 'oauth', 'jwt', 'zero-trust'],
    weight: 1.0,
  },
  {
    name: 'backend',
    searchTerms: ['node.js framework', 'python server', 'golang backend'],
    trendingPath: '',
    keywords: ['backend', 'database', 'server', 'node', 'python', 'golang', 'java', 'rust', 'orm', 'microservice'],
    weight: 1.0,
  },
  {
    name: 'apps',
    searchTerms: ['desktop app', 'mobile app', 'electron', 'react native'],
    trendingPath: '',
    keywords: ['desktop', 'mobile', 'app', 'electron', 'react-native', 'flutter', 'ios', 'android', 'gui', 'tui'],
    weight: 1.0,
  },
  {
    name: 'monitoring',
    searchTerms: ['observability', 'logging', 'metrics'],
    trendingPath: '',
    keywords: ['monitoring', 'observability', 'logging', 'metrics', 'tracing', 'prometheus', 'grafana', 'alerting', 'sentry'],
    weight: 1.0,
  },
]

// Quality scoring weights
const QUALITY_WEIGHTS = {
  stars: 0.3,
  recentActivity: 0.25,
  issues: 0.15,
  community: 0.15,
  documentation: 0.15,
}

export function calculateQualityScore(repo: FetchResult): number {
  // Stars score (normalize to 0-100)
  const starsScore = Math.min(repo.starsCount / 100000 * 100, 100)

  // Recent activity score (based on push date)
  const now = new Date()
  const lastPush = new Date(repo.pushedAt)
  const daysSincePush = Math.floor((now.getTime() - lastPush.getTime()) / (1000 * 60 * 60 * 24))
  const activityScore = Math.max(0, 100 - daysSincePush * 0.5)

  // Issue ratio score (higher open issues = potentially unmaintained)
  const totalIssues = repo.openIssuesCount + repo.closedIssuesCount
  const issueRatioScore = totalIssues > 0
    ? Math.max(0, 100 - (repo.openIssuesCount / totalIssues) * 100)
    : 50

  // Community score (forks + subscribers relative to stars)
  const communityScore = Math.min(
    ((repo.forksCount + repo.subscribersCount) / repo.starsCount) * 100,
    100
  )

  // Documentation score (has description, topics, homepage)
  let docScore = 0
  if (repo.description && repo.description.length > 50) docScore += 33
  if (repo.topics && repo.topics.length > 0) docScore += 33
  if (repo.homepage) docScore += 34

  const totalScore =
    starsScore * QUALITY_WEIGHTS.stars +
    activityScore * QUALITY_WEIGHTS.recentActivity +
    issueRatioScore * QUALITY_WEIGHTS.issues +
    communityScore * QUALITY_WEIGHTS.community +
    docScore * QUALITY_WEIGHTS.documentation

  return Math.round(totalScore * 100) / 100
}

export function filterRepos(
  repos: FetchResult[],
  filters: FilterConfig = DEFAULT_FILTERS
): FetchResult[] {
  const now = new Date()

  return repos.filter((repo) => {
    // Filter by minimum stars
    if (repo.starsCount < filters.minStars) {
      return false
    }

    // Filter by maximum age (last update)
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

    // Filter by activity ratio
    if (filters.minActivityRatio > 0) {
      const totalIssues = repo.openIssuesCount + repo.closedIssuesCount
      if (totalIssues > 0) {
        const ratio = repo.openIssuesCount / totalIssues
        if (ratio > filters.minActivityRatio) {
          return false
        }
      }
    }

    // Filter by last commit
    if (filters.maxLastCommitDays > 0) {
      const pushedDate = new Date(repo.pushedAt)
      const daysSincePush = Math.floor((now.getTime() - pushedDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSincePush > filters.maxLastCommitDays) {
        return false
      }
    }

    // Filter by quality score
    if (filters.minQualityScore > 0) {
      const qualityScore = calculateQualityScore(repo)
      if (qualityScore < filters.minQualityScore) {
        return false
      }
    }

    return true
  })
}

export function deduplicateByUrl(
  newRepos: FetchResult[],
  existingUrls: Set<string>
): FetchResult[] {
  return newRepos.filter((repo) => !existingUrls.has(repo.url))
}

export function assignCategory(repo: FetchResult, categories: string[]): string {
  const searchText = `${repo.name} ${repo.description} ${repo.topics?.join(' ') || ''}`.toLowerCase()
  const topicsSet = new Set(repo.topics?.map((t) => t.toLowerCase()) || [])

  interface CategoryScore {
    name: string
    score: number
    matchedKeywords: string[]
  }

  const scores: CategoryScore[] = []

  for (const category of categories) {
    const config = CATEGORY_CONFIGS.find((c) => c.name === category)
    if (!config) continue

    let score = 0
    const matchedKeywords: string[] = []

    // Check keywords in name and description
    for (const keyword of config.keywords) {
      const keywordLower = keyword.toLowerCase()
      if (searchText.includes(keywordLower)) {
        score += 1
        matchedKeywords.push(keyword)
      }
    }

    // Bonus for matching topics
    for (const topic of topicsSet) {
      if (config.keywords.some((k) => topic.includes(k) || k.includes(topic))) {
        score += 2
        matchedKeywords.push(topic)
      }
    }

    // Bonus for category-specific search terms
    for (const term of config.searchTerms) {
      if (searchText.includes(term.toLowerCase())) {
        score += 3
      }
    }

    // Apply category weight
    scores.push({
      name: category,
      score: score * config.weight,
      matchedKeywords: [...new Set(matchedKeywords)],
    })
  }

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score)

  // Return best match or default to 'tools'
  if (scores.length > 0 && scores[0].score > 0) {
    return scores[0].name
  }

  return 'tools'
}

export function generateTags(repo: FetchResult): string[] {
  const tags: string[] = []
  const searchText = `${repo.name} ${repo.description}`.toLowerCase()
  const topicsSet = new Set(repo.topics?.map((t) => t.toLowerCase()) || [])

  // Add primary language as tag
  if (repo.primaryLanguage) {
    tags.push(repo.primaryLanguage)
  }

  // Add topics as tags
  if (repo.topics) {
    for (const topic of repo.topics.slice(0, 3)) {
      if (!tags.includes(topic)) {
        tags.push(topic)
      }
    }
  }

  // Match keywords in name/description
  const allKeywords = new Set<string>()
  for (const config of CATEGORY_CONFIGS) {
    for (const keyword of config.keywords) {
      allKeywords.add(keyword.toLowerCase())
    }
  }

  for (const keyword of allKeywords) {
    if (searchText.includes(keyword)) {
      const capitalizedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1)
      if (!tags.includes(capitalizedKeyword) && capitalizedKeyword.length > 2) {
        tags.push(capitalizedKeyword)
      }
    }
  }

  // Limit to 5 most relevant tags
  return tags.slice(0, 5)
}

export function getCategoryConfigs(): CategoryConfig[] {
  return CATEGORY_CONFIGS
}
