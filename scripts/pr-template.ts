import { UpdatePayload } from './types'

export function generatePRBody(payload: UpdatePayload): string {
  const dateStr = payload.date || new Date().toISOString().split('T')[0]
  const { stats, projects, removed } = payload

  // Group projects by category
  const categoryMap = new Map<string, typeof projects>()
  for (const project of projects) {
    const existing = categoryMap.get(project.category) ?? []
    existing.push(project)
    categoryMap.set(project.category, existing)
  }

  // Stats summary
  const statsLines = [
    `| 指标 | 数值 |`,
    `|------|------|`,
    `| 总抓取 | ${stats.totalFetched} |`,
    `| 质量过滤后 | ${stats.totalFiltered} |`,
    `| 新增项目 | ${stats.totalAdded} |`,
    `| 移除项目 | ${stats.totalRemoved} |`,
  ]

  // Category distribution
  const categoryLines = Array.from(categoryMap.entries()).map(
    ([category, projects]) => `- **${category}**: ${projects.length} 个项目`
  )

  // Source distribution
  const sourceLines = Object.entries(stats.bySource).map(
    ([source, count]) => `- ${source}: ${count}`
  )

  // New projects list
  const newProjectsLines = projects.map((project) => {
    const starsDisplay = `★${project.stars}`
    const activity = project.activityMetrics.recentCommits > 0
      ? `${project.activityMetrics.recentCommits} commits`
      : 'unknown'
    return `- **[${project.name}](${project.url})**: ${truncate(project.description, 80)} (${starsDisplay} | ${activity} | 来源: ${project.source})`
  })

  // Removed projects
  const removedLines = removed.length > 0
    ? removed.map((r) => `- ~~${r.name}~~ - ${r.reason}`)
    : ['（无）']

  return `## 📊 资源更新报告 (${dateStr})

### 统计摘要

${statsLines.join('\n')}

### 分类分布

${categoryLines.length > 0 ? categoryLines.join('\n') : '（无）'}

### 来源分布

${sourceLines.join('\n')}

---

## ✨ 新增项目 (${projects.length})

${newProjectsLines.length > 0 ? newProjectsLines.join('\n') : '（无新增项目）'}

---

## 🗑️ 移除项目 (${removed.length})

${removedLines.join('\n')}

---

### 审核建议

1. 检查新增项目的描述是否为中文或包含中文说明
2. 验证 star 数量和分类是否匹配
3. 确认没有重复项目
4. 合并前请在本地运行 \`npm run update-resources\` 测试

### 自动生成

此 PR 由 GitHub Actions 自动生成。
- 触发时间: ${new Date().toISOString()}
- 质量评分阈值: 0
- 最小 Star 数: 10,000`
}

export function generateUpdateJSON(payload: UpdatePayload): string {
  return JSON.stringify(payload, null, 2)
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}
