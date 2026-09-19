## Context

现状（见 proposal.md - Why）：Astro 7 SSG 静态站，三语（zh/zh-Hant/en，URL 前缀小写），blog 内容集合 schema 含 `title/pubDate/description/tags/lang/translationOf/image`；已有首页列表、文章页、TOC、主题三态切换、View Transitions（`ClientRouter`）、手写 sitemap。所有页面为静态预渲染，强调无 JS 回退。

关键实现约束：

- 文章多语言按 **slug 平行匹配**（同 slug 三语互切），新聚合页必须沿用"URL 语言前缀 + 当前语言内容"规则
- 主题脚本 `ThemeScript.astro` 是 `<head>` 内 `is:inline`，点击逻辑与 localStorage 持久化已存在，但 `updateButton` 绑在 `DOMContentLoaded`——View Transitions 导航后不会再次触发，导致按钮显示与真实主题脱节（详见 Decisions - 主题持久化）
- 站点为纯 SSG，构建期无法获知访问者地理位置，视频"国内/海外分流"只能客户端判定

## Goals / Non-Goals

**Goals:**

- 为文章内容建立分类、专栏、标签三维聚合与统一分页，全部静态预渲染
- 提供关于页与主页改版，把个人站门面立起来
- 视频嵌入支持 B站/YouTube 双平台、客户端分流与无 JS 回退
- 修复主题切换跨页持久化、按钮移底部、语言切换改下拉
- 所有新功能满足无障碍与无 JS 回退约束

**Non-Goals:**

- 不引入任何外部依赖或运行时服务（评论、数据库、serverless）
- 不新增播客/漫画/相册内容集合（后续单独立项）
- 不处理黑白底色视觉 bug（用户明确排除）
- 不对照参考示例做多语言查缺补漏（另行处理）

## Decisions

### D1 内容模型：扩展既有 blog 集合而非新增集合

在 `src/content.config.ts` 的 blog schema 上追加字段：

- `category: z.enum(["tech", "journal"]).default("tech")` — 内容大类
- `series: z.string().optional()` — 专栏 id
- `video: z.object({ bilibili: z.string().optional(), youtube: z.string().optional() }).optional()`

**理由**：技术文章与个人文摘形态同为"文章"，只差分类维度，共用一套 schema/列表组件最省；播客/漫画/相册形态差异大（音频/分镜/图片墙），后续用独立集合，本轮不做。**备选**：多集合并行——被否，第一阶段会引入双倍页面与 schema 维护面，收益不明显。

### D2 路由与页面结构

全部位于 `src/pages/[lang]/` 下，语言前缀沿用 `langPath`：

```
[lang]/index.astro              首页: hero + 最新文章 + 分页
[lang]/page/[page].astro        第 2 页起分页
[lang]/category/[category]/index.astro   分类页(分页)
[lang]/series/[name]/index.astro         专栏页(正序, 不分页)
[lang]/tags/index.astro                  标签索引(带计数)
[lang]/tags/[tag]/index.astro            标签文章页(分页)
[lang]/about/index.astro                 关于页
[lang]/posts/[slug].astro                文章页(已有)
```

**理由**：`/zh/page/2/` 是静态站分页的常规形态；`page` 目录独立出来避免与文章 slug 冲突。

### D3 分页：Astro `paginate()`

首页/分类/标签页在 `getStaticPaths` 内用 `paginate(posts, { pageSize: 10 })` 预渲染全部页，`pageSize` 收敛为常量。列表渲染抽公共组件（文章卡 + 分页导航），三处复用，避免三份分页逻辑漂移。

**备选**：客户端分页/无限滚动——被否，违背无 JS 回退约束，且 SSG 应预渲染全部页。

### D4 专栏正序

`series` 同名聚合，专栏页按 `pubDate` **升序**（旧→新），这是"专栏"与"列表"的唯一行为差异；文章少，不分页。

### D5 关于页：新增 `about` 内容集合

新增 `src/content/about/` 集合：三语子目录各一个 markdown，frontmatter 放结构化字段（标题、简介、技术能力列表、喜好、社交账号链接数组、豆瓣入口），正文放长文本介绍。`/zh/about/` 读取对应语言条目。

**理由**：站长信息偏结构化（链接/列表），放 frontmatter 便于维护；正文 markdown 可写长介绍；与既有内容管线（语言表派生 lang 校验）一致。**备选**：`i18n.ts` messages 存全部 about 文案——被否，站长信息是内容不是站壳文案，混入 messages 会让 i18n 文件膨胀且难维护。

### D6 视频嵌入与分流

`VideoEmbed.astro` 服务端按 `video` 字段渲染：

- 单平台：直接渲染该平台 iframe
- 双平台：默认渲染 B站 iframe（构建期无法判地理，取默认）+ 平台切换控件 + **始终渲染两个平台的文字链接**作为无 JS 兜底
- 客户端脚本（渐进增强）：判定环境选择默认平台（`navigator.language` 前缀 zh 或 `Intl` 时区为 `Asia/*` → 国内）→ 若判定海外且有 youtube 则默认切到 YouTube；点击切换按钮互换 iframe；手动选择写入 `localStorage`，**优先于自动判定**
- 无 JS：页面呈现默认 iframe + 两个文字链接，可直接点链接跳平台

**理由**：SSG 无服务端地理信息，客户端判定 + localStorage 覆盖是静态站下最实际的方案。**备选**：CF Edge 地理 header——被否，部署面含纯静态 gh-pages，无 edge 逻辑可用。

### D7 主题持久化修复

根因：View Transitions 导航后 `DOMContentLoaded` 不再触发，`updateButton` 不执行；且 `<head>` inline 脚本在导航后的重跑时序不可控，可能造成按钮显示与实际主题脱节。

修复：`ThemeScript.astro` 增加 `document.addEventListener("astro:page-load", …)`（Astro View Transitions 提供、每次导航完成后触发），回调内重新执行 `setState(从 localStorage 读回)` + `updateButton()`。初始化逻辑保留，双保险。

**备选**：把主题脚本改为普通外部脚本 + `astro:page-load`——无必要，inline 脚本保留首帧防闪烁优势，仅补事件即可。

### D8 语言切换下拉

`LangSwitcher.astro` 改为 `<details>/<summary>`：summary 显示当前语言 `shortLabel` + 箭头，展开面板列三语完整 label 链接。**选 `<details>` 而非 `<select>`**：原生展开收起、无 JS 完全可用、样式可完全定制；移动端不挤占导航。渐进增强：加少量 JS 支持点击外部自动收起；无障碍用 `nav aria-label="Language"` + `aria-current="page"` 标记当前语言。

### D9 主题按钮位置

`Header.astro` 移除 `<ThemeToggle>`，`Footer.astro` 加入（已接收 `lang` prop）。按钮 ID `#theme-toggle` 不变，`ThemeScript` 的 `getElementById` 与事件委托不受位置影响。

### D10 无障碍与无 JS 回退（贯穿）

- 聚合页/分页导航为纯静态链接，天然无 JS 可用
- 新页面沿用既有 aria 惯例（`aria-label`、`aria-current`），分页导航补 `aria-label`
- 视频组件、语言下拉按上述无 JS 降级
- 现有 `skip link` 缺失项在实现时顺带核对（若成本低则补，不扩大范围）

## Risks / Trade-offs

- [视频环境判定可能误判（海外中文用户被判定国内）] → 手动切换按钮 + localStorage 记忆用户选择，自动判定仅作默认
- [View Transitions 与主题脚本时序仍可能存在个别边界（如快速连续导航）] → `astro:page-load` 每次导航后强制 setState + updateButton；验收点专门覆盖"连翻多篇文章主题一致"
- [`about` 集合新增 schema，与 blog 并行，维护面略增] → 集合极小（每语言 1 个条目），风险可忽略
- [`<details>` 下拉在部分旧浏览器的样式差异] → 用既有设计令牌与重置样式，视觉退化可接受
- [分页 URL 与多语言嵌套易出错] → 分页逻辑收敛为单一组件复用，路由在 tasks 阶段用构建产物逐条核对

## Migration Plan

纯静态站点，无数据迁移、无运行态切换：直接构建部署即可；回滚即回退上一版构建产物。示例文章（tech/journal 分类）随本轮加入，用于验证分页/分类/标签/专栏。

## Open Questions

- 每页文章数固定 10，是否需要进 i18n/配置？（可延后，先常量）
- 专栏页在专栏文章数超过一页时是否分页？（先不分页，观察内容量再定）
