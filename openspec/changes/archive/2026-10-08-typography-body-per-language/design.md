## Context

现状（见 proposal.md - Why）：`src/styles/article.css` 的正文规则为 `font-family: "CJK-Strong", var(--font-serif); font-weight: 500; font-synthesis-weight: auto;`，配合 `@font-face { font-family: "CJK-Strong"; }` 块（`local()` 引用 Noto Serif / Songti / SimSun / Hiragino Mincho / Yu Mincho / Nanum Myeongjo，`font-weight: 400 500`，unicode-range 覆盖 CJK/日/韩码段）——意图是对 CJK 字符按字重合成加粗以拉齐与拉丁的视觉重量。tester 像素级验证：该 500 合成加粗在 Chromium 是 no-op（`font-synthesis-weight` 在 Chromium 不合成、系统宋体/明朝体无真实 500 字重），效果未兑现；且正文经系统字体回退命中低质量 CJK 字体，中文边缘发虚发糊。

标题（`base.css` h1-h6）与 UI（`base.css` body）现为无衬线（`--font-sans`）；正文现为衬线（`--font-serif`）——与现行 spec"正文（无衬线）、标题（衬线）"相反，属既有描述偏差，本次一并修正。

约束：零字体加载（无自托管 webfont、无网络字体请求）、各平台系统字体本地最优、不依赖 font-synthesis 合成字重；文章排版不变量（图片样式、代码块顶格、纸张内部边距、破格元素顶格）不得触碰。

## Goals / Non-Goals

Goals：
- 正文角色按语言差异化：中文（zh/zh-Hant）无衬线黑体、拉丁（en/es/ru）衬线、日/韩（ja/ko）衬线、阿文（ar）Naskh 现状，解决中文正文"边缘发虚发糊"。
- 摘要（列表项 excerpt 与详情页摘要卡片）统一到正文角色 `--font-body`（与正文同一字体矩阵），字重 300→400，解决中文摘要发虚。
- 删除 CJK-Strong 合成加粗机制与 font-synthesis 依赖，正文字重回归 400，回归真实字重渲染。
- 修正 spec 与实现相反的既有偏差（正文衬线/标题无衬线），使规格、实现意图一致。

Non-Goals：
- 不引入任何自托管 webfont / 网络字体请求（约束不变）。
- 不修改标题（无衬线）、代码（等宽）、导航（等宽）角色——仅正文角色按语言差异化；摘要复用正文角色，不新增独立字体角色。
- 不触碰文章排版不变量（图片样式、代码块顶格、纸张内部边距、破格元素顶格）。
- 本变更不做代码实现（由另一线程 code.worker 执行），只产出规格与计划。

## Decisions

### D1: 正文角色按语言差异化（v2 字体矩阵）

正文角色不再"跨语言保持类型一致"，改为按语言差异化：

| 语言 | 正文类型 | 字体族 |
|------|---------|--------|
| zh 简体中文 | 无衬线黑体 | 苹方 / 微软雅黑 / Noto Sans SC + 拉丁 -apple-system/Roboto |
| zh-Hant 繁体中文 | 无衬线黑体 | PingFang TC / 微軟正黑體 / Noto Sans TC |
| en/es/ru 拉丁 | 衬线 | Georgia / Times（报刊惯例） |
| ja 日文 | 衬线 | Hiragino Mincho / Noto Serif JP / Yu Mincho（质量高保留） |
| ko 韩文 | 衬线 | Nanum Myeongjo / Noto Serif KR（质量高保留） |
| ar 阿拉伯文 | 保持现状 | Naskh 系（Geeza Pro / Segoe UI Arabic / Noto Naskh Arabic 等，与现行一致） |

依据：antd 字体方案启示（系统字体优先、避免依赖合成字重）；拉丁报刊衬线惯例；日/韩衬线系统字体本地质量高故保留衬线；阿文已按 Naskh 系渲染、无质量投诉故不变。约束不变：全部为系统字体、零字体加载、不依赖 font-synthesis。

### D2: `--font-body` 角色变量与语言覆盖

- 在 `tokens.css` 基础层新增 `--font-body` 角色变量，**默认值即无衬线黑体栈**（服务 zh 与默认拉丁段：`-apple-system, ... , "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`，结构对齐现行 `--font-sans` 的"拉丁在前、中文在后"）。zh 是站内默认语言与主正文语言，无衬线黑体栈直接作为默认值，不额外写 `html[lang="zh"]` 覆盖。
- `html[lang]` 覆盖块按语言差异化：
  - `html[lang="en"]`、`html[lang="es"]`、`html[lang="ru"]`：`--font-body` 切衬线（Georgia / Times New Roman / serif，报刊惯例）。
  - `html[lang="ja"]`：`--font-body` 切衬线（Georgia / Times + Hiragino Mincho / Noto Serif JP / Yu Mincho）。
  - `html[lang="ko"]`：`--font-body` 切衬线（Georgia / Times + Nanum Myeongjo / Noto Serif KR）。
  - `html[lang="zh-Hant"]`：`--font-body` 切无衬线 TC 栈（PingFang TC / 微軟正黑體 / Noto Sans TC），复用既有 TC 覆盖语义。
  - `html[lang="ar"]`：`--font-body` 保持现状（Naskh 系，与现行 `--font-serif` 的阿文段一致）。
- 既有 `--font-sans`（标题/UI）与 `--font-serif` 保留不动；`--font-body` 是独立角色变量，正文引用它，标题/UI 仍引用各自角色变量。

### D3: 删除 CJK-Strong 与 font-synthesis，正文回归 400

- 删除 `src/styles/article.css` 中 `CJK-Strong` `@font-face` 块（`local()` 栈 + `font-weight: 400 500` + CJK/日/韩 unicode-range）——该机制依赖的合成加粗在 Chromium 是 no-op（tester 已验证），且依赖 font-synthesis 与"不依赖合成字重"约束冲突。
- 删除正文规则中的 `font-synthesis-weight: auto` 与 `font-weight: 500`。
- 正文 `font-family` 由 `"CJK-Strong", var(--font-serif)` 切换为 `var(--font-body)`，`font-weight` 回归 400（或继承默认，不显式声明 500/600 合成）。
- 混排（CJK↔Latin）字体分配仍由字体栈"拉丁在前、中文/日/韩在后 + 各语言 `--font-body` 覆盖"自动完成，无需手工标注（语义与 D1 矩阵一致）。

### D4: 对比度核查项

正文切换字体族与字重后，需核查正文与背景的对比度不因字体/字重变化而劣化：

- 浅色主题（和纸底 `--surface`/`--surface-raised`）与深色主题（`--article-bg`）下，正文文字（`--text-primary`）对比度维持既有 WCAG 达标值（正文 16px 常规对比度 ≥ 4.5:1；大字号/标题不受影响）。
- 拉丁衬线正文（en/es/ru/ja/ko 的 Latin 段）细笔画的视觉对比度，重点在浅色主题下抽查（衬线细笔画在浅底上对比度低于无衬线，属排版惯例取舍，不低于可读阈值即可）。
- 中文黑体正文（zh/zh-Hant）回归 400 字重后，笔画较 500 略细，浅色主题下核对清晰度不降（正是修复"边缘发虚"的方向：真实 400 + 本地最优字体，而非合成 500）。

### D5: 摘要统一到正文角色 `--font-body`

列表项摘要（`PostCard.astro` excerpt）与详情页摘要卡片（`MarkdownPostLayout.astro` excerpt）原分别使用 `--font-serif`（宋体）与 `--font-kai`（楷体）——均属衬线系，中文场景下与正文（无衬线黑体）观感割裂且中文衬线摘要发虚。用户后续确认：两处摘要统一到正文角色 `--font-body`（与正文同一字体矩阵），字重由 300（列表摘要 `font-light`）回归 400，解决中文摘要发虚。

- 列表页摘要：`font-family: var(--font-serif)` → `var(--font-body)`；`font-weight` `font-light`(300) → `font-normal`(400)。
- 详情页摘要卡片：`font-family: var(--font-kai)` → `var(--font-body)`（字号 `text-sm` 与卡片布局不变）。
- 摘要不新增字体角色：跟随 `--font-body` 按语言差异化（zh 黑体、拉丁/日韩衬线、ar Naskh 现状），与 D1/D2 语义一致。
- 范围边界：仅列表页摘要与详情页摘要卡片；`about` 页 `.about-fact dd` 的 `--font-kai`（注释"与文章摘要一致"）属关于页事实值、非摘要，不在本次摘要统一范围，由 code.worker 核对是否需联动。
- 不变量：摘要字体与字重变化不触碰文章排版不变量（图片样式、代码块顶格、纸张内部边距、破格元素顶格）。

## Risks / Trade-offs

- [中文正文由衬线切无衬线（zh 正文观感整体变化）] → 这是本次用户拍板的方向（中文黑体正文 + 修复发虚），且标题/UI 本就无衬线，中文无衬线正文与站点现有 sans 体系更一致；通过视觉回归（三语言 × 明暗两主题）核对文章排版不变量。
- [en/es/ru/ja/ko 正文由衬线保持/切换衬线，与 zh 无衬线观感不一致] → 有意的差异化决策：按语言惯例（拉丁报刊衬线、日韩衬线质量高），非缺陷；正文按语言区分属 v2 矩阵既定目标。
- [删除 500 合成后中文正文在深色主题下的加粗感降低] → 500 在 Chromium 本就是 no-op，删除不改变 Chromium 实际渲染；其他浏览器从"合成加粗"回退为"真实 400"，行为更可预期、更符合零合成依赖约束。
- [跨平台中文观感不一致（Windows 雅黑 vs macOS 苹方 vs Android Noto）] → 既有约束的固有代价，本次不变更（沿用"各平台本地最优"决策）。

## Migration Plan

1. `tokens.css`：基础层新增 `--font-body`（默认无衬线黑体栈服务 zh）；`html[lang]` 块为 en/es/ru/ja/ko/zh-Hant/ar 补充 `--font-body` 差异化覆盖。
2. `article.css`：删除 `CJK-Strong` `@font-face` 块；正文规则 `font-family` 切 `var(--font-body)`、删除 `font-weight: 500` 与 `font-synthesis-weight`，回归 400。
3. 对比度核查：明暗两主题 × 三语言抽查正文对比度与清晰度（D4）。
4. 视觉回归：三语言 × 明暗两主题核对文章排版不变量未变（图片/代码块顶格/纸张边距/破格元素）。
5. 摘要统一：列表项摘要与详情页摘要卡片切 `var(--font-body)`，列表摘要字重 300→400（与 D5 一致）；视觉回归核对摘要中文黑体不发虚。
6. 回滚：改动集中在 `tokens.css`、`article.css` 与两处摘要（`PostCard.astro`、`MarkdownPostLayout.astro`），单文件 revert 即可整体回退。

## Open Questions

无。
