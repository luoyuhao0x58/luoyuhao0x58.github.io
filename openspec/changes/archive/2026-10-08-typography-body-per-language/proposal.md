## Why

中文正文"边缘发虚发糊"的根源有二，均已由 tester 像素级验证：① 正文命中系统字体回退后落到低质量 CJK 字体（渲染边缘不锐利）；② 现行正文 CJK-Strong 机制用 `font-weight: 500` 对 CJK 字符独立加粗以拉齐视觉重量，但该合成加粗在 Chromium 是 no-op（`font-synthesis-weight` 合成在 Chromium 不生效、系统宋体/明朝体无真实 500 字重可用），效果未兑现却引入了依赖合成字重的机制。

决策依据（用户拍板）：antd 字体方案启示（系统字体优先、避免依赖合成字重）；拉丁语言沿用报刊衬线惯例（en/es/ru 用 Georgia/Times）；日文/韩文衬线字体本地质量高（Hiragino Mincho / Noto Serif JP / Yu Mincho、Nanum Myeongjo / Noto Serif KR）故保留衬线；阿拉伯文保持现有 Naskh 系不变。因此正文角色改为按语言差异化，删除合成加粗机制，正文字重回归 400。

## What Changes

- **正文角色按语言差异化**（本次核心）：zh / zh-Hant 使用无衬线黑体（苹方/微软雅黑/Noto Sans SC，zh-Hant 为 PingFang TC/微軟正黑體/Noto Sans TC）；en / es / ru 拉丁语言使用衬线（Georgia/Times，报刊惯例）；ja 使用衬线（Hiragino Mincho/Noto Serif JP/Yu Mincho，质量高保留）；ko 使用衬线（Nanum Myeongjo/Noto Serif KR，质量高保留）；ar 保持现状（Naskh 系）。
- **新增 `--font-body` 角色变量**：默认无衬线栈服务 zh，`html[lang]` 覆盖块按语言差异化（拉丁/日韩切衬线、阿文保持现状）。
- **删除 CJK-Strong 机制**：移除 `article.css` 中 `CJK-Strong` `@font-face` 块与 `font-synthesis-weight` 依赖（Chromium no-op，且与"不依赖合成字重"约束冲突）。
- **正文 `font-weight` 回归 400**：正文不再使用 500 合成加粗，各语言正文按各自字体族原生字重渲染。
- **修正 spec 既有偏差**：现行 spec 写"正文（无衬线）、标题（衬线）"，与实现（正文衬线、标题无衬线）相反；本次按 v2 矩阵改为"正文按语言差异化、标题无衬线"，描述与实现意图一致。
- **约束不变**：零字体加载（无自托管 webfont、无网络字体请求）、各平台系统字体本地最优、不依赖 font-synthesis 合成字重。

## Capabilities

### New Capabilities

（无。本变更不引入新 spec，仅修订既有 `typography` 能力。）

### Modified Capabilities

- `typography`: "字体角色矩阵"与"语言字体映射"两条 Requirement 变更——正文角色由"跨语言类型一致（无衬线）"改为"按语言差异化（中文无衬线、拉丁/日韩衬线、阿文 Naskh 现状）"，删除"同一角色在不同语言下保持类型一致"表述；修正"正文（无衬线）"与实现相反的既有偏差；语言范围扩展至 zh/zh-Hant/en/es/ru/ja/ko/ar。

## Impact

- **代码**：`src/styles/tokens.css`（新增 `--font-body` 角色变量与各语言覆盖）、`src/styles/article.css`（删除 `CJK-Strong` `@font-face` 与正文 500/font-synthesis、正文切 `--font-body` 并回归 400）。仅由另一线程（code.worker）实施，本变更不直接修改 `src/`。
- **规格**：`openspec/specs/typography/spec.md`（字体角色矩阵、语言字体映射条款修订）。
- **资源**：无新增字体文件（系统字体栈零加载，约束不变）。
- **依赖**：无新增运行时依赖。
- **兼容性**：正文不再依赖合成字重；Chromium 下中文正文不再"边缘发虚发糊"（真实 400 字重 + 各平台本地最优字体），其他浏览器行为一致（无 font-synthesis 分支）。
