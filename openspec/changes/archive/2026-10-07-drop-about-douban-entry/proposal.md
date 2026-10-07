## Why

活动 spec `openspec/specs/personal-pages/spec.md` 的三处承诺"豆瓣书影音入口"：Purpose（L3）、关于页 Requirement 正文（L9）与"关于页完整展示"场景的 THEN（L14）。代码实现已决定放弃该需求——about 页不渲染豆瓣书影音入口，相关代码侧死字段（content schema 的 `socials/douban`、i18n 的 `doubanTitle`）已由实现侧删除完毕。本 change 将 spec 层面的豆瓣措辞一并归档移除，使 spec 与实现一致。

社交账号相关措辞保持不动：about 页硬编码渲染 Email/GitHub chips，已满足 spec 中"社交账号"的承诺，无需任何 spec 改动。

## What Changes

- `personal-pages` 活动 spec 的 Purpose、关于页 Requirement 正文、"关于页完整展示"场景 THEN 中删除"豆瓣书影音入口"措辞
- 关于页 Requirement 收窄为"页面 SHALL 展示站长非隐私介绍、技术能力、喜好与社交账号"
- 仅删除豆瓣措辞，社交账号相关措辞与其余 Requirement/Scenario 全部保持原样
- 无任何代码改动（代码侧已完成）

## Capabilities

### New Capabilities

<!-- 无新增 capability -->

### Modified Capabilities

- `personal-pages`: 关于页从"社交账号与豆瓣书影音入口"收窄为"社交账号"，移除豆瓣书影音入口承诺

## Impact

- `openspec/specs/personal-pages/spec.md`：Purpose、关于页 Requirement 正文与"关于页完整展示"场景 THEN 去除豆瓣措辞
- 无代码、无 schema、无 i18n 改动（代码侧已由实现任务完成）
