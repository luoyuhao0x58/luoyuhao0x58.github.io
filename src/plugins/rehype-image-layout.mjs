// 图片布局插件:自动归类 + 后缀约定,支持行内小图 / 顶格大图 / 图文混排。
// 不依赖 unist-util-visit,手写递归遍历(与 rehype-heading-anchors 一致)。
//
// 语法(URL 后缀,解析后从 src 剥离):
//   无后缀     纯图片段落:单图 → 大图(image-figure,顶格铺满);连续多图 → 画廊
//              (image-row,并排一行);带文字混排 → 小图(image-inline,原尺寸不拉满)
//   #small     强制小图:独立段居中显示(行内用则等同行内小图)
//   #wide      强制大图:铺满宽度(行内位置也可用)
//   #left/#right 浮动图文:图靠左/右,文字环绕(应写在文字段内)
//   #pair      图文并排对:图 + 紧邻下一段文字并排成 flex 行
//   #row       多图并排画廊:同一段内写多个 #row 图,自动排成一行
const KEYWORDS = new Set(["small", "wide", "left", "right", "pair", "row"]);

export default function rehypeImageLayout() {
  return (tree) => {
    const pairs = [];
    const walk = (node, parent, grandparent) => {
      if (!node || typeof node !== "object") return;
      if (node.type === "element" && node.tagName === "img") {
        processImg(node, parent, grandparent, pairs);
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) walk(child, node, parent);
      }
    };
    walk(tree, null, null);
    // 收集完再合并 pair(避免遍历中改树)
    for (const item of pairs) mergePair(item);
  };
}

// 解析后缀、设 class、从 src 剥离 fragment
function processImg(node, parent, grandparent, pairs) {
  const props = node.properties || (node.properties = {});
  const src = props.src || "";
  let keyword = "";
  const m = String(src).match(/#([A-Za-z]+)$/);
  if (m && KEYWORDS.has(m[1])) {
    keyword = m[1];
    props.src = src.slice(0, m.index);
  }

  const cls = [];
  if (keyword) {
    // 大图统一用 image-figure;small 用 image-small;其余按名
    cls.push(keyword === "wide" ? "image-figure" : keyword === "small" ? "image-small" : `image-${keyword}`);
  } else {
    // 纯图片段落:单图 → 顶格大图;多图连续 → 并排画廊;带文字 → 行内小图
    const cnt = countImagesInParagraph(parent, grandparent);
    if (cnt <= 0) cls.push("image-inline");
    else if (cnt === 1) cls.push("image-figure");
    else cls.push("image-row");
  }
  const existing = props.className ? (Array.isArray(props.className) ? props.className : [props.className]) : [];
  props.className = existing.concat(cls);

  // pair:记录图所在段落,供合并
  if (keyword === "pair") {
    const p = parent && parent.type === "element" && parent.tagName === "p"
      ? parent
      : parent && parent.type === "element" && parent.tagName === "a" && grandparent && grandparent.type === "element" && grandparent.tagName === "p"
        ? grandparent
        : null;
    if (p) pairs.push({ pParent: parent === p ? grandparent : parent, p });
  }
}

// 统计 img 所在"图片段落"内的图片总数(允许包一层 a 链接):
//   <0 或 0 → 非纯图片段落(无 p / 文字混排)
//   1 → 单图独立段;≥2 → 连续多图段
// 注意:带文字混排的段落返回 -1(而非图片数),避免多图+文字被误判为画廊。
function countImagesInParagraph(parent, grandparent) {
  let p = null;
  if (parent && parent.type === "element") {
    if (parent.tagName === "p") p = parent;
    else if (parent.tagName === "a" && grandparent && grandparent.type === "element" && grandparent.tagName === "p") p = grandparent;
  }
  if (!p) return 0;
  // 段落内是否混有文字/其他元素
  const hasOther = p.children.some((c) => {
    if (c.type === "text") return c.value.trim() !== "";
    if (c.type !== "element") return true;
    if (c.tagName === "img") return false;
    if (c.tagName === "a") {
      const ak = c.children.filter((x) => x.type !== "text" || x.value.trim() !== "");
      return !(ak.length === 1 && ak[0].type === "element" && ak[0].tagName === "img");
    }
    return true;
  });
  if (hasOther) return -1;
  // 数段内所有 img
  let count = 0;
  const walk = (n) => {
    if (!n || typeof n !== "object") return;
    if (n.type === "element" && n.tagName === "img") count++;
    if (Array.isArray(n.children)) for (const c of n.children) walk(c);
  };
  walk(p);
  return count;
}

// 图文并排对:把图段 p 与紧邻的下一段文字 p 包进 <div class="image-pair">
// 注意:markdown 块之间可能夹空白 text 节点(\n),要跳过它们找真正的下一个块
function mergePair({ pParent, p }) {
  if (!pParent || !Array.isArray(pParent.children)) return;
  const siblings = pParent.children;
  const idx = siblings.indexOf(p);
  if (idx < 0) return;
  let nextIdx = idx + 1;
  while (nextIdx < siblings.length) {
    const s = siblings[nextIdx];
    if (s.type === "text" && !s.value.trim()) {
      nextIdx++;
      continue;
    }
    break;
  }
  const next = siblings[nextIdx];
  // 只合并紧邻的段落;next 必须是普通文字段(避免吞掉标题/引用/另一个图段)
  if (!next || next.type !== "element" || next.tagName !== "p") return;
  if (next.children.some((c) => c.type === "element" && c.tagName === "img")) return;
  const div = {
    type: "element",
    tagName: "div",
    properties: { className: ["image-pair"] },
    children: [p, next],
  };
  siblings.splice(idx, nextIdx - idx + 1, div);
}
