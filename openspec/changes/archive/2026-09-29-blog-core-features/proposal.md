## Why

task.md 定义的目标是"个人站点"式博客（站长介绍、技术文章、个人文摘、播客、漫画、相册），并列出必须功能清单。当前原型只实现了文章展示的基础骨架（三语列表、文章页、主题切换、TOC）。必须功能中的大部分——文章分类、专栏、标签聚合、分页、关于页、视频嵌入——尚未实现；另有三个体验缺陷（主题切换换页后失效、主题按钮位置、语言切换平铺形态）需要修复。本轮先落地全部纯静态功能，评论系统与新型内容类型（播客/漫画/相册）暂缓。

## What Changes

- **内容模型扩展**：文章 frontmatter 新增 `category`（`tech` / `journal` 内容大类）、`series`（专栏 id，可选）、`video`（`bilibili` / `youtube` 视频 id，可选）
- **分类页**：按 `category` 过滤文章列表，支持分页；新增 `/zh/category/tech/` 等路由
- **专栏页**：按 `series` 聚合文章，按时间**正序**（旧→新）排列；新增 `/zh/series/<id>/` 路由
- **标签聚合**：`/zh/tags/` 标签索引（带文章计数）+ `/zh/tags/<tag>/` 标签文章列表，支持分页
- **列表分页**：首页、分类页、标签页分页，URL 形如 `/zh/page/2/`；列表项摘要按屏幕尺寸自适应截断
- **关于页**：`/zh/about/`，站长介绍（非隐私信息、技术能力、喜好、社交账号、豆瓣书影音入口），三语
- **主页改版**：hero 简介 + 最新文章 + 内容类型入口导航，解决起步阶段主页内容空的问题
- **视频嵌入**：新增 `VideoEmbed` 组件，B站/YouTube 按访问者环境分流（客户端默认选择 + 手动切换），无 JS 时降级为两个平台的文字链接
- **主题切换持久化修复**：View Transitions 导航后主题状态与按钮显示同步，用户选择跨页面保持
- **主题按钮位置**：从 Header 移到 Footer
- **语言切换形态**：三个平铺按钮改为下拉列表（原生 `<details>`，无 JS 可用）
- **无障碍与无 JS 回退**：贯穿以上所有新增功能

**非目标**：评论系统（暂缓，方案后续单独立项）、播客/漫画/相册内容类型、黑白底色视觉 bug（用户明确排除）、多语言对照参考示例的查缺补漏（另行处理）。

## Capabilities

### New Capabilities

- `content-organization`: 文章内容模型（category/series/video 字段）与分类、专栏、标签、分页等聚合展示能力
- `personal-pages`: 关于页与主页改版，承载站长介绍、社交账号、豆瓣书影音与内容入口
- `video-embed`: 视频引用嵌入，支持 B站/YouTube、国内外环境分流与无 JS 回退
- `site-controls`: 站级控件体验——主题切换持久化、主题按钮位置、语言下拉切换

### Modified Capabilities

<!-- 无现有 capability（openspec/specs/ 当前为空），本轮全部为新增。 -->

## Impact

- `src/content.config.ts`：blog 集合 schema 扩展（category / series / video）
- `src/i18n.ts`：站级文案三语补充（分类/标签/专栏/关于/分页/视频等）
- `src/pages/[lang]/`：新增 `category/`、`series/`、`tags/`、`about/` 路由与分页改造
- `src/components/`：新增 `VideoEmbed.astro`；改造 `LangSwitcher.astro`（下拉）、`Header.astro` / `Footer.astro`（主题按钮迁移）、`ThemeScript.astro`（导航后状态同步）
- `src/content/blog/`：补充 tech / journal 分类示例文章（覆盖分页/标签/专栏验证）
- `docs/blog-design.md`：更新设计与实现说明
