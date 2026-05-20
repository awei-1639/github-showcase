# GitHub 资源自动抓取系统设计

## Context

用户希望每天凌晨自动从 GitHub 抓取高质量实用的开源资源，生成 PR 由用户审核后合并。

---

## 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions (每天凌晨 2:00 UTC)                          │
│  on: schedule: cron: '0 2 * * *'                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 抓取阶段                                                 │
│     ├── GitHub Trending (每个分类取 Top 10)                  │
│     ├── 关键词搜索 (awesome, best, top, useful)              │
│     └── 分类定向搜索 (按预置分类列表)                         │
│                                                             │
│  2. 过滤阶段                                                 │
│     ├── Stars >= 10k                                        │
│     ├── 最近更新 (6个月内)                                   │
│     ├── 非归档项目                                           │
│     ├── 有详细 description                                   │
│     └── 排除已有项目 (去重)                                  │
│                                                             │
│  3. 输出阶段                                                 │
│     ├── 生成 repos-update-{date}.json                       │
│     ├── 创建 PR: "chore: update resources {date}"           │
│     └── 包含新增项目列表和变更摘要                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 抓取策略

### 来源 1: GitHub Trending
- 抓取每个主要分类的 Trending 页面
- 限制：每个分类取前 10 名
- 理由：Trending 反映当下热度

### 来源 2: 关键词搜索
- 搜索词：`awesome list`, `best tools`, `top projects`
- 限制：每个搜索词取前 5 名
- 理由：发现优质清单型项目

### 来源 3: 分类定向
- 按预置分类搜索相关关键词
- 如 "machine learning library", "api framework"
- 限制：每个分类取前 3 名
- 理由：确保各分类都有新增

---

## 质量过滤规则

```typescript
const filters = {
  minStars: 10000,         // Stars >= 10k
  maxAge: 180,             // 最近180天内有更新
  requireDescription: true,  // 必须有描述
  excludeArchived: true,     // 排除归档项目
  excludeForked: true,       // 排除 fork 项目
}
```

---

## 输出格式

### 新增项目 JSON

```json
{
  "date": "2026-05-21",
  "action": "add",
  "projects": [
    {
      "name": "project-name",
      "description": "...",
      "url": "https://github.com/...",
      "stars": "45k",
      "category": "tools",
      "source": "trending|search|category",
      "reason": "Trending Top 3 / Stars 52k / ..."
    }
  ],
  "removed": []
}
```

### PR 内容

```
## 更新摘要 (2026-05-21)

### 新增项目 (5)
- **project-name**: 描述... (★52k | 来源: Trending)
- ...

### 变更分类分布
- Tools: 2
- Learning: 1
- API: 2

---
审核后运行 `git merge` 确认更新。
```

---

## 文件结构

```
.github/
└── workflows/
    └── update-resources.yml    # 定时任务配置

scripts/
└── update-resources.ts         # 抓取脚本（TypeScript）

data/
└── repos.json                  # 已有数据
```

---

## 技术选型

- **调度**: GitHub Actions schedule (cron)
- **脚本**: TypeScript + GitHub CLI (gh)
- **认证**: GITHUB_TOKEN (自动生成)
- **输出**: JSON 文件 + PR

---

## 安全考虑

1. 只读操作（搜索 API）
2. 不暴露敏感信息
3. PR 审核机制防止恶意内容注入

---

## 局限性

1. GitHub Search API 限制：每小时 30 次请求
2. 抓取数量有限制（不能一次性抓取全量）
3. 需要合理的间隔和重试机制