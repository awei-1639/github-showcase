import { FetchResult } from './types'

const GH_API = 'https://api.github.com'

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  return headers
}

function formatStars(count: number): string {
  if (count >= 1000) {
    const k = count / 1000
    return `${k.toFixed(k % 1 === 0 ? 0 : 1)}k`
  }
  return count.toString()
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
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
    isArchived: (repo.archived as boolean) || false,
    isFork: (repo.fork as boolean) || false,
  }
}

export async function searchRepos(query: string, perPage = 10): Promise<FetchResult[]> {
  try {
    const url = `${GH_API}/search/repositories?q=${encodeURIComponent(query)}&per_page=${perPage}&sort=stars&order=desc`
    const response = await fetch(url, { headers: getHeaders() })

    if (!response.ok) {
      if (response.status === 403) {
        console.error(`[GitHub API] Rate limited. Response: ${response.status}`)
      } else if (response.status === 422) {
        console.error(`[GitHub API] Validation failed for query: ${query}`)
      } else {
        console.error(`[GitHub API] searchRepos failed: ${response.status} ${response.statusText}`)
      }
      return []
    }

    const data = (await response.json()) as { items: Record<string, unknown>[] }
    return data.items.map(transformToFetchResult)
  } catch (error) {
    console.error(`[GitHub API] searchRepos error:`, error)
    return []
  }
}

export async function getTrendingRepos(language: string = '', perPage = 10): Promise<FetchResult[]> {
  try {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    const dateString = date.toISOString().split('T')[0]

    let query = `created:>${dateString}`
    if (language) {
      query += ` language:${language}`
    }

    const url = `${GH_API}/search/repositories?q=${encodeURIComponent(query)}&per_page=${perPage}&sort=stars&order=desc`
    const response = await fetch(url, { headers: getHeaders() })

    if (!response.ok) {
      if (response.status === 403) {
        console.error(`[GitHub API] Rate limited. Response: ${response.status}`)
      } else {
        console.error(`[GitHub API] getTrendingRepos failed: ${response.status} ${response.statusText}`)
      }
      return []
    }

    const data = (await response.json()) as { items: Record<string, unknown>[] }
    return data.items.map(transformToFetchResult)
  } catch (error) {
    console.error(`[GitHub API] getTrendingRepos error:`, error)
    return []
  }
}

export async function getRepoDetails(owner: string, repo: string): Promise<FetchResult> {
  try {
    await delay(1000)
    const url = `${GH_API}/repos/${owner}/${repo}`
    const response = await fetch(url, { headers: getHeaders() })

    if (!response.ok) {
      if (response.status === 403) {
        console.error(`[GitHub API] Rate limited. Response: ${response.status}`)
      } else if (response.status === 404) {
        console.error(`[GitHub API] Repo not found: ${owner}/${repo}`)
      } else {
        console.error(`[GitHub API] getRepoDetails failed: ${response.status} ${response.statusText}`)
      }
      throw new Error(`Failed to fetch repo ${owner}/${repo}: ${response.status}`)
    }

    const data = (await response.json()) as Record<string, unknown>
    return transformToFetchResult(data)
  } catch (error) {
    console.error(`[GitHub API] getRepoDetails error for ${owner}/${repo}:`, error)
    throw error
  }
}
