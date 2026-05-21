import * as fs from 'fs'
import * as path from 'path'
import { FetchResult, UpdatePayload, Repo } from './types'
import { searchRepos, getTrendingRepos, getRateLimitStatus, getRepoActivity } from './github-api'
import { filterRepos, deduplicateByUrl, assignCategory, generateTags, getCategoryConfigs, calculateQualityScore } from './filters'
import { generatePRBody, generateUpdateJSON } from './pr-template'

// Expanded search queries for better coverage
const SEARCH_QUERIES = [
  { query: 'stars:>50000 awesome list', perPage: 10 },
  { query: 'stars:>30000 developer tools', perPage: 8 },
  { query: 'stars:>20000 javascript framework', perPage: 8 },
  { query: 'stars:>15000 learning programming', perPage: 8 },
  { query: 'stars:>10000 artificial intelligence', perPage: 10 },
  { query: 'stars:>10000 rest api graphql', perPage: 8 },
  { query: 'stars:>10000 docker kubernetes', perPage: 8 },
  { query: 'stars:>5000 security tools', perPage: 8 },
]

const DATA_DIR = path.join(__dirname, '..', 'data')
const REPOS_FILE = path.join(DATA_DIR, 'repos.json')

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function logProgress(current: number, total: number, message: string): void {
  const percentage = Math.round((current / total) * 100)
  console.log(`[${percentage}%] ${current}/${total}: ${message}`)
}

async function fetchAllRepos(existingUrls: Set<string>): Promise<{ repos: FetchResult[]; sources: Map<string, string> }> {
  const allRepos: FetchResult[] = []
  const sources = new Map<string, string>()
  let totalTasks = 1 + SEARCH_QUERIES.length + getCategoryConfigs().length * 2
  let completedTasks = 0

  // 1. Fetch trending repos (30 repos)
  logProgress(completedTasks, totalTasks, 'Fetching trending repos...')
  const trending = await getTrendingRepos('', 30)
  for (const repo of trending) {
    allRepos.push(repo)
    sources.set(repo.url, 'trending')
  }
  completedTasks++
  logProgress(completedTasks, totalTasks, `Fetched ${trending.length} trending repos`)
  await delay(500)

  // 2. Search queries
  for (const sq of SEARCH_QUERIES) {
    logProgress(completedTasks, totalTasks, `Searching: ${sq.query}`)
    const results = await searchRepos(sq.query, sq.perPage)
    for (const repo of results) {
      if (!allRepos.find((r) => r.url === repo.url)) {
        allRepos.push(repo)
        sources.set(repo.url, 'search')
      }
    }
    completedTasks++
    logProgress(completedTasks, totalTasks, `Found ${results.length} repos for: ${sq.query}`)
    await delay(500)
  }

  // 3. Category-specific searches
  const categories = getCategoryConfigs()
  for (const cat of categories) {
    for (const term of cat.searchTerms.slice(0, 2)) {
      logProgress(completedTasks, totalTasks, `[${cat.name}] Searching: ${term}`)
      try {
        const results = await searchRepos(term, 5)
        for (const repo of results) {
          if (!allRepos.find((r) => r.url === repo.url)) {
            allRepos.push(repo)
            sources.set(repo.url, 'category')
          }
        }
        completedTasks++
        logProgress(completedTasks, totalTasks, `Found ${results.length} repos for [${cat.name}]: ${term}`)
      } catch (error) {
        console.error(`Error searching ${cat.name}/${term}:`, error)
        completedTasks++
      }
      await delay(500)
    }
  }

  console.log(`\nTotal repos fetched: ${allRepos.length}`)

  // Deduplicate by URL
  const seenUrls = new Set<string>()
  const deduplicated = allRepos.filter((repo) => {
    if (seenUrls.has(repo.url)) {
      return false
    }
    seenUrls.add(repo.url)
    return true
  })

  console.log(`After deduplication: ${deduplicated.length} repos`)

  return { repos: deduplicated, sources }
}

function loadExistingRepos(filePath: string): { repos: Map<string, Repo>; urls: Set<string> } {
  const repos = new Map<string, Repo>()
  const urls = new Set<string>()

  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      const data = JSON.parse(content) as Repo[]
      for (const repo of data) {
        repos.set(repo.id, repo)
        urls.add(repo.url)
      }
      console.log(`Loaded ${repos.size} existing repos`)
    } else {
      console.log('No existing repos file found, starting fresh')
    }
  } catch (error) {
    console.error('Error loading existing repos:', error)
  }

  return { repos, urls }
}

async function enrichWithActivity(repo: FetchResult): Promise<{
  recentCommits: number
  lastCommitDate: string
}> {
  try {
    const parts = repo.url.replace('https://github.com/', '').split('/')
    if (parts.length >= 2) {
      const [owner, name] = parts
      const activity = await getRepoActivity(owner, name)
      return {
        recentCommits: activity.recentCommits,
        lastCommitDate: activity.lastCommitDate || repo.pushedAt,
      }
    }
  } catch {
    // Ignore errors for individual repo enrichment
  }

  return {
    recentCommits: 0,
    lastCommitDate: repo.pushedAt,
  }
}

function createUpdatePayload(
  date: string,
  newRepos: FetchResult[],
  categoryNames: string[],
  sources: Map<string, string>
): UpdatePayload {
  const projects = newRepos.map((repo) => {
    const category = assignCategory(repo, categoryNames)
    const tags = generateTags(repo)
    const source = sources.get(repo.url) || 'search'
    const qualityScore = calculateQualityScore(repo)

    return {
      name: repo.name,
      description: repo.description,
      url: repo.url,
      stars: repo.stars,
      starsCount: repo.starsCount,
      category,
      tags,
      author: repo.url.split('/').slice(-2, -1)[0] || '',
      source: source as 'trending' | 'search' | 'category',
      reason: `Quality score: ${qualityScore.toFixed(2)} | Stars: ${repo.stars}`,
      activityMetrics: {
        openIssues: repo.openIssuesCount,
        recentCommits: 0, // Will be enriched later
        lastCommitDate: repo.pushedAt,
      },
    }
  })

  return {
    date,
    action: 'add',
    projects,
    removed: [],
    stats: {
      totalFetched: newRepos.length,
      totalFiltered: newRepos.length,
      totalAdded: projects.length,
      totalRemoved: 0,
      byCategory: projects.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      bySource: projects.reduce((acc, p) => {
        acc[p.source] = (acc[p.source] || 0) + 1
        return acc
      }, {} as Record<string, number>),
    },
  }
}

async function main(): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  console.log(`🚀 Starting resource update for: ${today}`)
  console.log(`Rate limit status:`, getRateLimitStatus())
  console.log('---')

  // Load existing repos
  const { repos: existingRepos, urls: existingUrls } = loadExistingRepos(REPOS_FILE)

  // Fetch new repos
  const { repos: fetchedRepos, sources } = await fetchAllRepos(existingUrls)

  console.log('\n---')
  console.log('Filtering by quality...')

  // Filter by quality
  const filteredRepos = filterRepos(fetchedRepos)
  console.log(`After quality filtering: ${filteredRepos.length} repos`)

  // Deduplicate against existing
  const newRepos = deduplicateByUrl(filteredRepos, existingUrls)
  console.log(`New repos to add: ${newRepos.length}`)

  if (newRepos.length === 0) {
    console.log('\n✅ No new repos to add. Exiting.')
    return
  }

  console.log('\n---')
  console.log('Generating update payload...')

  // Generate update payload
  const categoryNames = getCategoryConfigs().map((c) => c.name)
  const payload = createUpdatePayload(today, newRepos, categoryNames, sources)

  // Write output files
  const dateStr = today.replace(/-/g, '')
  const updateJsonPath = path.join(DATA_DIR, `repos-update-${dateStr}.json`)
  const prBodyPath = path.join(DATA_DIR, 'pr-body.md')

  const jsonContent = generateUpdateJSON(payload)
  const prBody = generatePRBody(payload)

  fs.writeFileSync(updateJsonPath, jsonContent, 'utf-8')
  console.log(`Wrote update JSON: ${updateJsonPath}`)

  fs.writeFileSync(prBodyPath, prBody, 'utf-8')
  console.log(`Wrote PR body: ${prBodyPath}`)

  // Print summary
  console.log('\n---')
  console.log('📊 Update Summary:')
  console.log(`   Total fetched: ${payload.stats.totalFetched}`)
  console.log(`   After filtering: ${payload.stats.totalFiltered}`)
  console.log(`   New repos: ${payload.stats.totalAdded}`)
  console.log('   By category:', payload.stats.byCategory)
  console.log('   By source:', payload.stats.bySource)

  // GitHub Actions output (using new syntax)
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `update_json_path=${updateJsonPath}\n`)
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `pr_body_path=${prBodyPath}\n`)
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `new_repos_count=${payload.stats.totalAdded}\n`)
  } else {
    console.log('\n::set-output name=update_json_path::' + updateJsonPath)
    console.log('::set-output name=pr_body_path::' + prBodyPath)
    console.log('::set-output name=new_repos_count::' + payload.stats.totalAdded)
  }

  console.log('\n✅ Update complete!')
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error)
  process.exit(1)
})
