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
│   │   ├── plume.config.ts    # 主题配置 (博主信息、插件、博客设置)
│   │   ├── navbar.ts          # 导航栏配置
│   │   └── collections.ts     # 内容集合定义
│   ├── posts/                 # 博客文章 (post collection)
│   │   ├── tech/              # 技术类文章
│   │   └── life/              # 生活类随笔
│   ├── README.md              # 首页 (home: true)
│   ├── about.md               # 关于页面
│   └── friends.md             # 友链页面
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

```yaml
---
title: 文章标题          # 必填
date: 2026-07-08        # 写作日期，用于排序和归档
tags:                   # 标签，用于标签页
  - 标签1
  - 标签2
categories:             # 分类，用于分类页
  - 分类名
---
```

### 目录组织

- 技术文章 → `contents/posts/tech/`
- 生活随笔 → `contents/posts/life/`

## 配置说明

### 内容集合 (collections.ts)

当前定义了一个 `post` 类型的集合，`dir: 'posts'`，所有文章会自动：
- 按日期排序生成博客列表
- 生成标签页 `/blog/tags/`
- 生成分类页 `/blog/categories/`
- 按年份归档 `/blog/archives/`

### 已启用的功能

- 本地全文搜索 (minisearch)
- 代码复制、行高亮
- 数学公式 (KaTeX)
- 图表 (Chart.js, ECharts, Mermaid)
- 视频嵌入 (Bilibili, YouTube)
- 图标 (Iconify 200K+)
- SEO (sitemap.xml, robots.txt, Open Graph)
- 自动 frontmatter 补全

### 待配置

- Giscus 评论系统 (需 GitHub 仓库创建后配置)

## 部署

push 到 `master` 分支 → GitHub Actions 自动构建 → 部署到 `gh-pages` 分支 → GitHub Pages 提供服务

- **自定义域名**: ca2didi.xyz
- **base**: "/"
- **构建输出**: contents/.vuepress/dist
- **CNAME**: 构建时自动写入 dist/CNAME

## 注意事项

- 不要修改 `contents/.vuepress/` 之外的构建配置
- `docs/` 目录不参与 VuePress 构建，由 Superpowers 代理独占
- 配置修改优先在 `plume.config.ts` 中进行（支持热更新，无需重启）
- pnpm 的 peer dependencies 需要显式安装 `vue`
