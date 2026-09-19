## Why

博客支持三种语言（zh / zh-Hant / en），但字体系统仍是"一栈通吃"：所有语言共用同一套字体栈，且栈内中文字体全部是简体字体（PingFang SC、微软雅黑、Noto Sans SC）。这带来两个问题：一是 zh-Hant 页面渲染繁体时落到简体字形，观感"能显示但不对"；二是跨平台中文观感差异大——Windows 的微软雅黑与 macOS 的苹方差距明显，同一页面在不同平台"看起来不对劲"。同时希望借这次设计方向的完善，引入字体角色矩阵与等宽导航（程序员终端感）作为站点品牌语言的一部分。

## What Changes

- 引入**字体角色矩阵**：按"角色 × 语言"定义字体系统（正文/标题/等宽/导航等角色 × zh/zh-Hant/en 语言），各角色跨语言保持类型一致，仅切换对应语言的实际字体族。
- **修复 zh-Hant 字形**：zh-Hant 页面的中文字体切换到繁体字体族（PingFang TC / Noto Sans TC 等），不再回退简体字体。
- **等宽导航**：导航链接的拉丁字符使用等宽字体，获得终端感；中文保持全角方块字（无差别，接受）。
- **中文正文回归系统字体**：CJK 段使用各平台系统字体（Windows 微软雅黑 / macOS 苹方 / Android 系统 Noto），零字体加载。曾评估并实施自托管思源 subset 拉齐跨平台观感，经真实设备反馈（Windows 无提升、Android 变差）后回退，记录于 design.md D2。
- **中英文混排自动空格**：正文应用 `text-autospace` 自动处理 CJK↔Latin 间距（渐进增强，不改变内容 DOM，不破坏复制）。
- **逻辑属性约定**：新增代码一律使用逻辑属性（`ms/me/ps/pe/start/end`），为未来 RTL 预留。
- **边界（明确不修改）**：文章内容中的图片样式、代码块顶格设计、纸张内部边距与"破格元素顶格"的既有排版一律不动，不做 A4 式四边大边距排版。

## Capabilities

### New Capabilities

- `typography`: 站点字体角色系统与多语言字体选择。覆盖字体角色矩阵的定义、各语言字体族映射（含 zh-Hant 繁体字形）、等宽导航、CJK 自托管与回退、中英文混排空格、以及"文章图片/代码块/纸张边距排版保持不变"的约束。

### Modified Capabilities

（无。现有 specs——content-organization、personal-pages、site-controls、video-embed——均不涉及字体渲染行为，本变更不修改其需求。）

## Impact

- **代码**：`src/styles/tokens.css`（字体角色 token 与 zh-Hant 语言覆盖）、`src/styles/base.css`（字体族引用与 text-autospace）、`src/styles/layout.css`（导航等宽字体应用）、`src/components/Header.astro`（导航字体类）。
- **资源**：无新增字体文件（系统字体栈零加载）。
- **依赖**：无新增运行时依赖。
- **兼容性**：`text-autospace` 为渐进增强，老浏览器降级无内容损失。
- **不改动**：文章排版（图片、代码块顶格、纸张内边距、破格设计）。
