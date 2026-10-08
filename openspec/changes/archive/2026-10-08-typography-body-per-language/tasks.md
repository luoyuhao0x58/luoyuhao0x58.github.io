> **状态注记**：实现已完成、验收通过（6/6）、已归档；3.2 与 4.2 已回填闭环（code.tester 补充证据，见任务行注记），tasks 13/13 全部完成。已并入用户后续确认：摘要（列表 excerpt 与详情页摘要卡片）统一到正文角色 `--font-body`、字重 400，见第 5 节——已完成并验收通过（code.tester 验收，证据见 `/tmp/blog-font-v2-evidence/SUPPLEMENT.md`「摘要统一到 --font-body」章节与 `json/summary-*.json`）。

## 1. tokens.css：--font-body 角色变量与语言覆盖

- [x] 1.1 在 `tokens.css` 基础层新增 `--font-body` 角色变量（默认无衬线黑体栈服务 zh：拉丁 -apple-system/Roboto + 苹方/微软雅黑/Noto Sans SC），验证 zh 页面正文计算样式引用 `var(--font-body)` 且为无衬线
- [x] 1.2 `html[lang]` 覆盖块按语言差异化补充 `--font-body`：en/es/ru 切衬线（Georgia/Times），ja 切衬线（Georgia/Times + Hiragino Mincho/Noto Serif JP/Yu Mincho），ko 切衬线（Georgia/Times + Nanum Myeongjo/Noto Serif KR），zh-Hant 切无衬线 TC 栈（PingFang TC/微軟正黑體/Noto Sans TC），ar 保持 Naskh 系现状；验证各语言页面正文取对应字体族
- [x] 1.3 既有 `--font-sans`（标题/UI）与 `--font-serif` 保留不动，验证标题/UI/代码/导航角色观感不回归

## 2. article.css：删除 CJK-Strong、正文回归 400

- [x] 2.1 删除 `CJK-Strong` `@font-face` 块（`local()` 栈 + `font-weight: 400 500` + CJK/日/韩 unicode-range），验证构建产物 CSS 无 `CJK-Strong` 与相关 unicode-range 残留
- [x] 2.2 正文规则 `font-family` 由 `"CJK-Strong", var(--font-serif)` 切换为 `var(--font-body)`，删除 `font-weight: 500` 与 `font-synthesis-weight: auto`，正文回归 400；验证正文计算样式 `font-weight: 400` 且无 font-synthesis 依赖

## 3. 对比度核查

- [x] 3.1 浅色/深色主题下核对 zh 中文黑体正文（400 字重）与背景对比度维持 WCAG 达标（正文 16px 常规 ≥ 4.5:1），笔画清晰不发虚
- [x] 3.2 浅色主题下抽查 en/ja/ko 拉丁衬线正文细笔画对比度不低于可读阈值；zh-Hant 繁体黑体正文清晰度无劣化 —— **验收通过**：en/ja 衬线细笔画抽查（SUPPLEMENT §3：en-serif LaplacianVar 4663 / ja-serif 5648，与黑体对照 5229 同量级，模糊参照暴跌 96–97%，最小笔画宽 1px 实体渲染；ko 韩文衬线 §3.3 强制 Noto Serif CJK KR LaplacianVar 13075 处高清晰区间）；zh-Hant 专项核查（SUPPLEMENT §9：栈定义 src+dist+live 三层一致、本机回退 Noto Sans CJK JP 已标注、正文 LaplacianVar 5906.7 / 摘要 4539 与 zh-SC 对照（6506.3/4694.2）同量级、模糊参照暴跌 96–97%、截图齐全）。证据：SUPPLEMENT.md §3/§3.3/§9、`json/zhhant-clarity.json`。

## 4. 验收与回归

- [x] 4.1 视觉回归：三语言（zh / zh-Hant / en）× 明暗两主题核对文章排版不变量未变（图片样式、代码块顶格、纸张内部边距、破格元素顶格）
- [x] 4.2 运行 `pnpm build` 与现有检查（lint/build）全部通过 —— **验收通过**：build 通过（dist 产物断言 11/11，SUPPLEMENT §4 增强断言 17/17）；`corepack pnpm lint`（= `eslint src`）§7 记录 exit 0 无报错输出，§10 独立复核重跑一致（exit 0，无 error/warning）。证据：SUPPLEMENT.md §7/§10。
- [x] 4.3 核对正文语言差异化生效：zh 无衬线黑体、en 衬线、ja/ko 衬线、ar Naskh 现状，与 spec 的 v2 字体矩阵一致

## 5. 摘要字体统一（列表页 excerpt 与详情页摘要卡片 → --font-body）

> 注：源码改动已由 code.worker 落地于工作区；code.tester 已验收通过（证据见 `/tmp/blog-font-v2-evidence/SUPPLEMENT.md`「摘要统一到 --font-body」章节与 `json/summary-*.json`），以下任务已勾选并注明验收结论。

- [x] 5.1 列表项摘要（`PostCard.astro` excerpt）`font-family` 由 `var(--font-serif)` 切 `var(--font-body)`，字重由 `font-light`(300) 回归 `font-normal`(400)；验证列表页摘要计算样式取 `--font-body`、字重 400，中文黑体不发虚 —— **验收通过**：zh/zh-Hant 摘要命中 `--font-body` 黑体栈、字重 400（CDP 实测 zh 落于 Noto Sans CJK SC），en 命中衬线栈（设计如此，与 en 正文一致）；对比宋体 300 基线，发虚指标改善（淡灰像素 61.5%→39.6%、平均笔画宽 1.74→3.33px、边缘能量 +49%）；`font-light`(300) 无残留（src/built HTML 0 处，dist 仅 1 条 Tailwind 惰性工具类规则无元素匹配）。证据：SUPPLEMENT.md §2/§3/§5、`json/summary-runtime.json`、`json/summary-platform-fonts.json`。
- [x] 5.2 详情页摘要卡片（`MarkdownPostLayout.astro` excerpt）`font-family` 由 `var(--font-kai)` 切 `var(--font-body)`；验证摘要卡片与正文同一字体矩阵（zh 黑体、拉丁/日韩衬线、ar Naskh 现状），与 spec 摘要条款一致 —— **验收通过**：临时加 excerpt frontmatter 后真实构建运行时实测，`.post-summary-card` 摘要 p 类为 `font-[family-name:var(--font-body)]`、computed 为 `--font-body` 黑体栈、字重 400、颜色 `--summary-fg`（layout.css 设计令牌，非本次 diff 涉及），与正文同字体矩阵（CDP = Noto Sans CJK SC）；编译产物 CSS 含 `.font-\[family-name\:var\(--font-body\)\]{font-family:var(--font-body)}`；验证后 trap 恢复 frontmatter（md5 一致）并 clean 重建，详情卡片回归休眠。证据：SUPPLEMENT.md §4、`json/summary-detail-card.json`。
- [x] 5.3 视觉回归：摘要字体/字重变化不触碰文章排版不变量（图片样式、代码块顶格、纸张内部边距、破格元素顶格）；与 code.worker 核对 `about` 页 `.about-fact dd` 的 `--font-kai`（注释"与文章摘要一致"）是否属摘要联动范围 —— **验收通过**：回归无损（列表项除摘要外与基线字节级一致，标题/日历块/分页不变，`/zh/`、`/zh/posts/` 整页与基线归一化后仅差摘要 p 与注释文本；详情卡片休眠无残留）；列表页字体请求 0；`corepack pnpm lint`（退出码 0）与 `corepack pnpm build`（dist 断言 17/17）通过。**about 联动范围结论**：tester 确认 `about-fact dd` 仍走 `--font-kai`（layout.css 不在 diff，built CSS 与 live computed 均命中 KaiTi），属 about 页事实值、非摘要，按 D5 范围边界保留、不在本次摘要统一范围，本任务闭环。
