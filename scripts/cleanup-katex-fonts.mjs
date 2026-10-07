// 构建后清理脚本:删除 dist 中 KaTeX 旧式 web 字体(.woff/.ttf/.eot),
// 只保留 .woff2。KaTeX 的 @font-face src 顺序是 woff2 → woff → ttf,
// 现代浏览器全部支持 woff2,删掉旧格式可省去数十个冗余字体文件。
//
// 用法:随 pnpm build 自动执行(package.json 的 postbuild 钩子),也可手动
// 运行 `node scripts/cleanup-katex-fonts.mjs`。
//
// 注意:不能用 `endsWith(".woff")` 判断——它也会命中 ".woff2",
// 必须用精确扩展名匹配(正则 /\.woff$/)。且只删文件名以 "KaTeX_" 开头的
// 文件,绝不误删站内将来可能出现的其他 woff/ttf 字体。

import { readdir, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const distDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "dist",
);
// KaTeX 构建产物文件名形如 "KaTeX_AMS-Regular.BQhdFMY1.woff2"。
const LEGACY_FONT_RE = /^KaTeX_.+\.(?:woff|ttf|eot)$/;

let removed = 0;

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return; // dist 不存在(如 dev 模式)时静默跳过
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
    } else if (LEGACY_FONT_RE.test(entry.name)) {
      await unlink(fullPath);
      removed += 1;
    }
  }
}

await walk(distDir);
console.log(`[cleanup-katex-fonts] removed ${removed} legacy KaTeX font file(s) from ${distDir}`);
