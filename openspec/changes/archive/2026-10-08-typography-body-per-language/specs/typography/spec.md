## Purpose

定义博客的字体与排版体系：按角色（正文/标题/代码/导航）与语言维护字体角色矩阵，正文角色按语言差异化（中文无衬线、拉丁/日韩衬线、阿文 Naskh 现状），统一系统字体渲染与混排间距，并锁定不得破坏的既有文章排版不变量。

## MODIFIED Requirements

### Requirement: 字体角色矩阵

系统 SHALL 按"角色 × 语言"维护字体系统：角色包括正文、标题（无衬线）、代码（等宽）、导航（等宽显示）四类。正文角色按语言差异化——zh / zh-Hant 使用无衬线黑体，en / es / ru 拉丁语言使用衬线（报刊惯例），ja / ko 使用衬线（日韩衬线字体质量高保留），ar 保持 Naskh 系现状。语言包括 zh、zh-Hant、en、es、ru、ja、ko、ar。标题、代码、导航角色在不同语言下保持类型一致，仅切换该语言对应的实际字体族。摘要（列表项 excerpt 与详情页摘要卡片）SHALL 复用正文角色 `--font-body`（与正文同一字体矩阵，不新增角色），字重 400，不复用衬线（宋体/楷体）样式。

#### Scenario: 每种语言应用对应字体

- **WHEN** 分别访问 zh、zh-Hant、en、ja、ko、ar 等语言的页面
- **THEN** 每个页面按其语言应用对应字体族：正文角色按语言差异化（中文无衬线黑体、拉丁与日韩衬线、阿文 Naskh 现状），标题/代码/导航的角色类型在语言间保持一致

#### Scenario: 单一语言内角色可区分

- **WHEN** 查看任一语言的页面
- **THEN** 正文与标题、代码的字体可区分（字体类型或字重/字号），导航等宽角色的拉丁字符与正文拉丁字符在视觉上可区分

#### Scenario: 摘要与正文同字体角色

- **WHEN** 查看文章列表页的摘要（excerpt）或详情页的摘要卡片
- **THEN** 摘要使用正文角色 `--font-body`（与正文同一字体矩阵：中文黑体、拉丁/日韩衬线、阿文 Naskh 现状），字重 400，不复用衬线（宋体/楷体）样式

### Requirement: 语言字体映射

系统 SHALL 为每种语言配置独立的字体族映射，正文角色按语言差异化：zh 使用简体无衬线黑体族（如苹方、微软雅黑、Noto Sans SC，拉丁段 -apple-system/Roboto），zh-Hant 使用繁体无衬线黑体族（如 PingFang TC、微軟正黑體、Noto Sans TC），en / es / ru 使用拉丁衬线族（如 Georgia、Times），ja 使用日文衬线族（如 Hiragino Mincho、Noto Serif JP、Yu Mincho），ko 使用韩文衬线族（如 Nanum Myeongjo、Noto Serif KR），ar 保持 Naskh 系现状。中西文混排时，拉丁字符与 CJK 字符 SHALL 按字符自动分配对应字体，无需手工标注。

#### Scenario: zh-Hant 页面不再使用简体字形

- **WHEN** 访问 `/zh-hant/` 页面并查看中文正文
- **THEN** 中文以繁体字形字体渲染（如 PingFang TC、Noto Sans TC 等 TC 字体族），不落入简体字体

#### Scenario: 中文正文为无衬线黑体

- **WHEN** 访问 zh 页面查看中文正文
- **THEN** 中文正文以无衬线黑体渲染（苹方/微软雅黑/Noto Sans SC），不复用衬线正文样式

#### Scenario: 拉丁语言正文为衬线

- **WHEN** 访问 en 页面查看正文
- **THEN** 拉丁正文以衬线渲染（Georgia/Times，报刊惯例），与中文无衬线正文可区分

#### Scenario: 混排自动分配字体

- **WHEN** 查看同时含中文与英文（或数字）的正文段落
- **THEN** 拉丁字符与 CJK 字符分别渲染为各自字体族，无需对字符做手工语言标注
