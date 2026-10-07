# 设计令牌说明（Design Tokens）

本仓库的 `src/styles/tokens.css` 是设计令牌的**唯一事实源**，改动直接落这里，无需同步任何外部仓库。

> **未来规划**：将来若将令牌抽离为独立包（如供 SolidJS 组件库消费），从本文件迁出；命名约定已定稿为统一 `--nettix-` 前缀（既有令牌重命名待执行）。

## 令牌分层

令牌按三层组织（`tokens.css` 内注释有完整说明）：

1. **调色板/字体/圆角/阴影/动效/断点** → Tailwind v4 `@theme`（生成工具类 + `:root` 变量）
2. **语义层（角色色）** → `:root` 变量，随 `prefers-color-scheme` 翻转
3. **语义工具类映射** → `@theme inline`，使 `bg-surface` 等跟随主题

## 语义令牌（站点消费的角色色）

> **定稿方向**：白天 = 日式·和纸（纸白 + 靛蓝 + 朱印 + 苔绿）；黑夜 = 中式·夜墨（玄色 + 暗金橄榄 + 夜灯琥珀 + 夜竹青）。按明暗模式混搭，浅冷深暖。

| 令牌 | 浅色（和纸） | 深色（夜墨） | 用途 |
|---|---|---|---|
| `--surface` | #e4e4e4 | #333333 | 页面底色（中性灰白 / 中性灰） |
| `--surface-alt` | #e7e7e7 | #222222 | 次级面（代码底、表头） |
| `--surface-raised` | #f7f7f7 | #242424 | 抬升面（纸片/浮层，中性近白 / 中性黑） |
| `--text-primary` | #2c3139 | #fffbf0 | 主文字（墨 / 中性近白） |
| `--text-secondary` | rgb(0 0 0 / .65) | rgb(255 255 255 / .65) | 次要文字（alpha 分级） |
| `--text-muted` | rgb(0 0 0 / .45) | rgb(255 255 255 / .45) | 弱化文字（alpha 分级） |
| `--border` | rgb(0 0 0 / .14) | rgb(255 255 255 / .14) | 发丝边框（半透明自适应） |
| `--brand` | #065279 | #bf9c46 | 品牌（靛蓝 / 暗金橄榄） |
| `--accent` | #b3452f | #e0a050 | 强调（朱印 / 夜灯琥珀） |
| `--action` | #2f6b4f | #2fa07c | 行动（苔绿 / 夜竹青） |
| `--code-bg` / `--code-text` / `--code-border` | #e6e6e6 / #2a2a2a / rgb(0 0 0 / .14) | #1a1a1a / #e6e6e6 / rgb(255 255 255 / .18) | 代码块专用（语言块/纯文本块统一底色） |
| `--code-gutter-bg` | #dedede | #161616 | 语言块行号列底色（浅色略深一档/深色微深近代码底） |
| `--code-line-hover` | rgb(0 0 0 / .06) | rgb(255 255 255 / .06) | 语言块行 hover 强调条 |
| `--scrollbar-thickness` | 0.375rem（手机 ≤639px 时 0.1875rem） | 同左 | 竖向浮层 + 代码块横向滚动条统一粗细 |
| `--ntx-shadow-*` | — | — | 阴影层级 |

## 字体

`--font-sans` 采用 **antd v5 字族**（含中文/emoji 回退）：

```
-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
Arial, "Noto Sans", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
"Noto Sans SC", sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
"Segoe UI Symbol", "Noto Color Emoji"
```

`--font-mono` 为系统等宽栈（ui-monospace / SF Mono / Menlo / Consolas / Liberation Mono，含中文字体回退）。

## 深色模式与主题切换

- 深色语义值在 `:root` 的 `--dark-*` 单源变量组定义一次；自动模式（`@media (prefers-color-scheme: dark)`，`data-theme` 非 light/dark 时生效）与手动模式（`:root[data-theme="dark"]`）两个分支共同引用该组变量，杜绝逐字复制
- **手动主题**：`<html data-theme="light|dark">` 可强制覆盖；`data-theme="auto"`（或省略）跟随系统
- **兼容说明**：部分国产 WebView 不报告 `prefers-color-scheme` 媒体查询（CSS 的 `@media` 块失效），故 `ThemeScript` 的 auto 状态用 JS `matchMedia` 显式检测系统深/浅并直接写 `data-theme`；CSS 媒体查询保留为无 JS / matchMedia 不可用时的兑底路径
- 博客在 `<head>` 内联 `ThemeScript` 首帧前应用主题，无闪烁

## 校验

对比度校验脚本尚未建立（此前文档引用的 `verify-contrast.mjs` 并不存在）。
