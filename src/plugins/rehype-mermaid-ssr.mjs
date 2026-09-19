// Mermaid 构建期渲染插件:用无头 Chromium + js-mermaid 在构建时把
// ```mermaid 代码块渲染成 SVG 字符串内嵌页面,客户端零 mermaid 运行时
// 下载、无实时渲染等待。
//
// 为什么用真实浏览器(而非 jsdom/happy-dom/svgdom):
//   mermaid 渲染强依赖 SVG 测量(getBBox / getComputedTextLength),
//   纯 JS DOM 实现全部缺失,实测渲染出空 SVG 或直接抛错。
//
// 为什么用 js-mermaid(而非 mermaid-rs):
//   ① svg 结构带 .node/.actor/.edgePath 等类名 → 现有 mermaid.css 的
//      令牌变量覆盖直接生效,深浅主题自适应保留;
//   ② 渲染引擎与旧客户端方案完全一致,视觉零差异。
//   mermaid-rs 实测:themeOverrides 传 CSS 变量进不了 svg(颜色写死),
//   且节点无类名,现有主题覆盖体系全部失效。
//
// 渲染引擎与旧客户端方案一致(theme: base),颜色由 mermaid.css 的
// !important 规则用 CSS 变量覆盖 → 主题切换即时跟随,无需重新渲染。

import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

// 项目根(src/plugins/ → 上两级),用于静态服务 node_modules/mermaid
const projectRoot = fileURLToPath(new URL("../../", import.meta.url));

// 模块级单例:浏览器 + 本地静态服务(构建期无网,浏览器从本地加载 mermaid 模块)。
// 懒启动——只有含 mermaid 的页面才起浏览器;构建进程退出时自动关闭。
let browserPromise = null;
let serverPromise = null;

function getServer() {
  if (!serverPromise) {
    serverPromise = new Promise((resolve, reject) => {
      const server = createServer((req, res) => {
        const u = new URL(req.url, "http://127.0.0.1");
        if (u.pathname === "/") {
          res.setHeader("Content-Type", "text/html");
          res.end("<!doctype html><html><body></body></html>");
          return;
        }
        try {
          const body = readFileSync(
            path.join(projectRoot, decodeURIComponent(u.pathname)),
          );
          res.setHeader("Content-Type", "text/javascript");
          res.end(body);
        } catch {
          res.statusCode = 404;
          res.end();
        }
      });
      server.listen(0, "127.0.0.1", () => {
        resolve({ port: server.address().port, server });
      });
      server.on("error", (err) => {
        serverPromise = null;
        reject(err);
      });
    });
  }
  return serverPromise;
}

function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium
      .launch({ headless: true })
      .catch((err) => {
        // 启动失败允许后续重试(比如 CI 首次并发下载)
        browserPromise = null;
        throw err;
      });
    process.once("exit", () => {
      browserPromise?.then((b) => b.close().catch(() => {})).catch(() => {});
    });
  }
  return browserPromise;
}

// 单主题渲染:svg 以 base 主题(中性色)渲染,**配色由 mermaid.css 类覆盖**——
// 色板取自 redux 官方两套配色(redux-color 白天 / redux-dark-color 黑夜,
// 见 src/styles/mermaid-palette.css),深浅主题靠 CSS 变量切换,同一份 svg 即自适应。
// 不用双 svg 方案:HTML 体积减半,主题切换纯 CSS 零 JS。

/** 批量渲染:一次页面会话加载 mermaid 模块,逐图渲染(浏览器只启动一次) */
async function renderAll(sources) {
  const browser = await getBrowser();
  const { port } = await getServer();
  const page = await browser.newPage();
  try {
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "load" });
    return await page.evaluate(async (list) => {
      const { default: mermaid } = await import(
        "/node_modules/mermaid/dist/mermaid.esm.mjs"
      );
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        // 字体栈写进 svg 的 style 块(var() 由用户浏览器解析),与正文观感一致;
        // 颜色不在此覆盖——由 mermaid.css 用 --mmd-* 色板变量统一处理
        themeVariables: {
          fontFamily: "var(--font-sans)",
          fontSize: "14px",
        },
      });
      const out = [];
      for (const src of list) {
        try {
          const { svg } = await mermaid.render(
            "mmd-" + Math.random().toString(36).slice(2),
            src,
          );
          out.push({ ok: true, svg });
        } catch (err) {
          out.push({ ok: false, error: String((err && err.message) || err) });
        }
      }
      return out;
    }, sources);
  } finally {
    await page.close();
  }
}

export default function rehypeMermaidSsr() {
  return async (tree) => {
    // 收集 <pre><code class="language-mermaid">…</code></pre>
    // (本插件在 Astro Shiki 高亮之前运行,匹配 code 的语言 class)
    const targets = [];
    const visit = (node) => {
      if (!node || typeof node !== "object") return;
      if (
        node.type === "element" &&
        node.tagName === "pre" &&
        // Astro 管线中 rehype 插件在 Shiki 之后运行,此时 pre 已有 dataLanguage 属性
        // (客户端旧方案也用 pre[data-language="mermaid"] 选择器,二者一致)
        node.properties?.dataLanguage === "mermaid"
      ) {
        const code = node.children.find(
          (c) => c.type === "element" && c.tagName === "code",
        );
        targets.push({ node, code: code ?? node });
        return;
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) visit(child);
      }
    };
    visit(tree);
    if (targets.length === 0) return;

    const sources = targets.map(({ code }) => textOf(code));
    const results = await renderAll(sources);
    targets.forEach(({ node }, i) => {
      const r = results[i];
      if (!r?.ok) {
        // 渲染失败:保留原代码块(至少源码可见)
        console.warn(
          "[rehype-mermaid-ssr] 渲染失败,保留源码:",
          r?.error ?? "unknown",
        );
        return;
      }
      // 给时序 actor 编号(data-mmd-actor):redux 官方 actor 是多彩色轮
      // (橙/青/紫…),CSS 按索引覆盖才能还原,而非统一单色
      const svg = numberActors(r.svg);
      // 输出与旧方案一致的容器结构:
      // <pre class="mermaid-container"><svg>…</svg></pre>
      // 配色由 mermaid.css 类覆盖(色板变量 --mmd-* 深浅自适应)
      node.type = "raw";
      node.value = `<pre class="mermaid-container">${svg}</pre>`;
      delete node.tagName;
      delete node.properties;
      delete node.children;
    });
  };
}

function textOf(node) {
  let out = "";
  const walk = (n) => {
    if (!n || typeof n !== "object") return;
    if (n.type === "text") out += n.value;
    if (Array.isArray(n.children)) for (const c of n.children) walk(c);
  };
  walk(node);
  return out;
}

/** 给时序 actor 盒子加 data-mmd-actor 序号(按 name 首次出现顺序,同一 actor 的
 *  top/bottom 同号)。CSS 据此用 redux 色轮覆盖,还原多彩 actor。 */
function numberActors(svg) {
  const seen = new Map();
  let next = 0;
  return svg.replace(
    /<rect([^>]*class="actor actor-(?:top|bottom)"[^>]*)>/g,
    (full, attrs) => {
      const name = attrs.match(/name="([^"]*)"/)?.[1] ?? "";
      let idx = seen.get(name);
      if (idx === undefined) {
        idx = next++;
        seen.set(name, idx);
      }
      return `<rect${attrs} data-mmd-actor="${idx}">`;
    },
  );
}
