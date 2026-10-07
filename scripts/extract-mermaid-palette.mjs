// Mermaid 色板生成脚本:用无头 Chromium 渲染 mermaid 官方 redux 主题
// (redux-color 白天 / redux-dark-color 黑夜),对真实 DOM 元素 getComputedStyle
// 取实际渲染色(用户所见即所得),生成 src/styles/mermaid-palette.css。
//
// 用法:pnpm exec node scripts/extract-mermaid-palette.mjs
// 依赖:devDependency playwright(需先 pnpm exec playwright install chromium)
//
// 注意:构建机需装 CJK 字体(中文标签宽度测量),与 rehype-mermaid-ssr 相同。

import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
// 规范化去掉尾部路径分隔符,保证前缀比较(projectRoot + path.sep)在 Windows
// 上不会出现双分隔符误判。
const rootDir = path.resolve(projectRoot);

// 静态服务只允许读取 projectRoot 内的文件(与 rehype-mermaid-ssr.mjs 相同的
// 路径遍历防护):path.resolve 把 ../ 归一化后断言结果仍在 rootDir 内,
// 越权路径(如 /../../../../etc/passwd)返回 null → 404。
function resolveInsideRoot(pathname) {
  // 前导 "." 把以 "/" 开头的 URL 路径转成相对路径,避免 path.resolve 当作
  // 绝对路径重置到文件系统根(丢掉 projectRoot)。
  const filePath = path.resolve(rootDir, "." + decodeURIComponent(pathname));
  if (filePath !== rootDir && !filePath.startsWith(rootDir + path.sep)) {
    return null;
  }
  return filePath;
}

const server = createServer((req, res) => {
  const u = new URL(req.url, "http://127.0.0.1");
  if (u.pathname === "/") {
    res.setHeader("Content-Type", "text/html");
    res.end("<!doctype html><html><body></body></html>");
    return;
  }
  try {
    const filePath = resolveInsideRoot(u.pathname);
    if (filePath === null) {
      res.statusCode = 404;
      res.end();
      return;
    }
    res.setHeader("Content-Type", "text/javascript");
    res.end(readFileSync(filePath));
  } catch {
    res.statusCode = 404;
    res.end();
  }
});

const FLOW = `flowchart LR\n  A[Start] --> B{Ready?}\n  B -- Yes --> C[Run task]\n  B -- No --> D[Wait]\n  C --> E[End]`;
const SEQ = `sequenceDiagram\n  participant User\n  participant Server\n  User->>Server: Send request\n  activate Server\n  Server-->>User: Return result`;
// 8 个 actor 拿全色轮(橙/青/紫…),验证 actor 多彩分配顺序
const WHEEL = `sequenceDiagram\n  participant A0\n  participant A1\n  participant A2\n  participant A3\n  participant A4\n  participant A5\n  participant A6\n  participant A7\n  A0->>A1: 1\n  A2->>A3: 2\n  A4->>A5: 3\n  A6->>A7: 4`;

// 从渲染的 svg 提取元素计算色(在页面里取,最接近用户所见)
const extract = (page, code, theme) =>
  page.evaluate(
    async ({ code, theme }) => {
      const { default: mermaid } = await import(
        "/node_modules/mermaid/dist/mermaid.esm.mjs"
      );
      mermaid.initialize({ startOnLoad: false, theme });
      const { svg } = await mermaid.render(
        "p-" + Math.random().toString(36).slice(2),
        code,
      );
      const host = document.createElement("div");
      host.innerHTML = svg;
      document.body.appendChild(host);
      const S = host.querySelector("svg");
      const get = (sel, prop, fallback = null) => {
        const el = S.querySelector(sel);
        return el ? getComputedStyle(el)[prop] : fallback;
      };
      const isSeq = code.includes("participant");
      const out = {
        nodeFill: get(".node rect", "fill"),
        nodeStroke: get(".node rect", "stroke"),
        edge: get(".edgePath .path", "stroke") || get(".flowchart-link", "stroke"),
        nodeText: get(".node text", "fill") || get(".nodeLabel", "color") || get("text", "fill"),
        actorFill: get("rect.actor", "fill"),
        actorStroke: get("rect.actor", "stroke"),
        actorText: get("text.actor", "fill"),
        actorTextStroke: get("text.actor", "stroke"),
        messageText: get("text.messageText", "fill"),
      };
      if (isSeq) {
        // 色轮:按 actor 声明顺序(name 排序, DOM 顺序是反的)提取每个 actor 色
        const seen = [];
        S.querySelectorAll("rect.actor.actor-bottom").forEach((el) => {
          const name = el.getAttribute("name");
          if (!seen.some((x) => x.name === name)) {
            const cs = getComputedStyle(el);
            seen.push({ name, fill: cs.fill, stroke: cs.stroke });
          }
        });
        seen.sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));
        for (let i = 0; i < 8; i++) {
          out[`actor${i}Fill`] = seen[i]?.fill ?? null;
          out[`actor${i}Stroke`] = seen[i]?.stroke ?? null;
        }
      }
      host.remove();
      return out;
    },
    { code, theme },
  );

server.listen(0, "127.0.0.1", async () => {
  const port = server.address().port;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/`);

  const palette = {};
  for (const theme of ["redux-color", "redux-dark-color"]) {
    const flowVals = await extract(page, FLOW, theme);
    const seqVals = await extract(page, SEQ, theme);
    const wheelVals = await extract(page, WHEEL, theme);
    // 基础色:flow 取节点/连线,seq 取 actor/消息;色轮取 wheel(按声明序)
    const p = {
      nodeFill: flowVals.nodeFill,
      nodeStroke: flowVals.nodeStroke,
      edge: flowVals.edge,
      nodeText: flowVals.nodeText,
      actorFill: seqVals.actorFill,
      actorStroke: seqVals.actorStroke,
      actorText: seqVals.actorText,
      actorTextStroke: seqVals.actorTextStroke,
      messageText: seqVals.messageText,
    };
    for (let i = 0; i < 8; i++) {
      p[`actor${i}Fill`] = wheelVals[`actor${i}Fill`];
      p[`actor${i}Stroke`] = wheelVals[`actor${i}Stroke`];
    }
    // 补充:activation/note 从渲染 style 块确认的官方值(hsl 负角度已换算)
    const EXTRA =
      theme === "redux-color"
        ? { activation: "hsl(240 0% 80%)", noteFill: "#fff5ad", noteStroke: "#FACC15", noteText: "#28253D", edgeLabelBkg: "hsl(240 0% 80%)" }
        : { activation: "hsl(180 1.6% 28%)", noteFill: "#FEF9C3", noteStroke: "#FACC15", noteText: "#28253D", edgeLabelBkg: "hsl(180 1.6% 28%)" };
    Object.assign(p, EXTRA);
    palette[theme] = p;
  }

  // 生成 CSS(键顺序固定:基础键 + actor 色轮)
  const baseKeys = ["nodeFill", "nodeStroke", "edge", "nodeText", "actorFill", "actorStroke", "actorText", "actorTextStroke", "activation", "noteFill", "noteStroke", "noteText", "edgeLabelBkg"];
  const wheelKeys = Array.from({ length: 8 }, (_, i) => [`actor${i}Fill`, `actor${i}Stroke`]).flat();
  const keys = [...baseKeys, ...wheelKeys];

  // 深色值单源:--mmd-dark-* 变量组定义一次,:root[data-theme="dark"] 与
  // @media(prefers-color-scheme: dark) 两分支共同引用,不再逐字复制。
  let css = `/* 自动生成:scripts/extract-mermaid-palette.mjs 从 mermaid redux 主题渲染结果
 * 提取实际渲染色(用户所见),勿手改。svg 以 base 主题渲染,mermaid.css 用变量覆盖。
 * actor 色轮:redux 官方时序 actor 多彩分配,插件按 name 编 data-mmd-actor 序号。 */
:root {\n`;
  for (const k of keys) css += `  --mmd-${k}: ${palette["redux-color"][k]};\n`;
  css += `\n  /* 深色值单源(--mmd-dark-* 变量组):auto/manual 两分支共同引用 */\n`;
  for (const k of keys) css += `  --mmd-dark-${k}: ${palette["redux-dark-color"][k]};\n`;
  css += `}\n\n:root[data-theme="dark"] {\n`;
  for (const k of keys) css += `  --mmd-${k}: var(--mmd-dark-${k});\n`;
  css += `}\n\n@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]):not([data-theme="dark"]) {\n`;
  for (const k of keys) css += `    --mmd-${k}: var(--mmd-dark-${k});\n`;
  css += `  }\n}\n`;

  writeFileSync(path.join(projectRoot, "src/styles/mermaid-palette.css"), css);
  console.log(`已生成 ${keys.length} 个变量 → src/styles/mermaid-palette.css`);
  for (const k of ["nodeFill", "nodeStroke", "actor0Stroke", "actor1Stroke", "actor2Stroke"]) {
    console.log(`  ${k}: light=${palette["redux-color"][k]} dark=${palette["redux-dark-color"][k]}`);
  }
  await browser.close();
  server.close();
});
