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
// 规范化去掉尾部路径分隔符(fileURLToPath 的目录 URL 带尾部分隔符),
// 保证下方前缀比较(projectRoot + path.sep)在 Windows 上不出现双分隔符误判。
const rootDir = path.resolve(projectRoot);

// 静态服务只允许读取 projectRoot 内的文件:
// path.resolve 会把 ../ 归一化到真实路径,再断言解析结果必须位于 rootDir 内,
// 否则视为路径遍历(如 /../../../../etc/passwd)直接返回 404。
// 前缀比较带 path.sep:既防 /foo 伪装成 /foobar 的前缀攻击,也兼容 Windows 分隔符。
function resolveInsideRoot(pathname) {
  // 前导 "." 把以 "/" 开头的 URL 路径转成相对路径,避免 path.resolve
  // 把它当作绝对路径重置到文件系统根(丢掉 projectRoot)。
  const filePath = path.resolve(rootDir, "." + decodeURIComponent(pathname));
  if (filePath !== rootDir && !filePath.startsWith(rootDir + path.sep)) {
    return null;
  }
  return filePath;
}

// 模块级单例:浏览器 + 本地静态服务 + 共享页面会话(构建期无网,浏览器从本地
// 加载 mermaid 模块)。懒启动——只有含 mermaid 的页面才起浏览器;构建进程退出
// 时自动关闭。
let browserPromise = null;
let serverPromise = null;
let pagePromise = null;
// 渲染串行队列:共享页面不能并发跑 page.evaluate,Astro 并行处理多个 markdown
// 文件时,renderAll 调用经此队列排队逐个执行。
let renderQueue = Promise.resolve();

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
          const filePath = resolveInsideRoot(u.pathname);
          if (filePath === null) {
            res.statusCode = 404;
            res.end();
            return;
          }
          const body = readFileSync(filePath);
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

// 共享页面会话:newPage + goto + import/initialize mermaid 只做一次,构建期内
// 所有含 mermaid 的文件复用同一会话渲染(性能优化:避免每文件重建页、重载模块)。
function getPage() {
  if (!pagePromise) {
    pagePromise = (async () => {
      const browser = await getBrowser();
      const { port } = await getServer();
      const page = await browser.newPage();
      try {
        await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "load" });
        // 注入站内 --font-sans 字体栈定义(var(--font-sans) 在 svg style 块里由
        // 用户浏览器解析;构建期裸页面无此变量,mermaid 用 Chromium fallback 字体
        // 测量行高/宽度,与真实渲染不一致 → 节点尺寸(高度/宽度)算错、文本被裁。
        // 注入后构建期测量与用户浏览器同字体栈,尺寸对齐。
        await page.addStyleTag({
          content:
            ':root{--font-sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";}',
        });
        // mermaid 模块只加载并 initialize 一次,之后渲染直接取 globalThis.__mmd
        await page.evaluate(async () => {
          const { default: mermaid } = await import(
            "/node_modules/mermaid/dist/mermaid.esm.mjs"
          );
          mermaid.initialize({
            startOnLoad: false,
            theme: "base",
            // 显式 securityLevel: "strict"(mermaid 默认值):渲染结果中可点击
            // 的链接跳转与 HTML 注入(点击事件/外链)一律被剥离。防御性写出,
            // 防止上游改变默认值或后续改配置时静默放开注入面。
            securityLevel: "strict",
            // 字体栈写进 svg 的 style 块(var() 由用户浏览器解析),与正文观感一致;
            // 颜色不在此覆盖——由 mermaid.css 用 --mmd-* 色板变量统一处理
            themeVariables: {
              fontFamily: "var(--font-sans)",
              fontSize: "14px",
            },
          });
          globalThis.__mmd = mermaid;
        });
        return page;
      } catch (err) {
        await page.close().catch(() => {});
        throw err;
      }
    })().catch((err) => {
      pagePromise = null; // 初始化失败允许后续重试
      throw err;
    });
  }
  return pagePromise;
}

/** 批量渲染:复用共享页面会话上的已初始化 mermaid,逐图渲染。
 *  剩余限制:rehype 插件按文件逐个调用,无法跨文件合并渲染批次,每个含
 *  mermaid 的文件仍会各发一次 page.evaluate 往返;但页面创建、goto 与
 *  mermaid 模块加载/初始化已收敛为整个构建一次。 */
async function renderAll(sources) {
  const page = await getPage();
  // 共享页面不能并发 evaluate,Astro 并行构建时经 renderQueue 排队逐个执行
  const run = () =>
    page.evaluate(async (list) => {
      const mermaid = globalThis.__mmd;
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
  const result = renderQueue.then(run, run);
  renderQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export default function rehypeMermaidSsr() {
  return async (tree) => {
    // 收集 mermaid 代码块。实际行为:Astro 管线里 rehype 插件在 Shiki 高亮
    // **之后**运行,Shiki 会给 <pre> 打上 data-language="mermaid" 属性。
    // 双保险匹配:① Shiki 处理后的形态 pre[data-language="mermaid"];
    // ② 未经过 Shiki 的源码形态 pre > code.language-mermaid。
    // 两条路都认,消除对 Astro 插件管线顺序的脆弱依赖。
    const targets = [];
    const visit = (node) => {
      if (!node || typeof node !== "object") return;
      if (
        node.type === "element" &&
        node.tagName === "pre" &&
        isMermaidBlock(node)
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
      const svg = numberActors(fixBr(r.svg));
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

/** 判断 pre 是否为 mermaid 代码块:匹配 Shiki 处理后的
 *  pre[data-language="mermaid"],或源码形态的 code.language-mermaid
 *  (className 可能是数组或空格分隔字符串)。 */
function isMermaidBlock(pre) {
  if (pre.properties?.dataLanguage === "mermaid") return true;
  const code = pre.children?.find(
    (c) => c.type === "element" && c.tagName === "code",
  );
  const className = code?.properties?.className;
  if (Array.isArray(className)) return className.includes("language-mermaid");
  return (
    typeof className === "string" &&
    className.split(/\s+/).includes("language-mermaid")
  );
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

/** 修正 mermaid 12 输出的 <br> 标签:mermaid 渲染返回单 <br>(HTML5 void 写法),
 *  但 Astro 序列化 raw 节点时会把它展开成 <br></br>,浏览器 HTML 解析把
 *  </br> 结束标签当作另一个 <br> 开始标签(HTML spec 特例),节点文本因此多出
 *  一行空行,超出 foreignObject 高度被裁剪。
 *  改为真实换行符:foreignObject 内 div 带 white-space: break-spaces,
 *  换行符在序列化后仍是普通文本,不会被展开成双 br,渲染效果等同 <br/>。 */
function fixBr(svg) {
  return (
    svg
      .replace(/<br(?:\s*\/)?>/g, "\n")
      // mermaid 对"宽度未超上限"的节点给 foreignObject 内 div 设
      // white-space: nowrap;但含 <br/> 换行的节点在 nowrap 下换行符不生效,
      // 文本被连成一行溢出节点框。统一改 break-spaces:有换行符的按换行符
      // 断行,无换行符的单行文本行为不变。
      .replace(/white-space: nowrap;/g, "white-space: break-spaces;")
  );
}

/** 给时序 actor 盒子加 data-mmd-actor 序号(按 name 首次出现顺序,同一 actor 的
 *  top/bottom 同号)。CSS 据此用 redux 色轮覆盖,还原多彩 actor。 */
function numberActors(svg) {
  const seen = new Map();
  let next = 0;
  return svg.replace(
    /<rect([^>]*class="actor actor-(?:top|bottom)"[^>]*)>/g,
    (_full, attrs) => {
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
