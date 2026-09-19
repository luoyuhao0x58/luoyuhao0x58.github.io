## 1. 内容模型与数据

- [x] 1.1 扩展 `src/content.config.ts` blog schema：新增 `category`（`tech`/`journal`，默认 `tech`）、`series`（可选）、`video`（`{ bilibili?, youtube? }`，可选）——验证：`pnpm build` 通过，frontmatter 校验生效
- [x] 1.2 新增 `about` 内容集合 schema（三语子目录、frontmatter 结构化字段：标题/简介/技术能力/喜好/社交账号/豆瓣入口，正文 markdown）——验证：`pnpm build` 通过，lang 由语言表派生校验
- [x] 1.3 补充 tech/journal 分类示例文章：覆盖 3+ 篇一页（验证分页）、多标签、同 series 多篇（验证专栏）、1 篇带 video 字段（验证嵌入）——验证：`pnpm build` 后文章可在对应分类/标签/专栏聚合

## 2. 内容组织页面

- [x] 2.1 抽取公共文章卡组件与分页导航组件（含 aria-label、上一页/下一页链接）——验证：三处列表复用，构建后 HTML 含静态分页链接
- [x] 2.2 首页分页改造：`[lang]/index.astro` 用 `paginate()` 生成 `/zh/` 与 `/zh/page/2/`，每页 10 篇——验证：`dist/zh/page/2/` 存在且内容为第 2 页文章
- [x] 2.3 分类页 `[lang]/category/[category]/index.astro`：按分类过滤当前语言文章 + 分页——验证：`dist/zh/category/tech/` 仅含 tech 文章；空分类返回空状态而非 404
- [x] 2.4 专栏页 `[lang]/series/[name]/index.astro`：同 series 聚合、按 `pubDate` 升序、不分页——验证：`dist/zh/series/<id>/` 文章顺序为旧→新
- [x] 2.5 标签索引页 `[lang]/tags/index.astro`：当前语言全标签 + 文章计数——验证：页面列出标签与计数，与文章数据一致
- [x] 2.6 标签文章页 `[lang]/tags/[tag]/index.astro`：按标签过滤 + 分页——验证：`dist/zh/tags/<tag>/` 仅含该标签文章，无匹配时空状态
- [x] 2.7 聚合页三语核对：分类/专栏/标签/分页首页三种语言全部生成、内容按语言隔离——验证：`dist/en/...`、`dist/zh-hant/...` 对应语言聚合存在
- [x] 2.8 sitemap 更新：`src/pages/sitemap.xml.ts` 纳入分类/标签/关于页与分页 URL——验证：构建后 `dist/sitemap.xml` 含新 URL

## 3. 个人站页面

- [x] 3.1 关于页 `[lang]/about/index.astro`：渲染 about 集合对应语言条目（简介/能力/喜好/社交账号/豆瓣入口/正文）——验证：三种语言 about 页内容正确
- [x] 3.2 主页改版：hero 简介区 + 最新文章列表 + 内容类型入口导航（分类入口指向分类页）——验证：`/zh/` 依次展示 hero、最新文章、内容入口；空类型入口不 404

## 4. 视频嵌入

- [x] 4.1 `VideoEmbed.astro` 单平台嵌入：仅 bilibili 或仅 youtube 时渲染对应 iframe——验证：文章页出现对应平台 iframe
- [x] 4.2 双平台分流：客户端按 `navigator.language`/时区默认选平台 + 切换按钮 + `localStorage` 记忆手动选择——验证：改语言/时区后默认平台不同；手动切换后刷新保持
- [x] 4.3 无 JS 回退：双平台时始终渲染两个平台文字链接——验证：禁用 JS 后页面无 iframe 但有 B站/YouTube 可点链接

## 5. 站级控件

- [x] 5.1 主题持久化修复：`ThemeScript.astro` 增加 `astro:page-load` 监听，导航后重新 `setState`（读 localStorage）+ `updateButton`——验证：点"黑夜"后连翻 3 篇文章主题始终黑夜、按钮显示"黑夜"；刷新保持
- [x] 5.2 主题按钮迁移：`Header.astro` 移除、`Footer.astro` 加入 `<ThemeToggle>`——验证：底部可见按钮、顶部无按钮、`#theme-toggle` 逻辑不受影响
- [x] 5.3 语言下拉：`LangSwitcher.astro` 改为 `<details>/<summary>` 下拉（summary 显示当前语言，展开列三语链接，`aria-current` 标记当前），渐进增强点击外部收起——验证：无 JS 时可展开并切换语言；导航不占多行

## 6. 无障碍与无 JS 回退核对

- [x] 6.1 新页面无障碍核对：聚合页/分页/下拉/视频控件补 aria 标注，键盘可操作（Tab/Enter/方向键）——验证：无鼠标仅键盘可完成浏览与切换
- [x] 6.2 无 JS 全站核对：禁用 JS 后首页/分类/专栏/标签/关于/文章/语言切换全部可用——验证：浏览器禁用 JS 走查 + 构建产物静态链接抽查

## 7. 验证与文档

- [x] 7.1 全量校验：`pnpm lint` 与 `pnpm build` 零错误，构建产物 `dist/` 生成完整——验证：两条命令退出码为 0
- [x] 7.2 更新 `docs/blog-design.md`：新增路由/组件（VideoEmbed/语言下拉）、主题持久化与按钮位置、关于页与主页说明——验证：文档与实现一致

## 8. 验收反馈修复

- [x] 8.1 修复分页"上一页"404：`Pagination` 组件在 currentPage=2 时用 `firstPageUrl` 覆盖 Astro 7 `[...page]` 空 rest 生成的错误 prev 链接——验证：`dist/zh/page/2/` 的上一页 href 为 `/zh/` 而非 `/zh/page`
- [x] 8.2 导航条扩展：新增 `/posts/` 文章列表（含分页）、`/category/` 分类索引、`/series/` 专栏索引，导航改为首页/文章/分类/专栏/关于五项（移动端横向滚动）；sitemap 同步纳入——验证：三语言新页面生成，导航 5 项链接存在
- [x] 8.3 列表页打开文章动画优化：`base.css` 自定义 view transition 动画（淡出+上移淡入，尊重 prefers-reduced-motion），footer 加 `data-astro-transition-persist` 跨页稳定——验证：编译产物 CSS 含动画，HTML 含 persist 属性

## 9. 首页改版

- [x] 9.1 首页改为头像 hero + 精选文章：`public/avatar.png` 圆形头像 + 名字/一句话 + about 集合社交链接 + 分类入口，最新文章精选前 5 篇——验证：`dist/zh/index.html` 含头像引用与精选 5 篇
- [x] 9.2 无内容回退：文章为空时首页显示 `writingPlaceholder` 占位 + 关于入口，文章列表页显示空状态——验证：临时移走 en 文章构建，en 首页出现回退文案与 about 链接
- [x] 9.3 可扩展分区结构：首页底部为可追加的内容分区（后续相册/播客/漫画作为新 section）；移除首页分页路由（`[lang]/page/[...page].astro`），全部文章由 `/posts/` 承担，sitemap 同步——验证：构建 103 页，`/zh/page/2/` 不再生成，`/zh/posts/page/2/` 保留

## 10. 导航/主题/动画验收修复(二轮)

- [x] 10.1 主题导航跳变修复：View Transitions swap 会用新页 `<html>` 属性覆盖 documentElement（构建期无 `data-theme`），系统深色时闪黑夜——`ThemeScript` 增加 `astro:after-swap` 在 DOM 替换后立即从 localStorage 恢复主题与按钮——验证：`dist/zh/index.html` 含 after-swap 监听
- [x] 10.2 语言下拉被裁切修复：Main nav 的 `overflow-x-auto` 会裁切 absolute 下拉——`Header`/`MarkdownPostLayout` 内嵌 header 将 `LangSwitcher` 移出滚动容器——验证：产物中 lang-switcher 不在 Main nav 内，overflow-x-auto 保留于链接区
- [x] 10.3 页面切换闪烁优化：root 过渡改 SPA 式（旧页 90ms 淡出 + 新页 180ms 淡入、无 translateY）——验证：编译 CSS 为 `90ms both vt-fade-out` / `.18s ease-out both vt-fade-in`，translateY 已移除，reduced-motion 保留

## 11. 导航条闪烁根治(三轮)

- [x] 11.1 header persist：`Header.astro` 与文章页内嵌 header 的内容容器加 `data-astro-transition-persist="site-header"`，普通导航不替换——验证：首页与文章页产物均含 site-header persist，两处 persist 容器 DOM 完全一致（python 比对）
- [x] 11.2 统一 header 结构：移除文章页 header 的移动端目录按钮（toc-btn）与 `mobile-toc-panel`（它造成两处 header 结构不一致、导航后位置跳动），移动端目录改用正文顶部折叠 `.post-toc-mobile`（取消移动端隐藏规则）——验证：产物无 toc-nav-btn/mobile-toc-panel，`.post-toc-mobile` 保留
- [x] 11.3 LangSwitcher 独立过渡：语言下拉移出 persist 容器（上下文随页面 SSR 更新），`view-transition-name: lang-switcher` 独立 group 瞬时替换，不参与 root 淡入淡出——验证：编译 CSS 含 lang-switcher group 规则，容器外无 lang-switcher
- [x] 11.4 语言切换整页加载：`LangSwitcher` 链接加 `data-astro-reload`，persist 的 header/footer 语言文字随 SSR 完整更新，不残留旧语言——验证：产物语言链接含 data-astro-reload
- [x] 11.5 `post-toc.js` 防监听器累积：改为事件委托 + window 单次注册标记，View Transitions 导航后模块脚本重跑不重复绑定——验证：产物 inline module 含 `__postTocBound__` 守卫

## 12. 滚动条占位修复

- [x] 12.1 ~~`html { scrollbar-gutter: stable }`~~ 改为浮层方案（用户反馈 stable 会让导航/底部线条被 gutter 截断，已还原）：隐藏原生滚动条（`scrollbar-width: none` + `::-webkit-scrollbar` 兼容）+ `ScrollbarOverlay.astro` 自绘 fixed 浮层指示条（z-50 层在内容之上、pointer-events:none、滚动时淡入/停止淡出、跟随主题令牌、persist + window 单次注册防导航累积监听）——验证：产物含 `scrollbar-width:none`、指示条 persist 于两布局、`__scrollIndicatorBound__` 守卫、thumb 用 `--text-muted` 主题令牌
- [x] 12.2 导航布局回调：persist 容器改 `justify-between`（logo 左、导航按钮右），导航与语言切换之间加 1px 分界线（`h-4 w-px bg-border`），两布局同步——验证：产物 nav 无 flex-1、persist 容器首页与文章页逐字一致、分界线在 lang-switcher 前

## 13. 页脚/浮动按钮/图标与纸张断点(四轮)

- [x] 13.1 页脚精简：去掉域名展示与返回顶部链接，仅保留主题按钮（居中）——验证：footer 产物无 <p> 域名、无 #top，theme-toggle 保留且 persist
- [x] 13.2 浮动返回顶部（文章页）：`BackToTop.astro` fixed 右下方形按钮（h-10 w-10、z-40），滚动 >300px 才显示，点击 smooth 回顶（尊重 reduced-motion），委托 + 单次注册——验证：仅文章页渲染，首页无；产物含 is-visible 守卫
- [x] 13.3 主题按钮纯图标化：去文字，加 cursor-pointer 与悬停 tooltip（复用 data-theme-label 由 ThemeScript 动态更新）——验证：产物含 role="tooltip"/cursor-pointer
- [x] 13.4 语言按钮图标："简"字换 Lucide languages（文A）图标（内嵌 SVG，`src/components/icons/` 目录模式，后续可平滑接 lucide-astro）——验证：产物含 languages path
- [x] 13.5 题图容错：img 加 onerror 静默隐藏题图容器并移除 grid 的 has-hero（避免裂图与目录错位）——验证：文章页 img 含 onerror
- [x] 13.6 纸张断点对齐：圆角/边框/阴影/顶部留白统一在 665px（视口 >664 才有空隙）切换；贴边时四边无边框、无阴影、圆角消失、底色保留；删除原 640/680 错位断点；题图 Tailwind rounded-lg 改由 CSS 统一控制——验证：编译 CSS `.post-article` 贴边为 border:none/box-shadow:none，665px 断点恢复全部纸片样式，无 640/680 断点
- [x] 13.7 消除 header/footer 模板重复（根因：文章页布局内嵌了一份独立 header/footer，改组件不生效）：`MarkdownPostLayout` 改为复用 `Header.astro`/`Footer.astro` 组件（Header 增加可选 targets prop 透传平行文章链接），删除内嵌模板——验证：首页与文章页 footer 产物完全一致、header persist 容器一致、文章页语言下拉含平行文章 targets、文章页无域名/返回顶部

## 14. 主题图标/版权/题图占位/目录形态(五轮)

- [x] 14.1 主题按钮换 Lucide contrast（半黑半白）固定图标，当前状态由 tooltip 显示；页脚加版权声明（`© {构建年份} {copyrightName}`，名称 i18n 变量三语）——验证：产物含 contrast path 与 © 年份 羽皓
- [x] 14.2 题图占位闪烁根治：容器默认 hidden，img onload 后才显示（失败时 onerror 保持隐藏 + 移除 has-hero），加载失败/慢不再出现空白占位；无题图时标题距纸张顶 = --hero-gap（`.post-grid:not(.has-hero) .post-article`，与题图底距标题一致，onerror 移除 has-hero 后实时响应）——验证：产物含 post-hero hidden + onload；CSS 含 :not(.has-hero) 规则
- [x] 14.3 目录形态分端：手机（<640px）恢复导航条"目录"按钮 + fixed 浮动覆盖面板（Header 组件统一渲染 toc-btn，CSS `body[data-has-toc]`+<640px 显隐，persist 安全）；平板（640-1151px）折叠目录，展开时 toc-body absolute 浮层覆盖不顶开文章，点击外部自动收起；桌面（≥1152px）右栏 sticky TOC 不变——验证：CSS 含显隐规则/toc-body 浮层/手机隐藏折叠目录；面板 div 仅文章页
- [x] 14.4 目录颜色统一：is-stuck 吸顶背景由 surface 改 --article-bg（纸片色）系，与未吸顶（透明透纸片）视觉一致，消除滚动时深浅跳变；吸顶间隙 1em 与纸片一致（665px 断点既有规则）——验证：CSS is-stuck 为 article-bg 92%；post-toc.js 恢复按钮逻辑（委托+单次注册）

## 15. 手机导航收纳与目录收起(六轮)

- [x] 15.1 目录入口图标化并移至 logo 左侧：`toc-nav-btn` 文字换 Lucide list 目录图标（aria-label 保留无障碍名），位置从右侧功能区移入 persist 容器内 logo 之前；显隐规则不变（<640px 且 body[data-has-toc]）——验证：产物按钮含 List path 且位于 logo 之前，两页 DOM 一致
- [x] 15.2 手机端语言切换收纳为竖三点：`LangSwitcher` summary 双图标响应式（<640px 显示 MoreVertical ⋮、隐藏文A与▾；≥640px 相反），下拉列表不变——验证：产物含双图标，CSS width<=639px 切换规则
- [x] 15.3 目录跳转后自动收起：post-toc.js 委托增加——手机面板内链接点击后移除 is-open + aria 复位，平板 toc-body 内链接点击后 removeAttribute(open)——验证：产物内联脚本含两段收起逻辑

## 16. 手机导航细化与主题三态图标(七轮)

- [x] 16.1 手机目录按钮贴边：`.toc-nav-btn { margin-left: -1rem }` 抵消 header 容器 px-4，点击区顶到视口边线（图标距边 8px）——验证：CSS 含 margin-left:-1rem
- [x] 16.2 主题按钮三态图标：白天（Lucide sun）/黑夜（moon）/自动（sun-moon），CSS 按钮 data-theme-state 属性切换（ThemeScript 已维护该属性，无需改 DOM）；图标 h-3.5 w-3.5 + text-text-muted 与同行版权文字一致；悬停 tooltip 保留——验证：产物三图标均在，CSS 三态规则，尺寸/颜色类名正确
- [x] 16.3 语言切换双形态重构（用户澄清：⋮ 仅手机，且语言收纳为二级子菜单）：`LangSwitcher` 同一 DOM 双形态——桌面/平板（≥640px）文A 图标直达三语下拉；手机（<640px）竖三点工具菜单，"语言选择"为嵌套 details 二级子菜单（再点一次才切语言），预留搜索等后续工具扩展位；语言链接抽 `LangLinks.astro` 两形态复用（含 data-astro-reload 与平行文章 targets）；点击外部收起含子菜单——验证：产物双形态结构/嵌套子菜单/6 个 data-astro-reload/平行链接正确，断点 CSS 切换

## 17. 手机导航收敛为 ⋮ 横条与 auto 图标修正(八轮)

- [x] 17.1 手机端导航收敛：用户反馈前双形态二级菜单过度设计——改为 ⋮ 点击弹出横条（header 下方铺满），收纳全部 5 个导航按钮 + 语言短标（当前项 aria-current 不可点）；桌面 nav 手机隐藏（hidden sm:flex）；LangSwitcher 回归单形态（≥640px 文A 下拉，<640px 整体隐藏）；≡ 目录按钮从 logo 左侧移至 ⋮ 左侧（右侧功能区，去掉负 margin）——验证：产物 ⋮ 菜单含 5 导航+语言短标+平行链接，≡ 在 ⋮ 之前，header-nav 手机隐藏，lang-switcher 手机隐藏，单形态无 lang-mobile，persist 容器内无手机菜单
- [x] 17.2 主题 auto 图标换 Lucide monitor（显示器，"跟随系统"业界惯例，shadcn/next-themes 标准三件套 sun/moon/monitor）：用户反馈 sun-moon 是日月拼合的复合图形——验证：产物含 monitor path，无 sun-moon 残留

## 18. 工具三端一致与折叠态清理(九轮)

- [x] 18.1 横条语言切换不拆分、三端一致（用户反馈）：删除手机横条第二行的三个语言短标 pill，改为直接复用同一 `LangSwitcher` 组件（文A 图标三语下拉），手机/平板/桌面工具形态完全一致；撤掉 base.css 的 .lang-switcher 全局手机隐藏，改为仅藏 header 右侧入口（.header-lang）——验证：横条内含 LangSwitcher（文A+平行链接+完整 label），无短标残留，页面双 lang-switcher 断点互斥可见
- [x] 18.2 折叠态去分界线（用户反馈）：分界线加 .header-divider，手机（<640px）隐藏——验证：CSS 含 .header-divider 手机隐藏规则

## 19. 横条下拉对齐与主题图标定稿(十轮)

- [x] 19.1 横条内语言下拉左对齐：LangSwitcher 默认右锚定（适配 header 右侧），在 ⋮ 横条里按钮靠左，下拉改为左对齐跟随（Header scoped + :global 穿透子组件 ul）——验证：CSS 含 .nav-mobile-bar .lang-switcher ul 规则
- [x] 19.2 主题 auto 图标定稿回 Lucide sun-moon（用户明确：白天 sun / 黑夜 moon / 自动 sun-moon）；此前"一个模式 2 个图标"的真正根因是默认隐藏规则漏了 .icon-auto（sun-moon 从未被隐藏，light/dark 态下与对应图标同时显示）——修复为三图标默认全部隐藏再按 data-theme-state 显示对应一个（is:global 样式）——验证：编译 CSS 默认隐藏含全部三图标类，按状态显示规则完备

## 20. 横条细节与 header 闪屏根治(十一轮)

- [x] 20.1 横条露出导航条分割线：`.nav-mobile-bar { top: calc(100% + 1px) }` 跳过 header 的 border-b——验证：CSS 含 calc(100% + 1px)
- [x] 20.2 手机端按钮贴边：⋮ `margin-right: -1rem` 抵消容器 px-4 贴右缘；≡ `margin-right: -0.5rem` 与 ⋮ 之间去 gap（视觉间距由各自 p-2 承担）——验证：CSS 含两条负 margin
- [x] 20.3 header 闪屏根治：此前 persist 的只是 header 内部 div，header 元素本身（背景/边框/手机端 ≡⋮）参与 root 淡入淡出导致肉眼刷新——改为 header 整体独立 view-transition group（.site-header-root）瞬时替换（同 lang-switcher 机制），移除内部 persist；同语言页面间 header 内容相同 → 瞬换无感知，targets 等动态内容随每页 SSR 更新——验证：产物含 site-header-root 与 CSS 瞬换规则，无 persist 残留

## 21. 手机贴边背景无缝(十二轮)

- [x] 21.1 手机贴边时文章页中间区域背景改用纸片色：贴边状态（≤664px）纸片无边框直通页面，但纸片底色（--article-bg）与页面底色（--surface）不同，短文章时下方露底色形成割裂带——文章页 body 加 .post-page，`@media (max-width:664px) { body.post-page main { background-color: var(--article-bg) } }`，纸片与中间区域无缝衔接；宽屏悬浮效果不变，黑夜模式由令牌翻转自动跟随——验证：产物含 post-page（仅文章页）与 CSS 规则，列表页不受影响
