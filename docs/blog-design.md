# 博客设计与实现说明

本文记录博客（Astro）的原型设计决策与实现方式，供后续开发参考。

## 技术栈

- **框架**：Astro 7（静态站，SSG 预渲染）
- **样式**：Tailwind CSS v4（CSS-first 配置）+ 设计令牌（`src/styles/tokens.css`，唯一事实源）
- **内容**：Astro Content Collections（`src/content/posts/`，markdown + frontmatter）
- **正文能力**：GFM（任务列表/删除线/自动链接）、KaTeX 数学公式、Mermaid 图、Shiki 双主题代码高亮
- **多语言**：`src/i18n.ts` 语言表 8 种，当前 3 个活跃（`zh` / `zh-Hant` / `en`，有文章）；活跃机制见 `src/lib/active-langs.ts`（下文「多语言与国际化」）
- **字体**：antd v5 字族（`--font-sans`，见 `src/styles/tokens.css`）

## 目录结构

```
src/
├── components/     # 站点级组件(Header/Footer/Toc/LangSwitcher/主题切换/PostCard/Pagination/VideoEmbed)
├── content/        # posts 文章集合(8 语言子目录,仅 zh/zh-Hant/en 有文章) 与 about 集合(8 语言各一)
├── layouts/        # BaseLayout(列表/404) 与 MarkdownPostLayout(文章页)
├── lib/            # active-langs(活跃语言)/ pagination(分页)/ site(站点配置)/ time(日期)/ cdn.mjs(CDN)
├── pages/          # 路由(语言子路径 + 分类/专栏/标签/关于/分页 + 根协商页 + rss / robots / sitemap)
├── plugins/        # rehype 插件(标题锚点、图片布局、任务列表、Mermaid 构建期渲染等)
├── scripts/        # 客户端脚本(目录交互 / 表格 hover / 时间本地化)
├── styles/         # 全局样式模块(tokens/base/global/article/layout/mermaid/mermaid-palette)
├── content.config.ts  # 内容集合 schema(posts + about)
└── i18n.ts         # 语言表(8 语言)与站级文案
```

## 多语言与国际化

### 语言表（单一来源）

- `src/i18n.ts` 的 `languages` 数组定义 8 种语言：`zh` / `zh-Hant` / `en` / `es` / `ja` / `ko` / `ru` / `ar`，URL 前缀统一小写（`langPath` 取 code 小写）：`/zh/`、`/zh-hant/`、`/en/`、`/es/`、`/ja/`、`/ko/`、`/ru/`、`/ar/`
- **活跃语言** = posts 集合里有文章的语言 + 保底 `["zh","en"]`（`src/lib/active-langs.ts` 的 `FALLBACK_LANGS`）。当前仅 `zh` / `zh-Hant` / `en` 活跃（均有文章）；无文章的语言整站不渲染（`/[lang]/` 下所有页面 404），根路径跳转与语言切换器也不列它；该语言一旦有文章即自动启用
- `languages` 数组是语言事实的唯一来源，每项含 `code / shortLabel / label / htmlLang / family`：
  - `shortLabel`：语言切换器按钮文案（简/繁/EN）
  - `htmlLang`：`<html lang>` 属性值（zh-CN/zh-Hant/en）
  - `family`：根路径语言族协商依据；简体/繁体是 zh 家族内的特判，其余语言族走通用前缀匹配
- 新增语言 = `languages` 加一行 + 补齐 `messages` 站级文案 + 提供 `src/content/posts/<code>/` 文章（有文章才会成为活跃语言）
- 辅助函数：`langPath`（code → 小写 URL 段）、`codeFromPath`（URL 段 → code，缺省回 zh）、`langFromPath` / `stripLangPrefix`（路由解析）、`intlLocale`（日期/数字 locale：zh→zh-CN、zh-Hant→zh-Hant、en→en-US）、`t`（站级文案取词）

### URL 方案与根路径协商

- 默认语言 zh 也带前缀（`prefixDefaultLocale: true`）；`redirectToDefaultLocale: false`——根路径 `/` 不交给 i18n 中间件（否则会被普通 302 重定向模板接管），由本站协商页处理
- 根路径协商页（`src/pages/index.astro`，不套 BaseLayout、无样式）：
  - `meta refresh` 1 秒保底跳兜底路径（英文优先，`/en/`；无 JS 可用）
  - 内联 JS 按浏览器语言协商：`zh-TW / zh-HK / zh-MO / zh-Hant` → `/zh-hant/`，其他 `zh` → `/zh/`，其余活跃语言族按前缀匹配，未提供语言 → 兜底 `/en/`（兜底 = `activeLangs` 中优先 `en`，否则第一个活跃语言）
  - `noindex` + canonical 指向兜底路径（`/en/`），仅保留透明化无样式页面与极淡兜底链接

### 内容组织与语言切换

- 文章按语言子目录存放：`src/content/posts/{zh,zh-Hant,en}/`（另有 es/ja/ko/ru/ar 空目录）；frontmatter `lang` 由语言表派生的枚举校验（`content.config.ts` 的 `z.enum`），须与所在目录一致
- 文章页语言切换按 **slug 平行匹配**：`src/pages/[lang]/posts/[slug].astro` 的 `getStaticPaths` 先按 slug 汇总已发布语言（`availableBySlug`），同名 slug 的语言间互切精确文章；目标语言缺该文章时回退该语言首页（绝不落 404）

### 内容维度:分类 / 专栏 / 标签 / 分页

- **分类** `category`：仅 `programmer`（程序员，`src/taxonomy.ts` 的 `categoryLabels` 唯一 key，默认 `programmer`；加分类只需补 key + 8 语言文案）；分类页 `/zh/category/<category>/` 按分类过滤当前语言文章；分类索引 `/zh/category/` 由映射表驱动列出各分类及文章数
- **专栏** `series`：文章可带 `series`（专栏 id，标题由 `seriesLabels` 映射表按语言提供，frontmatter 无 `seriesTitle` 字段）；专栏页 `/zh/series/<id>/` 聚合同 series 文章并按发布时间**正序**（旧→新）排列，不分页；专栏索引 `/zh/series/` 列出全部专栏及篇数
- **标签** `tags`：`tags` 为 `src/taxonomy.ts` 的 `tagLabels` 中定义的英文 key（跨语言聚合、URL 稳定，显示名按当前语言翻译）；索引页 `/zh/tags/` 列出当前语言全部标签并计数（按计数降序）；标签文章页 `/zh/tags/<tag>/` 按标签过滤（URL 经 `encodeURIComponent` 编码）
- **分页**：列表页（文章/分类/标签）每页 10 篇（`src/lib/pagination.ts` 的 `PAGE_SIZE`）。**Astro 7 的分页约定**：`paginate()` 要求文件路径含 `[page]`/`[...page]` 参数，故采用「索引页静态渲染第 1 页 + `page/[...page]` 生成第 2 页起」的结构，URL 形如 `/zh/posts/` + `/zh/posts/page/2/`、`/zh/category/programmer/page/2/`；索引页用 `firstPage()` helper 构造分页对象。`Pagination` 组件在 currentPage=2 时用 `firstPageUrl` 覆盖 Astro 生成的错误 prev 链接（`[...page]` 空 rest 会产出 `/zh/page` 而非 `/zh/`）
- 聚合页全部按当前语言过滤（各语言隔离），仅当某语言有对应内容时才生成对应页面

### 关于页与主页

- **about 集合**：`src/content/about/` 下 8 语言各一（`{zh,zh-Hant,en,es,ja,ko,ru,ar}.md`，id 即语言码），frontmatter 存结构化字段（`intro` 简介、`facts` 基本信息（label/value 列表）、`skills` 技术能力（带 `level` 1-10）、`interests` 喜好（带 `level` 1-10）、`timeline` 经历时间线（`period`/`title`/`org`/`desc`，倒序最新在前），另 `title`/`lang` 必填、`image` 题图可选），正文 markdown 写长介绍；「联系我」区块（GitHub/Email）由 `AboutSocials` 组件渲染，数据来自站点配置（`SITE.githubUrl`），非 frontmatter 字段；`/[lang]/about/` 仅渲染活跃语言条目
- **主页**（`/zh/`）：头像 hero（`src/assets/avatar.png`，经 `astro:assets` 的 `Image` 组件处理，圆形头像 + `heroTitle`/`heroSlogan`/`heroSubtitle`/`heroNote` + 关于/GitHub/Email 链接按钮）+ **最新文章精选**（前 5 篇）；无文章时显示回退占位（`writingPlaceholder`），避免空白。首页不承载分页（全部文章见 `/posts/`）；页面底部为**可扩展内容分区**结构——后续相册/播客/漫画等栏目作为新 `<section>` 追加

### SEO

- 每个页面（含文章页）输出 `canonical` + `hreflang`：hreflang 只列**活跃语言**（`getActiveLangs`，当前 zh/zh-Hant/en），不再为 es/ja/ko/ru/ar 生成指向 404 的 alternate 链接（`BaseLayout` 与 `PostSeoHead` 都只遍历活跃语言）；文章页 alternate 的 href 按平行 slug 映射（目标语言缺对应文章时回退该语言首页）；`x-default` 指向 `/zh/`
- 手写 sitemap（`src/pages/sitemap.xml.ts`）：活跃语言首页（当前 3 个）+ 文章列表页（含分页）+ 分类索引与分类页（含分页，分类取自 `categoryLabels`）+ 专栏索引与专栏页 + 标签索引与标签文章页（含分页）+ 关于页 + 全部文章（`lastmod` 取 `pubDate`），排除根路径 `/`
- `noindex`：根路径协商页（内联 meta）、404 页（`BaseLayout` 的 `noindex` prop）

### 体验

- View Transitions：两个布局均引入 `<ClientRouter />`（`astro:transitions`），全站页面切换平滑过渡；`base.css` 用 SPA 式 root 过渡（旧页 90ms 淡出 + 新页 180ms 淡入、无位移，`prefers-reduced-motion` 下禁用）；原生滚动条隐藏（`scrollbar-width: none`）+ `ScrollbarOverlay.astro` 浮层指示条（fixed、z-50、滚动时淡入淡出），列表长短切换时元素不左右跳动
- **导航条过渡策略**：header 整体作为独立 view-transition group（`.site-header-root`）**瞬时替换**（`animation: none`）——不参与 root 淡入淡出，导航时背景/边框/按钮单帧替换无闪烁；同语言页面间 header 内容相同 → 瞬换无感知；语言切换链接加 `data-astro-reload` 强制整页加载，SSR 按新语言完整重渲。footer 则用 `data-astro-transition-persist`（含主题按钮交互状态，DOM 保留更优）；**header/footer 全站复用同一组件**（`Header.astro`/`Footer.astro`，文章页 `MarkdownPostLayout` 同样引用；Header 支持可选 `targets` prop 供文章页透传平行文章链接）
- **语言切换器**（`LangSwitcher.astro`）：位于 persist 容器之外（上下文随页面 SSR 更新），以独立 `view-transition-name: lang-switcher` group 瞬时替换（不参与 root 淡入淡出，避免每次导航按钮闪烁）；原生 `<details>/<summary>` 实现，无 JS 也可展开，渐进增强点击外部收起
- **移动端目录**：文章页正文顶部折叠目录 `.post-toc-mobile`（sticky 定住 + `is-stuck` 实心 `--surface` 背景 + 阴影），`post-toc.js` 事件委托 + window 单次注册标记，View Transitions 导航后不重复绑定监听器
- **毛玻璃弃用（方案 A）**：导航条/目录吸顶/移动面板/回到顶部按钮全部实心 `var(--surface)` 背景，不依赖 `backdrop-filter` 与 `color-mix`——部分国产 WebView 声称支持 backdrop-filter（Chromium 76+）但不支持 color-mix（111+），半透明背景整条无效会直接透明，检测（@supports/JS 渲染探测）均不可靠，彻底实心一劳永逸
- **导航条**：logo 居左（`siteName` 单 span 单色文字，与导航链接同色 `--text-secondary`，仅加轻立体感——1px 无 blur 高光边 + 极小柔影（`--logo-shadow-hi/lo`，深浅主题色值在 tokens），hover 变主色并轻微放大；文章页手机端滚动过标题分割线后，logo 文字被文章标题替换）、导航五项（首页 / 文章（`/posts/`）/ 分类（`/category/`）/ 专栏（`/series/`）/ 关于）居右（persist 容器 `justify-between`），与右侧语言切换按钮间有 1px 分界线；导航链接容器 `overflow-x-auto`（窄屏可横向滚动；手机端导航收纳在 ⋮ 菜单内）
- **主题持久化**：`ThemeScript.astro`（head 内联）初始化读 localStorage 设 `data-theme`（light/dark/auto 三态）。auto 不是“无属性跟随系统”：部分国产 WebView 不报告 `prefers-color-scheme` 媒体查询，故 auto 用 JS `matchMedia` 显式检测系统深/浅并直接写 `data-theme`（matchMedia 不可用时回退无属性 + CSS 媒体查询兑底）；View Transitions 导航后 `astro:page-load` 重同步，且因 swap 会用新页 `<html>` 属性覆盖 `data-theme`（构建期无此属性），另加 `astro:after-swap` 在 DOM 替换后立即恢复，避免系统深色下闪黑夜
- **视频嵌入**：`VideoEmbed.astro` 由文章 frontmatter `video`（`bilibili`/`youtube` id）驱动，渲染在文章正文顶部（破格 L2）。单平台直接渲染静态 iframe；双平台由客户端脚本按 `navigator.language`/时区默认选平台（`localStorage` 记忆手动选择优先），无 JS 时降级为两个平台文字链接

## 布局设计

### 纸片（文章卡）

- 文章内容是一张"纸片"（暖纸底 `--article-bg` + 发丝边框 + 柔和阴影），**全视口存在**
- **手机**（<640px）：纸片直角（无圆角）、满宽贴顶
- **平板**（640–1151px）：纸片直角、底部空隙 2em（顶部 1em 的 2 倍）
- **PC**（≥1152px）：纸片直角、底部空隙 2em（与平板一致）
- **桌面**（≥1152px）：三栏 `广告位 | 纸片 664px | 目录`，文章宽度固定不缩

### 内容宽度

- 纸片宽 `664px`，正文文字实际列宽 = `664 − 2×2em(32px) = 600px`（邮件常见宽度）
- 破格元素（图片/代码/表格/mermaid/hr）顶格到纸片边缘（L2），全视口无边框无圆角

### 代码块（语言块 vs 纯文本块）

- 仅真语言块（有 `data-language` 且非 plaintext）被 `CodeBlockActions` 组件包装为上下结构：顶部栏 + 滚动容器（行号列 + 代码）；plaintext/无语言块保持原样（无行号/角标/复制/行 hover）
- **所有代码块背景统一用 `--code-bg`**（不分语言块/plaintext），忽略 Shiki 主题自带背景（浅色内联底/`--shiki-dark-bg` 均不采用）；token 配色随主题（浅色 solarized-light / 深色 solarized-dark，经 `--shiki-dark` 切换）
- 顶部栏：语言名右对齐（右上角），常态低透明度水印，悬停代码块时实体化，点击即复制（手形光标，复制后短暂变行动色）；无额外复制按钮；顶部栏高 0.75rem 且语言名下沉贴近代码（不贴顶线、不低过第一行垂直中线）
- 行号列有独立底色（`--code-gutter-bg`，与代码底相近略深）且全高，色带与分割线从块顶贯穿到底（顶部栏左侧同样铺行号底色，分割线由 `::before` 伪元素提供、叠在行号底色上与行号列 `border-inline-end` 观感一致）；`position: sticky` 钉在滚动容器左缘——横向滚动时行号不跟动，滚动条横贯整个块（含行号列下方），滚出视口的代码被直接裁剪不可见
- 行号替代代码块左内边距，代码与行号列分隔线保留 `0.833rem` 边距（hover 条覆盖该边距区）；行号数字距分隔线 0.25rem，hover 高亮覆盖整个行号列（到分隔线）
- 行 hover 显示整行强调条（`--code-line-hover`），代码行与行号列对应行 JS 联动同步高亮（单一高亮，移出即还原）；行块级化由 JS 移除行间换行文本节点避免空行，空行用 `min-height` 保底对齐
- **hover 整行覆盖到块右缘**：`pre` 在滚动容器内 `flex:1 1 auto`（短行撑满容器剩余宽）+ `min-width:max-content`（长行撑开横向滚动）；`code` 块级化（行盒包含块宽 = pre 宽而非最长行内容宽）；清掉 Shiki 内联 `pre` 右 padding（否则行盒停在右内边距处盖不满右缘）；`line` 保留 `padding-inline:0.833rem`（内容距行盒右缘留白，滚动到底仍可读）

### Mermaid（构建期渲染·单 SVG + 双色板）

- ` ```mermaid ` 代码块在**构建期**由无头 Chromium + js-mermaid 以 **base 主题**渲染成**一份**静态 SVG 内嵌页面（`src/plugins/rehype-mermaid-ssr.mjs`），客户端零 mermaid 运行时下载、无实时渲染等待
- **配色 = redux 官方双主题，CSS 覆盖而非双 SVG**：色板取自 mermaid 官方 `redux-color`（白天）/ `redux-dark-color`（黑夜）主题的实际渲染色，自动生成于 `src/styles/mermaid-palette.css`（脚本 `scripts/extract-mermaid-palette.mjs`）；`mermaid.css` 用类选择器把 svg 颜色覆盖为 `--mmd-*` 变量，深浅主题靠 `data-theme` 切换变量即换配色——**同一份 svg 自动自适应，HTML 体积减半（单页约 99KB）、切换纯 CSS 零 JS**
- **时序 actor 多彩色轮**：redux 官方时序参与者按色轮分配不同颜色（橙/青/紫…，最多 8 色）。构建期插件按 actor `name` 给每个 `rect.actor` 编 `data-mmd-actor` 序号（同一 actor 的 top/bottom 同号），`mermaid.css` 按 `[data-mmd-actor="N"]` 覆盖为色轮变量 `--mmd-actorN*`——还原官方多彩 actor，而非统一单色
- **边标签（flowchart 分支标签）底色**：svg 内联 style 块里 base 主题写死淡紫粉（`rgb(244,221,255)`），`mermaid.css` 需连 `.labelBkg`/`.edgeLabel span`/`p` 一起覆盖为 `--mmd-edgeLabelBkg` 底 + `--mmd-nodeText` 文字（官方 redux 为浅灰/深灰底 + 强对比文字）
- **为什么用真实浏览器**：mermaid 渲染强依赖 SVG 测量（`getBBox`/`getComputedTextLength`），jsdom/happy-dom/svgdom 等纯 JS DOM 均缺失（实测渲染出空 SVG 或抛错）
- **为什么用 js-mermaid 而非 mermaid-rs**（`satteri-mermaid` 实测后否决）：mermaid-rs 的 `themeOverrides` 传 CSS 变量进不了 svg（颜色写死）、节点无类名，无法做 CSS 覆盖；且无官方 redux 双色板
- 渲染在 Astro rehype 阶段（Shiki 之后）进行，匹配 `pre[data-language="mermaid"]`；浏览器与本地静态服务均为模块级单例（懒启动、进程退出自动关闭）；字体栈经 `themeVariables.fontFamily` 写进 svg 的 style 块（`var(--font-sans)` 由用户浏览器解析，与正文观感一致）；svg 无背景矩形 → 背景透明、纸片色即底色
- 渲染失败保留源码块（至少源码可见）；构建依赖：`playwright`（devDependency）。CI 需 `pnpm exec playwright install --with-deps chromium`（系统依赖自动 apt），`actions/cache` 缓存 `~/.cache/ms-playwright`；**构建机需装 CJK 字体**（本机 `~/.local/share/fonts` 装 WQY 微米黑）保证中文标签宽度测量准确
- 换配色 = 重跑 `node scripts/extract-mermaid-palette.mjs` 改 `--mmd-*` 色板（或直接改 `mermaid-palette.css`）

### 标题与锚点

- h2 全宽定格，分割线为**两端渐隐的发丝线**，文字左右缩进 0.5em
- h3/h4 保持 0.5em 左缩进
- **正文 h1-h6 全部生成锚点**（悬停时左侧浮现 `#` 链接，纸张之外 5px，`src/plugins/rehype-heading-anchors.mjs` 注入）；**文章主标题**（layout 的 `h1#post-title`）不生成锚点
- **锚点 id 为 6 位纯小写字母**（字符集 `abcdefghjkmnpqrstuvwxyz`，去掉易混淆的 i/l/o；无数字），由文章内标题序号经「双射仿射变换」得出——序号仍从 1 自上而下递增，展示为看似随机的 6 位串；种子 = 文章 slug（源文件名去扩展名，跨语言一致）→ 同文章不同语言锚点完全一致，构建重建稳定，双射保证同文内零碰撞
- **sr-only 标题**（remark-gfm 脚注自动生成的 `h2`「Footnotes」等）不生成锚点、不分配正规模 id，目录按 `^[abcdefghjkmnpqrstuvwxyz]{6}$` 正则排除

### 目录（起始级别与锚点收录）

- **起始级别动态**：正文有 `h1` 目录从 `h1` 开始；无 `h1` 有 `h2` 则从 `h2`；两者都没有则不展示目录（`data-has-toc` 一并移除）；两级树：起始级别为顶层、下一级嵌套其下
- 只收录插件分配的 6 位纯小写字母锚点 id 的标题（自动排除 sr-only 脚注标题等）

### 目录

| 视口 | 形态 |
|---|---|
| 手机 <640px | 导航条"目录"按钮 → 实心下拉面板 |
| 平板 640–1151px | 正文内折叠目录，滚动吸顶（实心表面，≥665px 距导航条 1em） |
| 桌面 ≥1152px | 右侧 sticky 目录（有题图时与标题顶部对齐） |

### 主题

- 三态切换：白天 / 黑夜 / 自动（`data-theme` 属性 + localStorage 持久化）
- `ThemeScript.astro` 在 `<head>` 首帧前应用主题，避免闪烁；并监听 `astro:page-load` 与 `astro:after-swap`——前者在导航完成后重新 `setState`（读 localStorage）+ 同步按钮显示，后者在 swap 用新页 `<html>` 属性覆盖 `data-theme`（构建期无此属性）后立即恢复，避免系统深色下闪黑夜
- **按钮位置**：主题切换按钮在页面**底部**（`Footer.astro`，居中）；三态图标 sun（白天）/ moon（黑夜）/ sun-moon（自动），由按钮 `data-theme-state` 属性驱动 CSS 切换（`is:global` 样式，不依赖 scoped 编译），大小/颜色与同行版权文字一致，悬停 tooltip 显示当前状态；页脚另含版权声明 `© {构建年份} {copyrightName}`（名称 i18n 变量 8 语言）
- 深色模式由 `tokens.css` 的令牌翻转驱动（含手动 `data-theme` 守卫）

### 图片

- 题图顶到纸片最外缘（覆盖 1px 边框），底部渐隐融入纸面；默认隐藏、onload 后才显示（消除加载失败/慢时的空白占位闪烁），失败时 onerror 静默隐藏并同步移除 grid 的 `has-hero`（避免裂图占位与桌面目录错位）；无题图时标题距纸张顶 = `--hero-gap`（与有题图时题图底距标题一致）
- 正文图片/题图不可选中（`user-select: none`）、不可拖拽（`draggable="false"`）
- **图片布局机制**（`rehype-image-layout` 插件，自动归类 + URL 后缀约定，后缀解析后从 src 剥离）：
  - 无后缀：纯图片段落（段落内只有图片/链接图、无文字混排）——单图自动加 `image-figure` 顶格大图（破格 grid-column 1/-1、铺满宽度）；连续多图自动加 `image-row` 并排画廊（flex 一行、等分铺满、破格）；行内混排图片（带文字）自动加 `image-inline` 行内小图（原尺寸不拉满）。图片一律直角方形（无圆角）
  - `#small` 强制小图（独立段居中显示）；`#wide` 强制大图（任意位置铺满）
  - `#left` / `#right` 浮动图文（图靠左/右，文字环绕，应写在文字段内）
  - `#pair` 图文并排对：插件把图段与紧邻下一段文字包进 `<div class="image-pair">`（flex 一行，图左文右，窄屏自动换行堆叠，**列内显示不顶格**）
  - `#row` 多图并排画廊：同一段内写多个 `#row` 图，`p:has(> img.image-row)` flex 一排
  - 手写 HTML `<img>` 不干预（作者自带属性控制）；示例见 `bak/en/Full-Markdown.md` 的 Image Layout 小节

### 页面附件

- 浮动返回顶部：文章页右下角方形小按钮（`BackToTop.astro`，fixed z-40），滚动超过 300px 才显示，点击 smooth 回顶（尊重 reduced-motion）；事件委托 + 单次注册，View Transitions 导航安全
- 语言切换按钮：Lucide languages（文A）图标 + 下拉箭头；图标内嵌于 `src/components/icons/`（ISC 许可），后续可平滑接 lucide-astro

### 目录（分端形态）

| 断点 | 形态 |
|---|---|
| <640px（手机） | 右侧功能区：≡ 目录按钮（仅文章页）+ ⋮ 工具横条——第一行收纳全部导航按钮，第二行语言切换（与平板/桌面同一 `LangSwitcher` 组件，三端一致）；折叠态无分界线；目录链接点击后自动收起 |
| 640-1151px（平板） | 正文顶部折叠目录：吸顶留隙 1em，展开时内容 absolute 浮层覆盖（不顶开文章，点外部/点链接后收起）；吸顶定住实心 `--surface` 背景 + 阴影，浮层用纸片色（`--article-bg`） |
| ≥1152px（桌面） | 右栏 sticky TOC（有题图时与标题顶部对齐） |

## 响应式断点

| 断点 | 说明 |
|---|---|
| ≤664px | 纸张贴边（视口不够 664px 纸宽）：四边无边框、无圆角、无阴影（底色保留）、顶部贴导航条；文章页中间区域（main）背景改用纸片色（--article-bg），短文章下方与纸片无缝衔接 |
| >665px | 纸片两侧出现空隙：恢复边框/阴影、留白 3rem、顶部空 1em、底部空 2em（顶部 2 倍）、无圆角；目录吸顶距导航条 1em（全部在同一点切换，与纸宽 664px 对齐） |
| ≥1152px | 桌面三栏：目录/文章/广告 |

## 约定

- 写文章：在 `src/content/posts/<lang>/` 放 markdown（8 语言子目录，仅 zh/zh-Hant/en 有文章），frontmatter 含 `title/pubDate/description/tags/lang/image/category/series/video`（另 `slug`/`updated`/`excerpt` 可选）；`lang` 由语言表派生校验，文章页语言切换按 slug 平行匹配（见「多语言与国际化」）。`category` 默认 `programmer`；`video` 形如 `{ bilibili: "BVxxx", youtube: "id" }`（至少一个）；description 含半角冒号+空格时需用引号包裹（YAML 解析）
- 写关于页：在 `src/content/about/<lang>.md` 维护（frontmatter 结构化字段 + 正文 markdown）
- 设计令牌改动：直接改本仓库 `src/styles/tokens.css`（唯一事实源，无外部仓库）
- 开发流程：见 README（本地开发/构建）与 OpenSpec（本仓库 `openspec/`）
