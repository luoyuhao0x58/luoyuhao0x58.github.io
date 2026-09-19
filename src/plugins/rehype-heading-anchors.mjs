// 给 markdown 渲染的 h2/h3/h4 前置锚点链接(悬停显示,定位到纸张左侧之外)。
// 注意:Astro 的 rehype 管线里用户插件先于 rehypeHeadingIds 运行,标题此时还没有 id。
// 因此本插件自己生成 id(自实现 slugger)并写入 node.properties.id,
// rehypeHeadingIds 见 id 已是字符串就不会覆盖——目录(TOC)用的也是这个 id,保持链接一致。
// 不依赖 unist-util-visit,手写递归遍历。图标为 `#`(GitHub 风格)。

// 近似 github-slugger:小写 → 空白/标点归一为 "-" → 去首尾 "-" → 重名加 -1/-2
function createSlugger() {
  const seen = new Map();
  return (text) => {
    let slug = String(text)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]+/gu, "-")
      .replace(/^-+|-+$/g, "");
    const count = seen.get(slug);
    if (count === undefined) {
      seen.set(slug, 0);
    } else {
      const next = count + 1;
      seen.set(slug, next);
      slug = `${slug}-${next}`;
    }
    return slug;
  };
}

// 提取标题纯文本(与 rehypeHeadingIds 一致:拼接 text/raw,跳过元素本身但递归其子节点)
function headingText(node) {
  let text = "";
  const walk = (n) => {
    if (!n || typeof n !== "object") return;
    if (n.type === "element") {
      for (const c of n.children || []) walk(c);
    } else if (n.type === "text" || n.type === "raw") {
      if (n.type === "raw" && /^\n?<.*>\n?$/.test(n.value || "")) return;
      text += n.value || "";
    }
  };
  walk(node);
  return text;
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
    // 空元素:图标由 CSS ::before 渲染,避免文本节点污染 rehypeHeadingIds 的标题提取
    children: [],
  };
}

export default function rehypeHeadingAnchors() {
  return (tree) => {
    const slug = createSlugger();
    const visit = (node) => {
      if (!node || typeof node !== "object") return;
      if (node.type === "element" && /^h[2-4]$/.test(node.tagName)) {
        const props = node.properties || (node.properties = {});
        if (typeof props.id !== "string") {
          props.id = slug(headingText(node));
        }
        node.children = [anchorNode(props.id), ...(node.children || [])];
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
