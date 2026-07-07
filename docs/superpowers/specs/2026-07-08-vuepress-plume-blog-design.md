# 个人博客搭建设计文档

**日期**: 2026-07-08
**状态**: 已确认

## 概述

使用 VuePress 2 + Plume 主题搭建个人博客，部署到 GitHub Pages，绑定自定义域名 `ca2didi.xyz`。

## 技术选型

| 项目 | 技术 |
|------|------|
| 静态站点生成器 | VuePress 2 (v2.0.0-rc.x) |
| 主题 | vuepress-theme-plume (1.0.0-rc.204) |
| 构建工具 | @vuepress/bundler-vite |
| 包管理器 | pnpm 10+ |
| Node.js | >= 20.19.0 |
| 语言 | TypeScript |

## 仓库与部署

- **仓库**: `cardidi/blogs`（普通仓库，非 `<username>.github.io`）
- **自定义域名**: `ca2didi.xyz`
- **base**: `"/"`（自定义域名直接访问根路径）
- **部署方式**: GitHub Actions 自动构建，推送到 `gh-pages` 分支
- **GitHub Pages 源**: 从 `gh-pages` 分支部署

## 内容组织

使用一个 `post` 类型的 Collection，文章通过 frontmatter 的 `tags`/`categories` 区分类型：

```ts
collections: [{
  type: 'post',
  dir: 'posts',
  link: '/',
  title: '博客',
}]
```

文章目录结构：
```
contents/posts/
├── tech/       # 技术文章
└── life/       # 生活随笔
```

自动生成标签页、分类页、归档页。

## 功能清单

| 功能 | 方案 | 状态 |
|------|------|------|
| 全文搜索 | Plume 内置（minisearch） | 已实施 |
| 评论系统 | Giscus（GitHub Discussions） | 待配置 |
| 友情链接 | Plume 内置友链页 | 已实施 |
| SEO | Plume 内置（sitemap + meta） | 已实施 |

## 项目结构

```
blogs/
├── contents/                  # VuePress 博客内容（与 superpowers 隔离）
│   ├── .vuepress/
│   │   ├── config.ts          # VuePress 主配置
│   │   ├── plume.config.ts    # 主题配置（博主信息、友链等）
│   │   ├── navbar.ts          # 导航栏
│   │   └── collections.ts     # 内容集合
│   ├── posts/                 # 博客文章
│   │   ├── tech/
│   │   └── life/
│   └── README.md              # 首页
├── docs/                      # Superpowers 代理工作空间
│   └── superpowers/
│       └── specs/             # 设计文档
├── .github/workflows/
│   └── docs.yml               # GitHub Actions 部署工作流
├── package.json
└── .gitignore
```

## 部署流程

```
git push main → GitHub Actions 触发
  → checkout (fetch-depth: 0)
  → setup pnpm + Node.js 22
  → pnpm install --frozen-lockfile
  → pnpm docs:build（输出到 contents/.vuepress/dist）
  → 写入 CNAME 文件（ca2didi.xyz）
  → 推送 dist 到 gh-pages 分支
  → GitHub Pages 自动提供服务
```

## 仓库一次性设置

1. Settings → Pages → Source: Deploy from a branch, 选择 `gh-pages` / `/ (root)`
2. Custom domain: `ca2didi.xyz`，开启 Enforce HTTPS
3. DNS 服务商添加 CNAME 记录：`ca2didi.xyz` → `cardidi.github.io`
