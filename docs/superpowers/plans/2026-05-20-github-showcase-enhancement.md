# GitHub Showcase Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement progressive enhancement with smooth animations, editorial picks, similar projects recommendations, and personalized recommendations.

**Architecture:** Enhance the existing React + Next.js + Framer Motion stack with new recommendation logic and refined animations. Data layer uses the existing repos.json with featured flags.

**Tech Stack:** Next.js, React, Framer Motion, TypeScript, Tailwind CSS

---

## File Structure

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main page with editorial picks and recommendations |
| `components/RepoCard.tsx` | Enhanced card with smooth hover animation |
| `components/RepoGrid.tsx` | Grid with stagger animation for filtered repos |
| `components/RepoPanel.tsx` | Detail panel with slide animation and similar projects |
| `components/Header.tsx` | Header with tab navigation (All/Trend/Picks) |
| `styles/globals.css` | Enhanced shadow and transition utilities |

---

## Task 1: Enhanced Card Animations

**Files:**
- Modify: `components/RepoCard.tsx`

- [ ] **Step 1: Read current RepoCard.tsx**

Read the current implementation to understand the existing animation structure.

- [ ] **Step 2: Update RepoCard with smooth hover effect**

Add to existing RepoCard.tsx. The motion.div already has `whileHover={{ y: -6, scale: 1.02 }}` - update to:
```tsx
whileHover={{ y: -4, scale: 1.01 }}
```

Also update the card's base transition class to include smooth hover:
```tsx
className={`
  group relative overflow-hidden
  bg-white rounded-2xl border border-border-light
  shadow-sm
  transition-all duration-300 ease-out cursor-pointer
  hover:shadow-xl hover:-translate-y-1
`}
```

- [ ] **Step 3: Commit**

```bash
git add components/RepoCard.tsx
git commit -m "feat: enhance card hover with smooth translateY animation"
```

---

## Task 2: Stagger Animation for RepoGrid

**Files:**
- Modify: `components/RepoGrid.tsx`

- [ ] **Step 1: Read current RepoGrid.tsx**

- [ ] **Step 2: Update RepoGrid with stagger animation**

Replace the existing grid with a Framer Motion animated container:

```tsx
'use client'

import { motion } from 'framer-motion'

interface RepoGridProps {
  repos: Repo[]
  onCardClick: (repo: Repo) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
}

export default function RepoGrid({ repos, onCardClick }: RepoGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {repos.map((repo, index) => (
        <motion.div key={repo.id} variants={itemVariants}>
          <RepoCard repo={repo} onClick={() => onCardClick(repo)} index={index} />
        </motion.div>
      ))}
    </motion.div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/RepoGrid.tsx
git commit -m "feat: add stagger animation to repo grid"
```

---

## Task 3: Slide Animation for RepoPanel

**Files:**
- Modify: `components/RepoPanel.tsx`

- [ ] **Step 1: Read current RepoPanel.tsx**

- [ ] **Step 2: Add slide animation variants and AnimatePresence**

Add at top of file:
```tsx
import { motion, AnimatePresence } from 'framer-motion'
```

Add panel variants after imports:
```tsx
const panelVariants = {
  hidden: { x: '100%', opacity: 0 },
  show: { x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 200 } },
  exit: { x: '100%', opacity: 0, transition: { duration: 0.2 } }
}
```

Wrap the panel content with motion.div:
```tsx
<AnimatePresence>
  {repo && (
    <motion.div
      key="panel"
      variants={panelVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      // ... existing className and children
    />
  )}
</AnimatePresence>
```

- [ ] **Step 3: Commit**

```bash
git add components/RepoPanel.tsx
git commit -m "feat: add slide-in animation to repo panel"
```

---

## Task 4: Similar Projects in RepoPanel

**Files:**
- Modify: `components/RepoPanel.tsx`

- [ ] **Step 1: Read RepoPanel.tsx to understand current structure**

- [ ] **Step 2: Add similarity calculation logic**

Add this helper function before the component:

```tsx
function getSimilarRepos(currentRepo: Repo, allRepos: Repo[], count: number = 3): Repo[] {
  return allRepos
    .filter(r => r.id !== currentRepo.id)
    .map(r => {
      let score = 0
      // Same category: +2 points
      if (r.category === currentRepo.category) score += 2
      // Shared tags: +1 point each
      r.tags.forEach(tag => {
        if (currentRepo.tags.includes(tag)) score += 1
      })
      return { repo: r, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(item => item.repo)
}
```

- [ ] **Step 3: Add similar repos section to panel**

Add to the bottom of the panel, before the close button:
```tsx
{similarRepos.length > 0 && (
  <div className="border-t border-border-light pt-6 mt-6">
    <h4 className="text-sm font-semibold text-primary mb-4">相似项目</h4>
    <div className="space-y-3">
      {similarRepos.map(r => (
        <button
          key={r.id}
          onClick={() => onRelatedClick(r)}
          className="w-full p-3 rounded-xl bg-elevated hover:bg-accent-light transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-primary">{r.name}</span>
            <span className="text-xs text-muted">★ {r.stars}</span>
          </div>
          <p className="text-xs text-secondary mt-1 line-clamp-1">{r.description}</p>
        </button>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 4: Add similarRepos to useMemo**

In the component, add:
```tsx
const similarRepos = useMemo(() => {
  if (!repo) return []
  return getSimilarRepos(repo, reposData as Repo[])
}, [repo])
```

- [ ] **Step 5: Commit**

```bash
git add components/RepoPanel.tsx
git commit -m "feat: add similar projects recommendation to panel"
```

---

## Task 5: Editorial Picks Section on Homepage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Read current page.tsx**

- [ ] **Step 2: Add editorial picks data extraction**

Add to the useMemo section:
```tsx
// Editorial picks - featured repos
const editorialPicks = useMemo(() => {
  return (reposData as Repo[])
    .filter(repo => repo.featured)
    .slice(0, 5)
}, [])
```

- [ ] **Step 3: Add Editorial Picks section in JSX**

Add after Header, before the main flex container:
```tsx
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
```

Import Star from lucide-react if not already imported.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add editorial picks section to homepage"
```

---

## Task 6: Personalized Recommendations (Search History)

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/Sidebar.tsx`

- [ ] **Step 1: Add search history hook to page.tsx**

Add above the Home component:
```tsx
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
```

- [ ] **Step 2: Add recommendation logic in useMemo**

```tsx
const { history, addToHistory } = useSearchHistory()

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
```

- [ ] **Step 3: Update search to record history**

In the handleSearch or onChange handler:
```tsx
useEffect(() => {
  if (searchQuery.length > 2) {
    addToHistory(searchQuery)
  }
}, [searchQuery])
```

- [ ] **Step 4: Add recommendations to Sidebar**

In Sidebar component, add a new section at the bottom for recommendations.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx components/Sidebar.tsx
git commit -m "feat: add personalized recommendations based on search history"
```

---

## Task 7: Global CSS Enhancement

**Files:**
- Modify: `styles/globals.css`

- [ ] **Step 1: Read current globals.css**

- [ ] **Step 2: Add enhanced transition utilities**

Add at the end:
```css
/* Smooth card hover transitions */
.card-smooth {
  transition: transform 0.3s ease-out, box-shadow 0.3s ease-out, border-color 0.3s ease-out;
}

.card-smooth:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.08);
  border-color: var(--accent);
}

/* Panel slide transitions handled by Framer Motion */

/* Stagger animation helpers */
.stagger-container > * {
  opacity: 0;
}
```

- [ ] **Step 3: Commit**

```bash
git add styles/globals.css
git commit -m "style: add smooth transition utilities"
```

---

## Task 8: Build Verification

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: Build completes without errors

- [ ] **Step 2: Run dev server and verify visually**

```bash
npm run dev
```

Verify:
- Editorial picks section appears at top
- Cards have smooth hover animation
- Panel slides in from right
- Similar projects show in panel
- Recommendations appear in sidebar

- [ ] **Step 3: Commit all remaining changes**

---

## Self-Review Checklist

- [ ] All spec requirements have corresponding tasks
- [ ] No placeholder code (TBD, TODO)
- [ ] Type consistency across tasks (Repo interface matches)
- [ ] Each task has commit message
- [ ] Build verification step included

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-20-github-showcase-enhancement.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**