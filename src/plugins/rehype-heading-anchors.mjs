// 标题锚点插件:统一接管正文 h1-h6 的锚点 id,保证多语言锚点一致。
// 不依赖 unist-util-visit,手写递归遍历。
//
// 规则:
//   - 正文所有 h1-h6 都生成锚点(前置 .heading-anchor 链接,悬停显示 #)
//   - 锚点 id:6 位纯小写字母(字符集去掉易混淆的 i/l/o),由文章内标题序号
//     经「双射仿射变换」得出——序号仍从 1 自上而下递增,展示为看似随机的 6 位串;
//     种子 = 文章 slug(源文件名去扩展名,跨语言一致)→ 同文章不同语言锚点完全一致,
//     且构建重建稳定;双射保证同文内任意两个不同序号 id 必不同(零碰撞)
//   - sr-only 标题(remark-gfm 脚注自动生成的 h2 "Footnotes" 等)跳过:
//     不生成锚点、不设正规模 id → 目录按 6 位字符集正则排除
//   - 文章主标题(layout 的 h1#post-title)不在 markdown 内容中,不经过本插件

const CHARSET = "abcdefghjkmnpqrstuvwxyz"; // 23 个纯小写字母,去掉易混淆的 i/l/o
const L = CHARSET.length; // 23(质数)
const M = L ** 6; // 148,035,889:双射空间(序号 < M 即零碰撞)
const MB = BigInt(M);

// FNV-1a 32 位哈希(确定性,从 slug 派生种子)
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// 由 slug 派生双射仿射参数 (a, b):x = (a·n + b) mod M,n 为序号(1 起)。
// a 与 M 互质(M = 23^6,23 为质数 → 只需 a 非 23 的倍数且非 0)→ 双射,零碰撞。
// 同 slug → 同 (a,b) → 同文章跨语言锚点一致。
function deriveParams(slug) {
  const seed = fnv1a(slug);
  let a = (BigInt(seed) * 2654435761n + 1n) % MB;
  while (a % BigInt(L) === 0n || a === 0n) a = (a + 1n) % MB;
  const b = (BigInt(fnv1a(slug + ":offset")) * 40503n + 12345n) % MB;
  return { a, b };
}

// 序号 n → 6 位 base-23 字符(固定长度,前导可补字符集首位)
function encodeId(n, a, b) {
  let v = (a * BigInt(n) + b) % MB;
  let code = "";
  for (let i = 0; i < 6; i++) {
    code = CHARSET[Number(v % BigInt(L))] + code;
    v /= BigInt(L);
  }
  return code;
}

// 从 rehype 的 VFile 取文章 slug:源文件名去扩展名(zh/en/ja 同文章 basename 一致)。
// 拿不到路径(异常路径)返回空串 → 退化为固定种子,跨文章映射相同,但文章内仍零碰撞。
function deriveSlug(file) {
  const p = file && (file.path || (file.history && file.history[0]));
  if (!p) return "";
  const base = String(p).split(/[\\/]/).pop() || "";
  return base.replace(/\.[^.]+$/, "");
}

export default function rehypeHeadingAnchors() {
  return (tree, file) => {
    let counter = 0;
    const { a, b } = deriveParams(deriveSlug(file));
    // 关于页(路径含 /about/)正文不做锚链接,其余 markdown(文章正文)照常。
    const p = String((file && (file.path || (file.history && file.history[0]))) || "");
    const isAbout = /[\\/]about[\\/]/.test(p);
    const visit = (node) => {
      if (!node || typeof node !== "object") return;
      if (!isAbout && node.type === "element" && /^h[1-6]$/.test(node.tagName)) {
        const props = node.properties || (node.properties = {});
        const cls = props.className;
        const srOnly =
          cls &&
          (Array.isArray(cls) ? cls.includes("sr-only") : String(cls).split(/\s+/).includes("sr-only"));
        if (srOnly) {
          // 脚注自动标题等:不生成锚点、不分配 id(Astro 会用文本生成 slug,
          // 目录按 6 位字符集正则过滤即可排除)
          delete props.id;
        } else {
          counter++;
          props.id = encodeId(counter, a, b);
          const children = node.children || [];
          // 标题内已有链接(嵌套 a 不合法):仅保留 § 图标锚点
          const hasInnerLink = children.some(
            (c) => c.type === "element" && c.tagName === "a",
          );
          if (hasInnerLink) {
            node.children = [anchorNode(props.id), ...children];
          } else {
            // 标题文本整体包成链接:点击跳锚点(方便手机端);CSS 指针保持默认手型
            node.children = [
              anchorNode(props.id),
              {
                type: "element",
                tagName: "a",
                properties: { href: "#" + props.id, class: "heading-link" },
                children,
              },
            ];
          }
        }
      }
      // 图片禁止拖拽(Firefox 等需 draggable="false" 属性,WebKit 再配合 CSS)
      if (node.type === "element" && node.tagName === "img") {
        const props = node.properties || (node.properties = {});
        props.draggable = "false";
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) visit(child);
      }
    };
    visit(tree);
  };
}

function anchorNode(id) {
  return {
    type: "element",
    tagName: "a",
    properties: {
      href: "#" + id,
      class: "heading-anchor",
      "aria-hidden": "true",
      tabindex: "-1",
    },
    // 空元素:图标由 CSS ::before 渲染,避免文本节点污染标题提取
    children: [],
  };
}
