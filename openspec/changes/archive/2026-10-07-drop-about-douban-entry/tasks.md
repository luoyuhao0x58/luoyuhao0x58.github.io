## 1. spec 同步与归档

- [x] 1.1 编写 proposal.md：说明放弃 about 页豆瓣书影音入口需求（背景：spec 承诺、代码未实现、经确认放弃；社交账号措辞保持不动）——验证：`openspec validate` 通过
- [x] 1.2 编写 delta spec `specs/personal-pages/spec.md`：MODIFIED 关于页 Requirement，删除 Purpose/正文/THEN 中的豆瓣措辞——验证：`openspec validate --change 2026-10-07-drop-about-douban-entry` 通过
- [x] 1.3 `openspec archive` 将 delta 同步到活动 spec（delta 的 Purpose 对已有 capability 会被归档工具忽略，活动 spec 的 Purpose 需直接编辑对齐）——验证：活动 spec 的 L3/L9/L14 无豆瓣措辞、社交账号措辞未动
- [x] 1.4 归档后 `openspec validate` 整体通过——验证：命令退出码 0
