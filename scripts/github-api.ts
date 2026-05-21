import { FetchResult, RateLimitInfo } from './types'

const GH_API = 'https://api.github.com'
const REQUEST_DELAY = 100 // ms between requests when not rate limited

// Rate limit state
let rateLimitInfo: RateLimitInfo = {
  limit: 60,
  remaining: 60,
  resetAt: new Date(),
  used: 0
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (process.env.GH_TOKEN || process.env.GITHUB_TOKEN) {
    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

function formatStars(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    const k = count / 1000
    return `${k.toFixed(k % 1 === 0 ? 0 : 1)}k`
  }
  return count.toString()
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseRateLimitHeaders(response: Response): void {
  const limit = response.headers.get('x-ratelimit-limit')
  const remaining = response.headers.get('x-ratelimit-remaining')
  const reset = response.headers.get('x-ratelimit-reset')
  const used = response.headers.get('x-ratelimit-used')

  if (limit) rateLimitInfo.limit = parseInt(limit, 10)
  if (remaining) rateLimitInfo.remaining = parseInt(remaining, 10)
  if (reset) rateLimitInfo.resetAt = new Date(parseInt(reset, 10) * 1000)
  if (used) rateLimitInfo.used = parseInt(used, 10)
}

function getRateLimitResetMs(): number {
  const now = Date.now()
  const resetTime = rateLimitInfo.resetAt.getTime()
  return Math.max(0, resetTime - now)
}

async function waitForRateLimit(): Promise<void> {
  if (rateLimitInfo.remaining <= 5) {
    const waitMs = getRateLimitResetMs() + 1000
    console.log(`[Rate Limit] Low remaining (${rateLimitInfo.remaining}). Waiting ${Math.round(waitMs / 1000)}s...`)
    await delay(waitMs)
  }
}

async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Check rate limit before request
      await waitForRateLimit()

      const result = await fn()
      return result
    } catch (error) {
      lastError = error as Error

      if (error instanceof Error) {
        // Rate limit error
        if (error.message.includes('403') || error.message.includes('rate limit')) {
          const waitMs = getRateLimitResetMs() + 2000
          console.log(`[Rate Limit] Hit limit, waiting ${Math.round(waitMs / 1000)}s...`)
          await delay(waitMs)
          continue
        }

        // Retryable error (5xx, network issues)
        if (
          error.message.includes('500') ||
          error.message.includes('502') ||
          error.message.includes('503') ||
          error.message.includes('network') ||
          error.message.includes('fetch')
        ) {
          const waitMs = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
          console.log(`[Retry] Attempt ${attempt + 1} failed, retrying in ${Math.round(waitMs)}ms...`)
          await delay(waitMs)
          continue
        }
      }

      // Non-retryable error
      throw error
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

function transformToFetchResult(repo: Record<string, unknown>): FetchResult {
  return {
    name: (repo.name as string) || '',
    description: (repo.description as string) || '',
    url: (repo.html_url as string) || '',
    stars: formatStars((repo.stargazers_count as number) || 0),
    starsCount: (repo.stargazers_count as number) || 0,
    primaryLanguage: (repo.language as string) || null,
    updatedAt: (repo.updated_at as string) || '',
    createdAt: (repo.created_at as string) || '',
    pushedAt: (repo.pushed_at as string) || '',
    isArchived: (repo.archived as boolean) || false,
    isFork: (repo.fork as boolean) || false,
    openIssuesCount: (repo.open_issues_count as number) || 0,
    closedIssuesCount: ((repo.open_issues_count as number) || 0) - ((repo.open_issues_count as number) || 0),
    forksCount: (repo.forks_count as number) || 0,
    subscribersCount: (repo.subscribers_count as number) || 0,
    topics: (repo.topics as string[]) || [],
    license: ((repo.license as { spdx_id?: string })?.spdx_id) || null,
    homepage: (repo.homepage as string) || null,
  }
}

export function getRateLimitStatus(): RateLimitInfo {
  return { ...rateLimitInfo }
}

export async function searchRepos(
  query: string,
  perPage = 10,
  sort: 'stars' | 'updated' = 'stars'
): Promise<FetchResult[]> {
  const sortParam = sort === 'updated' ? 'updated' : 'stars'

  return executeWithRetry(async () => {
    const url = `${GH_API}/search/repositories?q=${encodeURIComponent(query)}&per_page=${perPage}&sort=${sortParam}&order=desc`
    const response = await fetch(url, { headers: getHeaders() })

    parseRateLimitHeaders(response)

    if (!response.ok) {
      const errorMsg = `[GitHub API] searchRepos failed: ${response.status} ${response.statusText}`
      console.error(errorMsg)

      if (response.status === 403) {
        throw new Error(`${errorMsg} - Rate limited`)
      }
      if (response.status === 422) {
        console.error(`[GitHub API] Validation failed for query: ${query}`)
        return []
      }
      throw new Error(errorMsg)
    }

    const data = (await response.json()) as { items: Record<string, unknown>[] }
    return data.items.map(transformToFetchResult)
  })
}

export async function getTrendingRepos(
  language: string = '',
  perPage = 10
): Promise<FetchResult[]> {
  const date = new Date()
  date.setDate(date.getDate() - 30)
  const dateString = date.toISOString().split('T')[0]

  let query = `created:>${dateString}`
  if (language) {
    query += ` language:${language}`
  }

  return executeWithRetry(async () => {
    const url = `${GH_API}/search/repositories?q=${encodeURIComponent(query)}&per_page=${perPage}&sort=stars&order=desc`
    const response = await fetch(url, { headers: getHeaders() })

    parseRateLimitHeaders(response)

    if (!response.ok) {
      const errorMsg = `[GitHub API] getTrendingRepos failed: ${response.status}`
      console.error(errorMsg)

      if (response.status === 403) {
        throw new Error(`${errorMsg} - Rate limited`)
      }
      throw new Error(errorMsg)
    }

    const data = (await response.json()) as { items: Record<string, unknown>[] }
    return data.items.map(transformToFetchResult)
  })
}

export async function getRepoDetails(owner: string, repo: string): Promise<FetchResult> {
  await delay(REQUEST_DELAY)

  return executeWithRetry(async () => {
    const url = `${GH_API}/repos/${owner}/${repo}`
    const response = await fetch(url, { headers: getHeaders() })

    parseRateLimitHeaders(response)

    if (!response.ok) {
      const errorMsg = `[GitHub API] getRepoDetails failed for ${owner}/${repo}: ${response.status}`
      console.error(errorMsg)

      if (response.status === 404) {
        throw new Error(`Repo not found: ${owner}/${repo}`)
      }
      if (response.status === 403) {
        throw new Error(`${errorMsg} - Rate limited`)
      }
      throw new Error(errorMsg)
    }

    const data = (await response.json()) as Record<string, unknown>
    return transformToFetchResult(data)
  })
}

export async function getRepoActivity(
  owner: string,
  repo: string
): Promise<{ recentCommits: number; lastCommitDate: string | null }> {
  await delay(REQUEST_DELAY)

  try {
    // Get recent commits (last 3 months)
    const date = new Date()
    date.setMonth(date.getMonth() - 3)
    const dateString = date.toISOString().split('T')[0]

    const url = `${GH_API}/repos/${owner}/${repo}/commits?since=${dateString}&per_page=100`
    const response = await fetch(url, { headers: getHeaders() })

    parseRateLimitHeaders(response)

    if (!response.ok) {
      return { recentCommits: 0, lastCommitDate: null }
    }

    const data = (await response.json()) as unknown[]
    const commits = Array.isArray(data) ? data : []

    return {
      recentCommits: commits.length,
      lastCommitDate: commits.length > 0 ? ((commits[0] as Record<string, unknown>).commit as Record<string, unknown>)?.date as string : null
    }
  } catch {
    return { recentCommits: 0, lastCommitDate: null }
  }
}

export async function getRepoIssues(
  owner: string,
  repo: string
): Promise<{ open: number; closed: number }> {
  await delay(REQUEST_DELAY)

  try {
    const [openRes, closedRes] = await Promise.all([
      fetch(`${GH_API}/repos/${owner}/${repo}/issues?state=open&per_page=1`, { headers: getHeaders() }),
      fetch(`${GH_API}/repos/${owner}/${repo}/issues?state=closed&per_page=1`, { headers: getHeaders() })
    ])

    parseRateLimitHeaders(openRes)

    const openData = await openRes.json() as { total_count: number }
    const closedData = await closedRes.json() as { total_count: number }

    return {
      open: openData.total_count || 0,
      closed: closedData.total_count || 0
    }
  } catch {
    return { open: 0, closed: 0 }
  }
}

// Queue-based parallel fetcher with rate limit awareness
export async function fetchParallel<T>(
  items: Array<{ id: string; fn: () => Promise<T> }>,
  maxParallel = 5
): Promise<Map<string, T>> {
  const results = new Map<string, T>()
  const executing: Array<Promise<void>> = []

  for (const item of items) {
    const promise = (async () => {
      try {
        const result = await executeWithRetry(item.fn)
        results.set(item.id, result)
      } catch (error) {
        console.error(`[Queue] Item ${item.id} failed:`, error)
      }
    })()

    executing.push(promise)

    if (executing.length >= maxParallel) {
      await Promise.race(executing)
      // Remove finished promises
      for (let i = executing.length - 1; i >= 0; i--) {
        const settled = await Promise.race([
          executing[i].then(() => true),
          Promise.resolve(false)
        ])
        if (settled) executing.splice(i, 1)
      }
    }
  }

  await Promise.all(executing)
  return results
}
