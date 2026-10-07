## Purpose

提供个人站点面向访客的门面页面：关于页承载站长介绍与社交账号，主页承载简介、最新文章与内容类型入口，让访客在起步阶段也能感知站点定位与内容广度。

## MODIFIED Requirements

### Requirement: 关于页

站点 SHALL 提供 `/<lang>/about/` 关于页，三种语言均可用。页面 SHALL 展示站长非隐私介绍、技术能力、喜好与社交账号。内容 SHALL 结构化维护，便于站长增改。

#### Scenario: 关于页完整展示

- **WHEN** 访问 `/zh/about/`
- **THEN** 页面展示站长介绍、技术能力、喜好与社交账号

#### Scenario: 关于页三语可用

- **WHEN** 分别访问 `/zh/about/`、`/zh-hant/about/`、`/en/about/`
- **THEN** 各页面展示对应语言的内容
