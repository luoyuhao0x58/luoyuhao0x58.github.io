## Context

现状（见 proposal.md - Why）：`tokens.css` 用三枚字体 token（`--font-sans/serif/mono`），每枚都是"拉丁在前、中文在后"的单栈，全站三种语言共用。栈内中文字体全部为简体字体，zh-Hant 页面渲染繁体时字形不地道；且纯系统字体栈下跨平台中文观感差异大（Windows 微软雅黑 vs macOS 苹方）。

约束：文章排版（图片样式、代码块顶格、纸张内部边距、破格元素顶格）为本变更不可触碰的不变量，参考 `src/styles/article.css` 的破格设计与 `src/styles/layout.css` 的纸张布局（`--paper-pad-y`、`padding-inline`）。

## Goals / Non-Goals

Goals：
- 以"角色 × 语言"矩阵重构字体系统，修复 zh-Hant 字形，引入等宽导航品牌语言。
- 中文正文回归各平台系统字体（本地最优），保持零字体加载、零第三方字体依赖。
- 中英文混排空格用 CSS 渐进增强实现，不引入运行时脚本。

Non-Goals：
- 不修改任何文章排版（图片、代码块顶格、纸张内边距、破格设计）。
- 不做 RTL/竖排实现；仅通过逻辑属性约定预留。
- 不引入第三方字体 CDN；不采用区域定制化代码。
- 不追求标点挤压（`text-spacing-trim` 仍为 Experimental，见下）。
- 不引入自托管拉丁字体（各平台原生拉丁字体观感已接近）。

## Decisions

### D1: 字体角色矩阵（角色 × 语言）

采用"角色 × 语言"二维结构管理字体：

| 角色 | zh | zh-Hant | en |
|------|----|---------|----|
| 正文 sans | 系统字体(雅黑/苹方/Android Noto) | 系统 TC 字体优先 | 系统拉丁栈 |
| 标题 serif | 系统宋体(宋体/苹方衬线) | 系统 TC 宋体优先 | 系统衬线栈 |
| 代码 mono | Latin mono + CJK 回退 sans | 同左 | 系统等宽栈 |
| 导航 mono | 等宽仅作用于拉丁字符 | 同左 | 系统等宽栈 |

- 拉丁段全站共享（各平台系统字体已足够接近），CJK 段按语言切换——混排时浏览器按字符自动分配，无需手工标注（参考 heti 的 `$font-family-*` 拉丁栈在前 + CJK 抽象族在后）。
- 备选（否决）：整站按语言替换整条 `font-family`。否决理由：技术文章必然中英混排，整站替换会使混排字失控。

### D2: 中文正文回归系统字体（自托管方案已回退）

曾实施自托管思源黑体 subset（"Blog CJK Sans"，@font-face local 优先 + url 回退），经真实设备反馈后**回退**：

- **回退原因**：① Windows 低分屏下 ClearType 依赖 hinting，而思源全系 unhinted（Google Fonts 原始 TTF 实测 0 hinting 指令）——字体文件救不了渲染引擎差异，Windows 观感无提升；② Android 上 local() 在 OEM 系统（小米/华为等）名不匹配时下载 subset，且初版 subset 实例化不净残留可变轴（fvar/gvar）+ kern 特性被裁，国产 WebView 渲染异常，原本最好的平台（系统自带思源）反而观感变差。
- **当前决策**：中文正文直接用各平台系统字体（Windows 微软雅黑 / macOS 苹方 / Android 系统 Noto Sans CJK），各平台本地最优、零字体加载。跨平台"字形一致"让位于"各平台本地最优"——渲染引擎差异决定了字体文件无法同时兑现两者。
- 备选（否决）：第三方字体 CDN（字节/Google 镜像等）。否决理由：国内无官方 Google 节点、个人镜像存活期不可控；且与回退后"零字体加载"目标冲突。

### D3: 等宽导航仅对拉丁字符生效

导航等宽角色通过字体栈实现，等宽感只作用于拉丁字符；CJK 天然全角，无等宽/比例之分，中文部分保持方块字、不做额外区分（用户接受此不对称，作为有意的品牌取舍）。

### D4: zh-Hant 繁体字形

zh-Hant 的中文字体映射使用 TC 字形优先的系统字体（PingFang TC / Heiti TC / Noto Sans TC / Source Han Sans TW 等），替代现状的简体字体。借助 `<html lang="zh-Hant">` 或 `:lang()` 切换 token。

### D5: 中英文混排空格用 text-autospace

正文应用 `text-autospace: normal;`（MDN Baseline 2025，2025 年 11 月起主流浏览器可用）自动处理 CJK↔Latin 间距。纯呈现层，不修改 DOM；不支持时无间距、内容无损。

- 同时保留内容层写作规范（中文与英文之间写真实空格，见 copywriting-guidelines）：`text-autospace` 的间距在复制/粘贴时不会进入文本，内容被引用到站外时仍需真实空格。

### D6: 逻辑属性约定（RTL 预留）

新增布局代码一律使用逻辑属性（`ms/me/ps/pe/start/end`、`border-inline`、`margin-inline` 等），不引入新的物理方向属性。存量物理属性清单（已知项，本变更不修改，留待引入 RTL 语言时统一处理）：

- `src/components/Toc.astro`：`ml-3`、`border-l`（目录缩进线）
- `src/components/BackToTop.astro`：`right-4`（返回顶部定位）
- `src/components/LangSwitcher.astro`：`right-0`（下拉定位）
- `src/components/Header.astro`：`margin-right: -1rem`、`left/right: 0`、横条内 `left/right`（⋮ 菜单与横条）
- `src/styles/layout.css`：`margin-right: 5px`、`margin-right: calc(...)`、`margin-right: -0.5rem`、`margin-left: calc(...)`（锚点图标、页脚装饰、缩进补偿）
- `src/styles/article.css`：`padding-left: 1.4rem`（引用缩进）

不实现竖排。

### D7: 字体资源

无字体文件资源：系统字体栈零加载，不引入任何 web font 文件，`public/fonts/` 不存在。

## Risks / Trade-offs

- [跨平台中文观感不一致（Windows 雅黑 vs macOS 苹方 vs Android Noto）] → 有意接受：这是"各平台本地最优"的固有代价，也是回退前自托管方案试图消除但未能兑现的目标（渲染引擎差异决定）；观感差异主要体现在字形细节，不影响可读性。
- [zh-Hant 在无 TC 字体的平台（如部分 Linux）回退到简中/通用字体] → 接受：Windows 有微软正黑、macOS/iOS 有苹方 TC、Android 有 Noto Sans CJK TC，主流平台均有 TC 字体；小众平台按字体栈尾部通用 CJK 兜底。
- [text-autospace 浏览器覆盖不全（2025.11 前版本）] → 纯呈现层渐进增强，不支持时退回"写作规范空格"，无功能损失。
- [改动 tokens.css 影响全站字体] → 通过 spec 的"排版不变量"与视觉回归（三语言 × 明暗两主题）验证，避免误伤文章排版。

## Migration Plan

1. 在 `tokens.css` 中新增字体角色 token 与 zh-Hant 语言覆盖（纯系统字体栈，无 @font-face）。
2. 将 `base.css`/`layout.css`/`Header.astro` 的字体引用切换到角色 token。
3. 加入 `text-autospace` 与逻辑属性约定（仅新代码）。
4. 三语言 × 明暗两主题下做视觉回归，重点核对文章图片/代码块顶格/纸张边距未变化。
5. 回滚：改动集中在 token 与少量类名，单文件 revert 即可整体回退。
6. 回退记录：自托管思源 subset（@font-face + public/fonts）已从本变更移除，如未来要恢复需先解决可变轴实例化与 kern 特性保留问题，并做真机验证。

## Open Questions

无。（自托管思源 subset 方案已整体回退，原体积/分片问题不再适用。若未来重新评估自托管，前置事项见 Migration Plan 第 6 条。）
