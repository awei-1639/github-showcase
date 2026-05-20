import { UpdatePayload } from './types'

export function generatePRBody(payload: UpdatePayload): string {
  const dateStr = payload.date || new Date().toISOString().split('T')[0]

  // Group projects by category
  const categoryMap = new Map<string, typeof payload.projects>()
  for (const project of payload.projects) {
    const existing = categoryMap.get(project.category) ?? []
    existing.push(project)
    categoryMap.set(project.category, existing)
  }

  // Format new projects section
  const newProjectsLines = payload.projects.map((project) => {
    const starsDisplay = `★${project.stars}`
    const sourceLabel = project.source === 'trending' ? 'Trending' : project.source === 'search' ? 'Search' : 'Category'
    return `- **${project.name}**: ${project.description}... (${starsDisplay} | 来源: ${sourceLabel})`
  })

  // Format category distribution
  const categoryLines = Array.from(categoryMap.entries()).map(
    ([category, projects]) => `- ${category}: ${projects.length}`
  )

  return `## 更新摘要 (${dateStr})

### 新增项目 (${payload.projects.length})
${newProjectsLines.join('\n')}

### 变更分类分布
${categoryLines.join('\n')}

---
自动生成的资源更新 PR。审核后合并即可更新网站内容。`
}

export function generateUpdateJSON(payload: UpdatePayload): string {
  return JSON.stringify(payload, null, 2)
}