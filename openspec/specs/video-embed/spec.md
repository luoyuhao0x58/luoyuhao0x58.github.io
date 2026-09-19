## Purpose

让文章正文可以嵌入 B站或 YouTube 视频，并针对国内/海外访客自动选择可访问的平台，同时在无 JavaScript 环境下仍提供可用的视频入口，避免单一平台不可达导致内容不可见。

## Requirements

### Requirement: 视频嵌入

文章 frontmatter SHALL 支持可选的 `video` 字段，记录 `bilibili` 与/或 `youtube` 的视频 id。存在该字段时，文章页 SHALL 渲染对应平台的视频嵌入。

#### Scenario: 单一平台视频嵌入

- **WHEN** 文章 `video` 字段仅含 `bilibili` id
- **THEN** 文章页渲染 B站嵌入播放器

#### Scenario: 双平台视频默认展示与可切换

- **WHEN** 文章 `video` 字段同时含 `bilibili` 与 `youtube` id
- **THEN** 文章页按访问者环境默认展示其中一个平台的嵌入，并提供手动切换到另一平台的能力

### Requirement: 平台分流

同时提供双平台视频时，系统 SHALL 根据访问者环境（语言/时区）默认选择国内（B站）或海外（YouTube）平台，并允许访客手动切换。

#### Scenario: 国内环境默认 B站

- **WHEN** 访问者环境判定为国内，且文章提供双平台视频
- **THEN** 默认展示 B站嵌入，访客可手动切换到 YouTube

#### Scenario: 手动选择在会话内保持

- **WHEN** 访客手动切换到另一平台
- **THEN** 该页面内后续交互保持其选择，不自动回跳默认平台

### Requirement: 无脚本回退

禁用 JavaScript 时，双平台视频 SHALL 降级为两个平台的文字链接，访客可自行选择平台观看。

#### Scenario: 禁用 JavaScript 时展示平台链接

- **WHEN** 浏览器禁用 JavaScript 且文章提供双平台视频
- **THEN** 页面展示 B站与 YouTube 两个可点击的文字链接，而非自动嵌入
