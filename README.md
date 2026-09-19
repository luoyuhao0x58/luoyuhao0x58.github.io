# 羽皓のBlog

个人博客原型（Astro 静态站）。双语（zh/en）、数学公式、Mermaid 图、GFM 语法全支持，纸片式文章排版 + 三态主题切换。

## 快速开始

```bash
# 安装依赖(需要 Node 20.19+/22.12+ 与 pnpm 12)
pnpm install

# 本地开发:http://localhost:4321
pnpm dev

# 生产构建:输出到 dist/
pnpm build

# 预览构建产物
pnpm preview

# Lint
pnpm lint
```

## 目录结构

```
src/
├── components/     # Header / Footer / Toc / LangSwitcher / 主题切换
├── content/        # 文章(zh/en markdown)
├── layouts/        # BaseLayout / MarkdownPostLayout
├── pages/          # 路由(/zh /en 子路径)
├── plugins/        # rehype 标题锚点插件
├── scripts/        # mermaid 渲染、目录交互
├── styles/         # tokens(共享令牌副本)/ base / article / mermaid / layout
├── content.config.ts
└── i18n.ts
```

## 写文章

在 `src/content/blog/<zh|en>/` 下新增 markdown，frontmatter 示例：

```yaml
---
title: "文章标题"
pubDate: 2026-09-14
description: 摘要
tags: [标签]
lang: zh
translationOf: en/some-post
image:
  url: https://example.com/cover.jpg
  alt: 封面图
---
```

支持：GFM（任务列表/删除线/表格）、KaTeX（`$...$` / `$$...$$`）、Mermaid（```` ```mermaid ````）、Shiki 代码高亮、原始 HTML。

## 设计与文档

- [博客设计说明](docs/blog-design.md) — 布局/排版/目录/主题/响应式决策
- [设计令牌说明](docs/design-tokens.md) — vendored 令牌与深色模式
- [部署架构说明](docs/deployment.md) — CI 模型 A、平台矩阵、DNS 分流

## 部署

构建一次 → 推 gh-pages + Cloudflare/EdgeOne/Vercel/Netlify 直传。详见 [docs/deployment.md](docs/deployment.md) 与 `.github/workflows/deploy.yml`。

## OpenSpec

本仓库的开发使用 OpenSpec 流程（`openspec/` 目录）：`/opsx-new-change` 发起变更、`/opsx-propose` 提案、`/opsx-verify-change` 校验、`/opsx-archive` 归档。
