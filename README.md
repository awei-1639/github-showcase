# GitHub Showcase

精选优质开源项目导航，一个具有复古未来主义美学的开发者资源站。

![Preview](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Preview](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Preview](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwind-css)
![Preview](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 特性

- **分类浏览** - 按学习、开发工具、前端、API、DevOps 等分类筛选项目
- **智能搜索** - 支持模糊搜索项目名称、描述、标签和作者
- **标签过滤** - 支持多标签组合筛选（AND 逻辑）
- **编辑精选** - 人工筛选的高质量推荐项目
- **相似推荐** - 基于项目描述的智能相似项目推荐
- **搜索历史** - 本地记录搜索历史，辅助推荐算法

## 技术栈

| 技术 | 用途 |
|------|------|
| Next.js 14 | React 框架，App Router |
| React 18 | UI 库 |
| Tailwind CSS | 样式框架 |
| Framer Motion | 动画库 |
| Fuse.js | 模糊搜索 |
| Lucide React | 图标库 |

## 开始使用

```bash
# 克隆项目
git clone https://github.com/awei-1639/github-showcase.git

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页
│   └── layout.tsx         # 布局文件
├── components/            # React 组件
│   ├── Header.tsx        # 顶部导航
│   ├── Sidebar.tsx       # 侧边栏分类
│   ├── SearchBar.tsx     # 搜索框
│   ├── TagCloud.tsx      # 标签云
│   ├── RepoGrid.tsx      # 项目卡片网格
│   ├── RepoCard.tsx      # 项目卡片
│   └── RepoPanel.tsx     # 项目详情面板
├── data/
│   └── repos.json        # 项目数据
└── styles/
    └── globals.css       # 全局样式
```

## 数据来源

项目数据存储在 `data/repos.json`，包含以下字段：

| 字段 | 说明 |
|------|------|
| id | 唯一标识 |
| name | 项目名称 |
| description | 项目描述 |
| url | GitHub 地址 |
| stars | 星标数 |
| tags | 标签数组 |
| category | 分类 |
| author | 作者 |
| featured | 是否精选 |

## 设计风格

采用**复古未来主义（Retro-Futurism）** 设计语言：

- 深色背景 + 霓虹色彩（青色、粉色、紫色）
- 玻璃态（Glassmorphism）导航栏
- 流畅的微交互和过渡动画
- 赛博朋克风格的发光边框效果

## License

MIT License
