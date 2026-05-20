# GitHub Auto-Fetch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a GitHub Actions workflow that daily fetches high-quality GitHub repos and creates a PR with new additions.

**Architecture:** GitHub Actions schedule triggers a TypeScript script that fetches trending repos, filters by quality criteria, and creates a PR with JSON updates. The script uses GitHub REST API via GraphQL for efficient data fetching.

**Tech Stack:** GitHub Actions, TypeScript, GitHub API (GraphQL + REST), Node.js

---

## File Structure

| File | Purpose |
|------|---------|
| `scripts/update-resources.ts` | Main fetcher script |
| `scripts/github-api.ts` | GitHub API client |
| `scripts/filters.ts` | Quality filtering logic |
| `scripts/pr-template.ts` | PR body generator |
| `.github/workflows/update-resources.yml` | GitHub Actions workflow |
| `scripts/types.ts` | TypeScript interfaces |

---

## Task 1: TypeScript Types

**Files:**
- Create: `scripts/types.ts`

- [ ] **Step 1: Create types file**

```typescript
export interface Repo {
  id: string
  name: string
  description: string
  url: string
  stars: string
  starsCount: number  // numeric for sorting
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
```

- [ ] **Step 2: Commit**

```bash
git add scripts/types.ts
git commit -m "feat: add TypeScript types for auto-fetch system"
```

---

## Task 2: GitHub API Client

**Files:**
- Create: `scripts/github-api.ts`

- [ ] **Step 1: Create API client**

```typescript
import { FetchResult, CategoryConfig } from './types'

const GH_API = 'https://api.github.com'
const headers = {
  'Accept': 'application/vnd.github.v3+json',
  'Authorization': `token ${process.env.GITHUB_TOKEN}`
}

export async function searchRepos(query: string, perPage = 10): Promise<FetchResult[]> {
  const encodedQuery = encodeURIComponent(query)
  const response = await fetch(
    `${GH_API}/search/repositories?q=${encodedQuery}&sort=stars&per_page=${perPage}`,
    { headers }
  )

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()
  return data.items.map((item: any) => transformRepo(item))
}

export async function getTrendingRepos(language: string = '', perPage = 10): Promise<FetchResult[]> {
  let url = `${GH_API}/search/repositories?q=stars:>1000&sort=stars&order=desc&per_page=${perPage}`
  if (language) {
    url += `&language=${language}`
  }

  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const data = await response.json()
  return data.items.map((item: any) => transformRepo(item))
}

export async function getRepoDetails(owner: string, repo: string): Promise<FetchResult> {
  const response = await fetch(`${GH_API}/repos/${owner}/${repo}`, { headers })
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`)
  }

  const item = await response.json()
  return transformRepo(item)
}

function transformRepo(item: any): FetchResult {
  return {
    name: item.name,
    description: item.description || '',
    url: item.html_url,
    stars: item.stargazers_count >= 1000
      ? `${Math.round(item.stargazers_count / 1000)}k`
      : String(item.stargazers_count),
    starsCount: item.stargazers_count,
    primaryLanguage: item.language,
    updatedAt: item.updated_at,
    isArchived: item.archived,
    isFork: item.fork
  }
}

export async function getExistingRepoUrls(): Promise<Set<string>> {
  // This will be called from the main script with existing data
  return new Set()
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/github-api.ts
git commit -m "feat: add GitHub API client for fetching repos"
```

---

## Task 3: Quality Filters

**Files:**
- Create: `scripts/filters.ts`

- [ ] **Step 1: Create filters module**

```typescript
import { FetchResult, FilterConfig } from './types'

const DEFAULT_FILTERS: FilterConfig = {
  minStars: 10000,
  maxAgeDays: 180,
  requireDescription: true,
  excludeArchived: true,
  excludeForked: true
}

export function filterRepos(repos: FetchResult[], filters: FilterConfig = DEFAULT_FILTERS): FetchResult[] {
  return repos.filter(repo => {
    // Star filter
    if (repo.starsCount < filters.minStars) {
      return false
    }

    // Age filter
    if (filters.maxAgeDays > 0) {
      const updatedDate = new Date(repo.updatedAt)
      const daysSinceUpdate = Math.floor(
        (Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceUpdate > filters.maxAgeDays) {
        return false
      }
    }

    // Description filter
    if (filters.requireDescription && !repo.description.trim()) {
      return false
    }

    // Archive filter
    if (filters.excludeArchived && repo.isArchived) {
      return false
    }

    // Fork filter
    if (filters.excludeForked && repo.isFork) {
      return false
    }

    return true
  })
}

export function deduplicateByUrl(newRepos: FetchResult[], existingUrls: Set<string>): FetchResult[] {
  return newRepos.filter(repo => !existingUrls.has(repo.url))
}

export function assignCategory(repo: FetchResult, categories: string[]): string {
  const nameLower = repo.name.toLowerCase()
  const descLower = repo.description.toLowerCase()

  for (const category of categories) {
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

    const keywords = categoryKeywords[category] || []
    if (keywords.some(kw => nameLower.includes(kw) || descLower.includes(kw))) {
      return category
    }
  }

  return 'tools' // default
}

export function generateTags(repo: FetchResult): string[] {
  const tags: string[] = []

  // Add primary language as tag
  if (repo.primaryLanguage) {
    tags.push(repo.primaryLanguage.toLowerCase())
  }

  // Add common descriptive tags based on name/description
  const nameLower = repo.name.toLowerCase()
  const descLower = repo.description.toLowerCase()

  const tagPatterns = [
    { pattern: /awesome/, tag: 'awesome' },
    { pattern: /learn|tutorial|course/, tag: 'learning' },
    { pattern: /cli|command/, tag: 'cli' },
    { pattern: /api|rest|graphql/, tag: 'api' },
    { pattern: /docker|kubernetes/, tag: 'devops' },
    { pattern: /security|auth/, tag: 'security' },
    { pattern: /react|vue|angular/, tag: 'frontend' },
    { pattern: /ai|ml|machine learning/, tag: 'ai' },
  ]

  tagPatterns.forEach(({ pattern, tag }) => {
    if (pattern.test(nameLower) || pattern.test(descLower)) {
      tags.push(tag)
    }
  })

  // Limit to 3 tags
  return [...new Set(tags)].slice(0, 3)
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/filters.ts
git commit -m "feat: add quality filtering logic for repos"
```

---

## Task 4: PR Template Generator

**Files:**
- Create: `scripts/pr-template.ts`

- [ ] **Step 1: Create PR template generator**

```typescript
import { UpdatePayload } from './types'

export function generatePRBody(payload: UpdatePayload): string {
  const { date, projects, removed } = payload

  const categoryCounts: Record<string, number> = {}
  projects.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
  })

  const projectList = projects
    .map(p => `- **${p.name}**: ${p.description} (★${p.stars} | 来源: ${p.source})`)
    .join('\n')

  const categorySummary = Object.entries(categoryCounts)
    .map(([cat, count]) => `- ${cat}: ${count}`)
    .join('\n')

  return `## 更新摘要 (${date})

### 新增项目 (${projects.length})
${projectList}

${removed.length > 0 ? `### 移除项目 (${removed.length})\n${removed.map(r => `- ${r}`).join('\n')}\n` : ''}
### 变更分类分布
${categorySummary}

---
自动生成的资源更新 PR。审核后合并即可更新网站内容。
`
}

export function generateUpdateJSON(payload: UpdatePayload): string {
  return JSON.stringify(payload, null, 2)
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/pr-template.ts
git commit -m "feat: add PR template generator for auto-fetch"
```

---

## Task 5: Main Update Script

**Files:**
- Create: `scripts/update-resources.ts`

- [ ] **Step 1: Create main update script**

```typescript
import { FetchResult, UpdatePayload, CategoryConfig } from './types'
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

async function fetchAllRepos(existingUrls: Set<string>): Promise<FetchResult[]> {
  const allRepos: FetchResult[] = []
  const seenUrls = new Set<string>()

  // 1. Get trending repos
  console.log('Fetching trending repos...')
  const trending = await getTrendingRepos('', 20)
  allRepos.push(...trending.filter(r => !seenUrls.has(r.url) && !seenUrls.add(r.url)))

  // 2. Search queries
  console.log('Searching GitHub...')
  for (const query of SEARCH_QUERIES) {
    try {
      const results = await searchRepos(query, 5)
      allRepos.push(...results.filter(r => !seenUrls.has(r.url) && !seenUrls.add(r.url)))
      // Rate limit protection
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`Search failed for "${query}":`, error)
    }
  }

  // 3. Category-specific searches
  console.log('Fetching category-specific repos...')
  for (const category of CATEGORIES) {
    for (const term of category.searchTerms.slice(0, 2)) {
      try {
        const results = await searchRepos(`${term} stars:>10000`, 3)
        allRepos.push(...results.filter(r => !seenUrls.has(r.url) && !seenUrls.add(r.url)))
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Category search failed for "${term}":`, error)
      }
    }
  }

  return allRepos
}

function generateId(repo: FetchResult): string {
  // Simple hash based on URL
  let hash = 0
  for (let i = 0; i < repo.url.length; i++) {
    hash = ((hash << 5) - hash) + repo.url.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash).toString()
}

async function main() {
  const today = new Date().toISOString().split('T')[0]

  // Load existing repos from data/repos.json
  const existingData = await import('../data/repos.json').catch(() => ({ default: [] }))
  const existingRepos = existingData.default || []
  const existingUrls = new Set(existingRepos.map((r: any) => r.url))

  console.log(`Found ${existingRepos.length} existing repos`)

  // Fetch new repos
  const fetchedRepos = await fetchAllRepos(existingUrls)
  console.log(`Fetched ${fetchedRepos.length} repos`)

  // Filter by quality
  const filteredRepos = filterRepos(fetchedRepos)
  console.log(`Filtered to ${filteredRepos.length} quality repos`)

  // Deduplicate against existing
  const newRepos = deduplicateByUrl(filteredRepos, existingUrls)
  console.log(`Found ${newRepos.length} new repos`)

  if (newRepos.length === 0) {
    console.log('No new repos to add')
    return
  }

  // Convert to update format
  const projects = newRepos.map(repo => {
    const category = assignCategory(repo, CATEGORIES.map(c => c.name))
    return {
      name: repo.name,
      description: repo.description,
      url: repo.url,
      stars: repo.stars,
      category,
      tags: generateTags(repo),
      author: repo.url.split('/')[3],
      source: 'search' as const,
      reason: `Stars ${repo.stars} | Updated ${new Date(repo.updatedAt).toLocaleDateString()}`
    }
  })

  const payload: UpdatePayload = {
    date: today,
    action: 'add',
    projects,
    removed: []
  }

  // Generate outputs
  const prBody = generatePRBody(payload)
  const updateJSON = generateUpdateJSON(payload)

  // Write outputs (for GitHub Actions to use)
  console.log('::set-output name=pr_body::' + prBody.replace(/\n/g, '%0A'))
  console.log('::set-output name=update_json::' + updateJSON.replace(/\n/g, '%0A'))
  console.log('::set-output name=has_updates::true')

  // Also write to file for reference
  const fs = await import('fs')
  fs.writeFileSync(`repos-update-${today}.json`, updateJSON)
  fs.writeFileSync('pr-body.md', prBody)

  console.log(`\n=== PR Body ===\n${prBody}`)
}

main().catch(console.error)
```

- [ ] **Step 2: Commit**

```bash
git add scripts/update-resources.ts
git commit -m "feat: add main update script for auto-fetch system"
```

---

## Task 6: GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/update-resources.yml`

- [ ] **Step 1: Create GitHub Actions workflow**

```yaml
name: Update GitHub Resources

on:
  schedule:
    # Run at 2:00 AM UTC every day = 10:00 AM CST
    - cron: '0 2 * * *'

  # Allow manual trigger
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run update script
        id: update
        run: |
          npx tsx scripts/update-resources.ts || echo "has_updates=false" >> $GITHUB_OUTPUT

      - name: Read update JSON
        id: read_json
        if: success()
        run: |
          if [ -f "repos-update-$(date +%Y-%m-%d).json" ]; then
            content=$(cat repos-update-$(date +%Y-%m-%d).json)
            echo "update_json=$content" >> $GITHUB_OUTPUT
            echo "has_updates=true" >> $GITHUB_OUTPUT
          else
            echo "has_updates=false" >> $GITHUB_OUTPUT
          fi

      - name: Create PR
        if: steps.read_json.outputs.has_updates == 'true'
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          branch: chore/update-resources-$(date +%Y-%m-%d)
          delete-branch: true
          title: "chore: update resources $(date +%Y-%m-%d)"
          body-path: pr-body.md
          labels: |
            automated
            resources-update
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/update-resources.yml
git commit -m "ci: add GitHub Actions workflow for daily resource updates"
```

---

## Task 7: Package.json Update

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add tsx dependency for running TypeScript**

Check if tsx is already in dependencies. If not, add:

```json
{
  "scripts": {
    "update-resources": "tsx scripts/update-resources.ts"
  },
  "devDependencies": {
    "tsx": "^4.7.0"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore: add tsx for running TypeScript scripts"
```

---

## Task 8: Test the Script

**Files:**
- Test: `scripts/update-resources.ts`

- [ ] **Step 1: Run the script locally**

```bash
npm install tsx --save-dev
npm run update-resources
```

Expected: Should print fetch progress and generate output files

- [ ] **Step 2: Verify output files exist**

```bash
ls -la *.json pr-body.md 2>/dev/null || echo "Files not generated"
```

Expected: `repos-update-{date}.json` and `pr-body.md` should exist

- [ ] **Step 3: Commit any remaining changes**

---

## Self-Review Checklist

- [ ] All spec requirements have corresponding tasks
- [ ] No placeholder code (TBD, TODO)
- [ ] Type consistency across tasks (Repo interface matches)
- [ ] Each task has commit message
- [ ] Build verification step included
- [ ] GitHub Actions workflow syntax is valid

---

## Dependencies

- `tsx` - for running TypeScript directly
- GitHub token - automatically available via `secrets.GITHUB_TOKEN`

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-20-github-auto-fetch.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**