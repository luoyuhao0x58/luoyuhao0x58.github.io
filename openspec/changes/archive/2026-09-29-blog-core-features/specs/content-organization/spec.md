## Purpose

将博客文章从单一平铺列表提升为可组织的个人站点内容层：通过分类、专栏与标签三种维度聚合文章，并提供跨语言的列表分页展示，让访客能按兴趣维度浏览内容。

## ADDED Requirements

### Requirement: 文章分类

文章 frontmatter SHALL 支持 `category` 字段，取值为 `tech`（技术文章）或 `journal`（个人文摘），用于分类聚合。分类页 SHALL 按分类过滤，仅展示该分类下、当前语言的文章。

#### Scenario: 分类页按分类与语言过滤

- **WHEN** 存在 `category=tech` 与 `category=journal` 的文章，且用户访问 `/zh/category/tech/`
- **THEN** 页面仅列出 zh 语言且 `category=tech` 的文章

#### Scenario: 空分类不产生 404

- **WHEN** 某分类在当前语言下没有任何文章
- **THEN** 分类页展示空状态提示，正常返回而非 404

### Requirement: 文章专栏

文章 frontmatter SHALL 支持可选的 `series` 字段标识所属专栏。专栏页 SHALL 聚合同一 `series` 的文章，并按发布时间**正序**（旧→新）排列。

#### Scenario: 专栏按时间正序展示

- **WHEN** 同一 `series` 下有 3 篇文章，发布时间依次为 T1 < T2 < T3
- **THEN** 专栏页按 T1、T2、T3 的顺序展示

#### Scenario: 无专栏文章不出现于专栏页

- **WHEN** 文章未设置 `series` 字段
- **THEN** 该文章不出现于任何专栏页

### Requirement: 标签聚合

文章 SHALL 支持多个标签（`tags`）。系统 SHALL 提供标签索引页与单个标签的文章列表页；标签索引页 SHALL 展示每个标签在当前语言下的文章计数。

#### Scenario: 标签索引展示计数

- **WHEN** 用户访问标签索引页
- **THEN** 页面展示当前语言下所有标签及其文章计数

#### Scenario: 标签文章列表按语言过滤

- **WHEN** 用户访问 `/zh/tags/<tag>/`
- **THEN** 页面仅列出当前语言下包含该标签的文章；无匹配时展示空状态，不产生 404

### Requirement: 列表分页

首页、分类页与标签文章页 SHALL 支持分页；第二页起的 URL 形如 `/zh/page/2/`。每页文章数量 SHALL 固定（默认 10 篇）。分页导航 SHALL 提供上一页与下一页链接。

#### Scenario: 超出每页数量时生成多页

- **WHEN** 某列表的文章总数超过每页固定数量
- **THEN** 生成多页静态页面，URL 依次为 `/zh/`、`/zh/page/2/`、`/zh/page/3/` …

#### Scenario: 分页导航可用

- **WHEN** 用户处于非首页分页
- **THEN** 分页导航包含指向上一页与下一页的链接

### Requirement: 聚合页多语言

所有聚合页（分类、专栏、标签、分页首页）SHALL 支持三种语言，URL 以语言前缀开头，且仅展示当前语言的文章。

#### Scenario: 不同语言聚合页内容隔离

- **WHEN** 访问 `/en/category/tech/` 与 `/zh/category/tech/`
- **THEN** 分别展示 en 与 zh 语言下 `category=tech` 的文章

### Requirement: 无脚本可访问

聚合页、分页导航与文章链接 SHALL 为纯静态 HTML；禁用 JavaScript 时仍可完整浏览与跳转。

#### Scenario: 禁用 JavaScript 仍可浏览

- **WHEN** 浏览器禁用 JavaScript
- **THEN** 分类、专栏、标签、分页页面仍可正常打开，并可通过静态链接跳转到文章页
