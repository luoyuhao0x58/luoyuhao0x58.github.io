## Purpose

提供个人站点面向访客的门面页面：关于页承载站长介绍与社交账号，主页承载简介、最新文章与内容类型入口，让访客在起步阶段也能感知站点定位与内容广度。

## Requirements

### Requirement: 关于页

站点 SHALL 提供 `/<lang>/about/` 关于页，三种语言均可用。页面 SHALL 展示站长非隐私介绍、技术能力、喜好与社交账号。内容 SHALL 结构化维护，便于站长增改。

#### Scenario: 关于页完整展示

- **WHEN** 访问 `/zh/about/`
- **THEN** 页面展示站长介绍、技术能力、喜好与社交账号

#### Scenario: 关于页三语可用

- **WHEN** 分别访问 `/zh/about/`、`/zh-hant/about/`、`/en/about/`
- **THEN** 各页面展示对应语言的内容

### Requirement: 主页信息结构

主页 SHALL 包含 hero 简介区、最新文章列表与内容类型入口导航。最新文章 SHALL 取自当前语言并按发布时间倒序。

#### Scenario: 主页结构完整

- **WHEN** 访问 `/zh/`
- **THEN** 页面依次展示 hero 简介、最新文章列表与内容类型入口导航

#### Scenario: 空内容类型入口不产生 404

- **WHEN** 某内容类型下暂无可展示内容
- **THEN** 其入口仍正常渲染（指向空状态或不可用态），访问不产生 404

### Requirement: 个人页面无脚本可访问

关于页与主页内容 SHALL 在禁用 JavaScript 时完整可读、可跳转。

#### Scenario: 禁用 JavaScript 仍可访问

- **WHEN** 浏览器禁用 JavaScript
- **THEN** 关于页与主页正常渲染全部内容，链接均可点击跳转
