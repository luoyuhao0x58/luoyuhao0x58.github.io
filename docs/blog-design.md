# 博客设计与实现说明

本文记录博客（Astro）的原型设计决策与实现方式，供后续开发参考。

## 技术栈

- **框架**：Astro 7（静态站，SSG 预渲染）
- **样式**：Tailwind CSS v4（CSS-first 配置）+ 设计令牌（vendored `@nettix/design-tokens`）
- **内容**：Astro Content Collections（`src/content/blog/`，markdown + frontmatter）
- **正文能力**：GFM（任务列表/删除线/自动链接）、KaTeX 数学公式、Mermaid 图、Shiki 双主题代码高亮
- **字体**：antd v5 字族（`--font-sans`，见 `src/styles/tokens.css`）

## 目录结构

```
src/
├── components/     # 站点级组件(Header/Footer/Toc/LangSwitcher/主题切换)
├── content/        # 文章内容集合(zh/en)
├── layouts/        # BaseLayout(列表/404) 与 MarkdownPostLayout(文章页)
├── pages/          # 路由(i18n 子路径 /zh /en)
├── plugins/        # rehype 插件(标题锚点)
├── scripts/        # 客户端脚本(mermaid 渲染、目录交互)
├── styles/         # 全局样式模块(tokens/base/article/mermaid/layout)
├── content.config.ts  # 内容集合 schema
└── i18n.ts         # 站级文案(zh/en)
```

## 布局设计

### 纸片（文章卡）

- 文章内容是一张"纸片"（暖纸底 `--article-bg` + 发丝边框 + 柔和阴影），**全视口存在**
- **手机**（<640px）：纸片直角（无圆角）、满宽贴顶
- **平板**（640–1151px）：纸片圆角 `0.375rem`；视口能放下 664px（两侧有空隙，≥680px）时顶部留 1em 空隙
- **桌面**（≥1152px）：三栏 `广告位 | 纸片 664px | 目录`，文章宽度固定不缩

### 内容宽度

- 纸片宽 `664px`，正文文字实际列宽 = `664 − 2×2em(32px) = 600px`（邮件常见宽度）
- 破格元素（图片/代码/表格/mermaid/hr）顶格到纸片边缘（L2），全视口无边框无圆角

### 标题与锚点

- h2 全宽定格，分割线为**两端渐隐的发丝线**，文字左右缩进 0.5em
- h3/h4 保持 0.5em 左缩进
- 所有标题（含文章 h1）悬停时左侧浮现 `#` 锚点链接（纸张之外 5px，`src/plugins/rehype-heading-anchors.mjs` 注入）

### 目录

| 视口 | 形态 |
|---|---|
| 手机 <640px | 导航条"目录"按钮 → 玻璃质感下拉面板 |
| 平板 640–1151px | 正文内折叠目录，滚动吸顶（玻璃质感，≥680px 距导航条 1em） |
| 桌面 ≥1152px | 右侧 sticky 目录（有题图时与标题顶部对齐） |

### 主题

- 三态切换：白天 / 黑夜 / 自动（`data-theme` 属性 + localStorage 持久化）
- `ThemeScript.astro` 在 `<head>` 首帧前应用主题，避免闪烁
- 深色模式由 `tokens.css` 的令牌翻转驱动（含手动 `data-theme` 守卫）

### 图片

- 题图顶到纸片最外缘（覆盖 1px 边框），底部渐隐融入纸面
- 正文图片/题图不可选中（`user-select: none`）、不可拖拽（`draggable="false"`）

## 响应式断点

| 断点 | 说明 |
|---|---|
| <640px | 手机：纸片直角、满宽贴顶、目录在导航条 |
| ≥640px | 平板+：纸片圆角、上下留白 3rem |
| ≥680px | 纸片两侧有空隙 → 顶部留 1em、目录吸顶距导航条 1em |
| ≥1152px | 桌面三栏：目录/文章/广告 |

## 约定

- 写文章：在 `src/content/blog/<lang>/` 放 markdown，frontmatter 含 `title/pubDate/description/tags/lang/translationOf/image`
- 共享令牌改动：先同步回 org 的 `@nettix/design-tokens` 仓库，再更新本仓库的 `src/styles/tokens.css`（vendored 副本）
- 开发流程：见 README（本地开发/构建）与 OpenSpec（本仓库 `openspec/`）
