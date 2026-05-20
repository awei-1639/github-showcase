import * as fs from 'fs'
import * as path from 'path'
import { FetchResult, UpdatePayload, CategoryConfig, Repo } from './types'
import { searchRepos, getTrendingRepos } from './github-api'
import { filterRepos, deduplicateByUrl, assignCategory, generateTags } from './filters'
import { generatePRBody, generateUpdateJSON } from './pr-template'

const CATEGORIES: CategoryConfig[] = [
  { name: 'learning', searchTerms: ['programming tutorial', 'learn to code'], trendingPath: '' },
  { name: 'tools', searchTerms: ['cli tools', 'developer utilities'], trendingPath: '' },
  { name: 'frontend', searchTerms: ['javascript framework', 'react library'], trendingPath: '' },
  { name: 'api', searchTerms: ['rest api', 'graphql server'], trendingPath: '' },
  { name: 'devops', searchTerms: ['docker kubernetes', 'ci cd tools'], trendingPath: '' },
  { name: 'ai', searchTerms: ['machine learning', 'neural network'], trendingPath: '' }
]

const SEARCH_QUERIES = [
  'awesome list stars:>50000',
  'best tools stars:>20000',
  'top projects stars:>30000'
]

const DATA_DIR = path.join(__dirname, '..', 'data')
const REPOS_FILE = path.join(DATA_DIR, 'repos.json')

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchAllRepos(existingUrls: Set<string>): Promise<FetchResult[]> {
  const allRepos: FetchResult[] = []

  // 1. Fetch trending repos (20 repos)
  console.log('Fetching trending repos...')
  const trending = await getTrendingRepos('', 20)
  console.log(`Fetched ${trending.length} trending repos`)
  allRepos.push(...trending)
  await delay(1000)

  // 2. Search queries (5 repos each, with delay)
  console.log('Fetching from search queries...')
  for (const query of SEARCH_QUERIES) {
    console.log(`  Searching: ${query}`)
    const results = await searchRepos(query, 5)
    console.log(`    Found ${results.length} repos`)
    allRepos.push(...results)
    await delay(1000)
  }

  // 3. Category-specific searches (3 repos each, with delay)
  console.log('Fetching from category searches...')
  for (const category of CATEGORIES) {
    for (const term of category.searchTerms) {
      console.log(`  [${category.name}] Searching: ${term}`)
      const results = await searchRepos(term, 3)
      console.log(`    Found ${results.length} repos`)
      allRepos.push(...results)
      await delay(1000)
    }
  }

  console.log(`Total repos fetched: ${allRepos.length}`)

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

  return deduplicated
}

function loadExistingRepos(filePath: string): Set<string> {
  const existingUrls = new Set<string>()
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      const repos: Repo[] = JSON.parse(content)
      for (const repo of repos) {
        existingUrls.add(repo.url)
      }
      console.log(`Loaded ${repos.length} existing repos`)
    } else {
      console.log('No existing repos file found, starting fresh')
    }
  } catch (error) {
    console.error('Error loading existing repos:', error)
  }
  return existingUrls
}

function createUpdatePayload(
  date: string,
  newRepos: FetchResult[],
  categoryNames: string[]
): UpdatePayload {
  const projects = newRepos.map((repo) => {
    const category = assignCategory(repo, categoryNames)
    const tags = generateTags(repo)
    const reason = `Matched: ${repo.name} (${repo.stars} stars)`

    return {
      name: repo.name,
      description: repo.description,
      url: repo.url,
      stars: repo.stars,
      category,
      tags,
      author: repo.url.split('/').slice(-2, -1)[0] || '',
      source: 'search' as const,
      reason
    }
  })

  return {
    date,
    action: 'add',
    projects,
    removed: []
  }
}

async function main(): Promise<void> {
  const today = new Date().toISOString().split('T')[0]
  console.log(`Starting update run for date: ${today}`)

  // Load existing repos
  const existingUrls = loadExistingRepos(REPOS_FILE)

  // Fetch new repos
  const fetchedRepos = await fetchAllRepos(existingUrls)

  // Filter by quality
  const filteredRepos = filterRepos(fetchedRepos)
  console.log(`After quality filtering: ${filteredRepos.length} repos`)

  // Deduplicate against existing
  const newRepos = deduplicateByUrl(filteredRepos, existingUrls)
  console.log(`New repos to add: ${newRepos.length}`)

  if (newRepos.length === 0) {
    console.log('No new repos to add. Exiting.')
    return
  }

  // Generate update payload
  const categoryNames = CATEGORIES.map((c) => c.name)
  const payload = createUpdatePayload(today, newRepos, categoryNames)

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

  // GitHub Actions output
  console.log('::set-output name=update_json_path::' + updateJsonPath)
  console.log('::set-output name=pr_body_path::' + prBodyPath)
  console.log('::set-output name=new_repos_count::' + newRepos.length)

  console.log(`\nUpdate complete! Found ${newRepos.length} new repos to add.`)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})