# AGENTS.md

## 项目概述

基于 VuePress 2 + Plume 主题的个人博客，部署于 GitHub Pages，绑定自定义域名 `ca2didi.xyz`。

## 技术栈

- **VuePress 2** (v2.0.0-rc.30) — 静态站点生成器
- **vuepress-theme-plume** (v1.0.0-rc.204) — 博客主题
- **@vuepress/bundler-vite** — Vite 构建工具
- **TypeScript** — 配置语言
- **pnpm** — 包管理器

## 目录结构

```
blogs/
├── contents/                  # VuePress 博客源文件
│   ├── .vuepress/             # 配置目录
│   │   ├── config.ts          # VuePress 主配置 (base, lang, theme)
│   │   ├── theme.ts           # 主题配置 (博主信息、插件、博客设置)
│   │   ├── navbar.ts          # 导航栏配置
│   │   └── collections.ts     # 内容集合定义
│   ├── posts/                 # 博客文章 (post collection)
│   │   ├── tech/              # 技术文章 → 分类 "技术思考"
│   │   └── life/              # 生活随笔 → 分类 "日常随笔"
│   ├── about.md               # 关于页面
│   ├── friends.md             # 友链页面
│   └── resources/             # 静态资源 (头像等)
├── docs/                      # Superpowers 代理工作空间，不参与构建
│   └── superpowers/specs/     # 设计文档
├── .github/workflows/docs.yml # GitHub Actions 自动部署
├── package.json
└── .gitignore
```

## 常用命令

```bash
# 启动开发服务器 (http://localhost:8080)
pnpm docs:dev

# 构建静态站点 (输出到 contents/.vuepress/dist)
pnpm docs:build

# 更新主题版本
pnpm dlx vp-update
```

## 文章编写规范

### Frontmatter

文章放入 `contents/posts/tech/` 或 `contents/posts/life/` 后，`autoFrontmatter` 会自动补全 `permalink`、`createTime` 和 `title`。

手动声明的字段会覆盖自动生成的值：

```yaml
---
title: 文章标题          # 可选，默认取文件名
createTime: 2026-07-08  # 可选，默认取文件创建时间
categories:             # 必填，决定文章归属于哪个分类页
  - tech                # tech → "技术思考"，life → "日常随笔"
tags:                   # 可选，用于标签页
  - 标签1
  - 标签2
---
```

### 目录组织

- 技术文章 → `contents/posts/tech/` → 分类名 "技术思考"
- 生活随笔 → `contents/posts/life/` → 分类名 "日常随笔"

分类映射定义在 `collections.ts` 的 `categoriesMap` 中。

## 配置说明

### 配置文件职责

| 文件 | 职责 |
|------|------|
| `config.ts` | VuePress 基础配置 (lang, title, base, bundler)，导入 theme |
| `theme.ts` | Plume 主题配置 (profile, social, navbar, collections, plugins) |
| `navbar.ts` | 导航栏项定义 |
| `collections.ts` | 内容集合定义 (路由、分页、分类、标签、归档、autoFrontmatter) |

### 内容集合 (collections.ts)

当前定义了一个 `post` 类型集合：

- `dir: 'posts'` — 文章来源目录
- `link: '/'` — 首页即为博客文章列表
- `linkPrefix: '/article/'` — 文章 URL 前缀，单篇文章地址为 `/article/<slug>/`
- `pagination: 12` — 每页 12 篇文章
- `categoriesLink: '/categories/'` — 分类页
- `tagsLink: '/tags/'` — 标签页
- `archivesLink: '/archives/'` — 归档页
- `categoriesTransform` — 将分类 ID 映射为中文名称
- `autoFrontmatter` — 自动为文章生成 permalink（基于文件路径）、createTime 和 title

### 导航栏 (navbar.ts)

| 链接 | 说明 |
|------|------|
| `/about/` | 关于我 |
| `/categories/` | 分类 |
| `/tags/` | 标签 |
| `/archives/` | 归档 |
| `/friends/` | 友链 |

### 页面路由规则

- 独立页面使用 `permalink` frontmatter 设定路由（如 `/about/`、`/friends/`），生成 `index.html` 目录结构
- 博客文章由集合自动生成，通过 `linkPrefix` + 文件路径组成路由
- 静态资源放在 `contents/.vuepress/public/` 或 `contents/resources/`

### 已启用的功能

- 本地全文搜索 (minisearch)
- 代码复制、行高亮
- PDF 嵌入、Bilibili/YouTube 视频
- Iconify 图标 (200K+)
- 数学公式 (KaTeX)
- SEO (sitemap.xml, robots.txt, Open Graph)
- 首页 dot-grid 动态背景效果 (依赖 three.js + gsap)

### 待配置

- Giscus 评论系统 (需 GitHub 仓库创建后配置)

## 部署

push 到 `master` 分支 → GitHub Actions 自动构建 → 部署到 `gh-pages` 分支 → GitHub Pages 提供服务

- **自定义域名**: ca2didi.xyz
- **base**: "/"
- **构建输出**: contents/.vuepress/dist
- **CNAME**: 构建时自动写入 dist/CNAME
- **Node.js**: 24 (GitHub Actions)

## 注意事项

- 配置集中在 `contents/.vuepress/`，不应在其他位置修改构建配置
- `docs/` 目录不参与 VuePress 构建，由 Superpowers 代理独占
- 主题配置从 `plume.config.ts` 迁移到了 `theme.ts`，不再使用独立的主题热更新文件
- pnpm 的 peer dependencies 需要显式安装 `vue`
- 分类名称映射修改在 `collections.ts` 的 `categoriesMap` 中
