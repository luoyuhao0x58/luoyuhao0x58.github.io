## 1. 字体资源准备

- [x] 1.1 获取思源黑体 SC 生成 CJK 常用字 woff2 subset（3755 字，覆盖校验零缺失）放入 `public/fonts/`——**后续经真机反馈回退删除**（见 design.md D2），验证 `public/fonts/` 已不存在
- [x] 1.2 核对字体文件在构建产物中正确输出——**已随回退移除**，验证 `dist/fonts/` 不存在

## 2. 字体角色矩阵与 @font-face

- [x] 2.1 在 `src/styles/tokens.css` 定义角色 token（正文/标题/代码/导航，含 zh / zh-Hant / en 三语言映射），验证 `grep --font-` 可见新 token 且旧 token 兼容保留
- [x] 2.2 CJK 角色 `@font-face` 抽象族（local + url subset 回退）——**已随回退移除**，验证产物 CSS 无 `@font-face`/字体文件引用，系统字体栈零加载
- [x] 2.3 zh-Hant 语言映射指向 TC 字形优先字体族（PingFang TC / Noto Sans TC 等），验证 `.css` 中 zh-Hant 映射不含简体字体为首选

## 3. 字体引用切换与等宽导航

- [x] 3.1 将 `src/styles/base.css` 的 body 字体族切换到角色 token，验证页面正文应用新字体
- [x] 3.2 将标题（h2/h3/h4）字体切换到标题角色，验证与正文可区分
- [x] 3.3 导航链接（`src/components/Header.astro`）应用导航等宽角色，验证英文导航为等宽、中文导航正常方块字
- [x] 3.4 代码/代码块继续使用代码角色（mono），验证 inline code 与代码块观感不回归

## 4. 中英文混排空格

- [x] 4.1 在正文容器应用 `text-autospace: normal`（渐进增强），验证支持浏览器（Chrome/Firefox/Safari 最新版）下 CJK↔Latin 自动留白且 DOM 不变

## 5. 逻辑属性约定

- [x] 5.1 本变更新增的布局代码全部使用逻辑属性，验证无新增物理方向属性（grep 无新增 `ml-|mr-|pl-|pr-|left-|right-`）
- [x] 5.2 记录存量物理属性清单（Toc 缩进、返回顶部、语言下拉等）为已知项，不修改

## 6. 视觉回归（不变量校验）

- [x] 6.1 三语言（zh / zh-Hant / en）× 明暗两主题下核对文章图片样式不变，与变更前截图对比一致
- [x] 6.2 核对代码块顶格、破格元素顶格到纸张边缘的设计不变
- [x] 6.3 核对纸张内部边距不变（无 A4 式四边大边距），`--paper-pad-y` 与 `padding-inline` 值未改动
- [x] 6.4 核对 zh-Hant 页面中文字形不再为简体字形（视觉/截图确认）——回退后 TC 覆盖（html[lang=zh-Hant] 块）仍生效，最终字形需 macOS/Windows 真机确认

## 7. 收尾

- [x] 7.1 运行 `pnpm build` 与现有检查（lint/build）全部通过
- [x] 7.2 更新 `openspec/specs/typography/spec.md` 至正式 spec（如需求有微调，同步变更记录）
