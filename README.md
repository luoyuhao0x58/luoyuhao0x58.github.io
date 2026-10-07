# 羽皓のBlog

个人博客原型（Astro 静态站）。语言表 8 种、当前 3 个活跃（简体中文 / 繁體中文 / English），数学公式、Mermaid 图、GFM 语法全支持，纸片式文章排版 + 三态主题切换。

## 快速开始

```bash
# 安装依赖(需要 Node 22.12+ 与 pnpm 12;仓库 .nvmrc 为 24,packageManager 为 pnpm@12.4.1)
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

## 语言与路由

- `src/i18n.ts` 的 `languages` 数组定义 8 种语言，URL 前缀统一小写（`langPath`）：`/zh/`（简体中文，默认）、`/zh-hant/`（繁體中文）、`/en/`（English）、`/es/`、`/ja/`、`/ko/`、`/ru/`、`/ar/`；当前仅前 3 个**活跃**（有文章），其余语言整站不渲染、语言切换器也不列
- 活跃语言 = posts 有文章的语言 + 保底 `["zh","en"]`（见 `src/lib/active-langs.ts`）——新增语言除了在 `languages` 加一行、补齐站级文案，还要在 `src/content/posts/<code>/` 放文章才会生效
- 根路径 `/` 是语言协商页：按浏览器语言自动跳到对应语言首页（繁体系 → `/zh-hant/`，其他中文 → `/zh/`，英语 → `/en/`，其余按活跃语言族前缀匹配，无法判断 → `/en/`）；无 JS 环境由 meta refresh 兜底跳 `/en/`
- 语言切换器按文章 slug 平行匹配：同名 slug 的文章在活跃语言间互切；某语言暂无对应文章时，回退到该语言首页

## 目录结构

```
src/
├── components/     # Header / Footer / Toc / LangSwitcher / PostCard / Pagination / 主题切换等
├── content/        # posts 文章(8 个语言子目录,仅 zh/zh-Hant/en 有文章)+ about(8 语言各一)
├── layouts/        # BaseLayout / MarkdownPostLayout
├── pages/          # 路由([lang] 子路径 + 根路径协商页 + rss / robots / sitemap)
├── plugins/        # rehype 插件(标题锚点、图片布局、任务列表、Mermaid 构建期渲染等)
├── scripts/        # 客户端脚本(目录交互 / 表格 hover / 时间本地化)
├── styles/         # tokens(唯一事实源)/ base / global / article / layout / mermaid / mermaid-palette
├── content.config.ts
└── i18n.ts         # 语言表(8 语言)与站级文案
```

## 写文章

在 `src/content/posts/<zh|zh-Hant|en>/` 下新增 markdown（8 个语言子目录，仅 zh/zh-Hant/en 有内容），语言子目录与 frontmatter 的 `lang` 保持一致（由 `src/i18n.ts` 语言表派生校验），示例：

```yaml
---
title: "文章标题"
pubDate: 2026-09-14
description: 摘要
tags: [blog]                # 仅允许 src/taxonomy.ts 的 tagLabels 中已定义的英文 key
lang: zh                    # 语言代码:zh / zh-Hant / en(当前活跃语言)
category: programmer        # 内容大类,默认 programmer(见 src/taxonomy.ts 的 categoryLabels)
slug: hello-world           # 可选:URL 用;缺省由文件名派生(跨语言同名文件构成平行 slug)
image:
  url: https://example.com/cover.jpg
  alt: 封面图
---
```

支持：GFM（任务列表/删除线/表格）、KaTeX（`$...$` / `$$...$$`）、Mermaid（```` ```mermaid ````）、Shiki 代码高亮、原始 HTML。

### 图片布局

图片默认按上下文自动归类：纯图片段落（无文字混排）单图 → 顶格大图、连续多图 → 并排画廊；行内混排图片 → 行内小图。需要显式控制时在图片 URL 末尾加后缀（构建时自动剥离）：

```markdown
![大图](images/a.png)              # 纯图片段单图 → 顶格大图(默认)
![图1](images/a.png)                # 连续多图无空行 → 并排画廊(默认)
![图2](images/b.png)
文字里夹 ![小图](images/i.png) 继续   # 行内 → 小图(默认)
![小图居中](images/b.png#small)     # 强制小图,居中
![大图](images/c.png#wide)          # 强制大图
![左浮图](images/d.png#left)        # 浮动左,文字环绕
![右浮图](images/e.png#right)       # 浮动右
![图](images/f.png#pair)            # 图文并排对(下一段文字与之并排)
说明文字…
![图1](images/1.png#row) ![图2](images/2.png#row) ![图3](images/3.png#row)  # 多图并排画廊
```

示例见 `bak/en/Full-Markdown.md`（示例文章归档在 bak/，不参与构建）的 Image Layout 小节。

## 设计与文档

- [博客设计说明](docs/blog-design.md) — 布局/排版/目录/主题/多语言/响应式决策
- [设计令牌说明](docs/design-tokens.md) — 设计令牌与深色模式
- [部署架构说明](docs/deployment.md) — CI 模型 A、平台矩阵、DNS 分流

## 部署

构建一次 → 推 gh-pages + Cloudflare/EdgeOne/Vercel/Netlify 直传。发布由 GitHub Actions **手动触发**（`workflow_dispatch`，无 push 自动发布）。详见 [docs/deployment.md](docs/deployment.md) 与 `.github/workflows/deploy.yml`。

## OpenSpec

本仓库的开发使用 OpenSpec 流程（`openspec/` 目录）：`/opsx-new-change` 发起变更、`/opsx-propose` 提案、`/opsx-verify-change` 校验、`/opsx-archive` 归档。
