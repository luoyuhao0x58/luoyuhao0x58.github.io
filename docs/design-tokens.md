# 设计令牌说明（Design Tokens）

本仓库的 `src/styles/tokens.css` 是共享设计系统 **`@nettix/design-tokens`** 的 **vendored 副本**，用于让 blog 独立仓库自包含构建。

> **⚠️ 临时状态**：待 `@nettix/design-tokens` 发布到 npm / GitHub Packages 后，
> 将 `src/styles/global.css` 的 `@import "./tokens.css"` 改回 `@import "@nettix/design-tokens"`，
> 并删除本文件。改动共享令牌时请先同步回 org 仓库，避免版本漂移。

## 令牌分层

令牌按三层组织（`tokens.css` 内注释有完整说明）：

1. **调色板/字体/圆角/阴影/动效/断点** → Tailwind v4 `@theme`（生成工具类 + `:root` 变量）
2. **语义层（角色色）** → `:root` 变量，随 `prefers-color-scheme` 翻转
3. **语义工具类映射** → `@theme inline`，使 `bg-surface` 等跟随主题

## 语义令牌（站点消费的角色色）

| 令牌 | 浅色 | 深色 | 用途 |
|---|---|---|---|
| `--surface` | #ffffff | #0d1117 | 页面底色 |
| `--surface-alt` | #f6f8fa | #161b22 | 次级面（代码底、表头） |
| `--surface-raised` | #ffffff | #161b22 | 抬升面（纸片/浮层） |
| `--text-primary` | #1a2333 | #e6edf3 | 主文字 |
| `--text-secondary` | #4b5563 | #9ca3af | 次要文字 |
| `--text-muted` | #6b7280 | #7d8590 | 弱化文字 |
| `--border` | #e5e7eb | #30363d | 发丝边框 |
| `--brand` | #2563eb | #60a5fa | 品牌蓝 |
| `--brand-subtle` | #eff6ff | #1e293b | 品牌浅底 |
| `--accent` | #d97706 | #fbbf24 | 强调琥珀 |
| `--action` | #16a34a | #34d399 | 行动绿 |
| `--code-bg` / `--code-border` | — | — | 代码块专用 |
| `--ntx-shadow-*` | — | — | 阴影层级 |

## 字体

`--font-sans` 采用 **antd v5 字族**（含中文/emoji 回退）：

```
-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
Arial, "Noto Sans", "Noto Sans SC", "PingFang SC", "Hiragino Sans GB",
"Microsoft YaHei", sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
"Segoe UI Symbol", "Noto Color Emoji"
```

`--font-mono` 为系统等宽栈（ui-monospace / SFMono / Menlo / Consolas）。

## 深色模式与主题切换

- 深色令牌定义在 `@media (prefers-color-scheme: dark)` 内，用 `:root:not([data-theme])` 守卫
- **手动主题**：`<html data-theme="light|dark">` 可强制覆盖；`data-theme="auto"`（或省略）跟随系统
- 博客在 `<head>` 内联 `ThemeScript` 首帧前应用主题，无闪烁

## 校验

令牌对比度可用 `packages/design-tokens/scripts/verify-contrast.mjs` 校验（在 org 仓库中维护）。
