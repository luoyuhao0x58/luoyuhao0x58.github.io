// 标题锚点插件:统一接管正文 h1-h6 的锚点 id,保证多语言锚点一致。
// 不依赖 unist-util-visit,手写递归遍历。
//
// 规则:
//   - 正文所有 h1-h6 都生成锚点(前置 .heading-anchor 链接,悬停显示 #)
//   - 锚点 id 用 s + 5 位递增数字(从 1 开始、自上而下):s00001、s00002…
//     (不用标题文本 slug,多语言除语言代号外锚点部分完全一致)
//   - sr-only 标题(remark-gfm 脚注自动生成的 h2 "Footnotes" 等)跳过:
//     不生成锚点、不设正规模 id → 目录按 id 正则排除
//   - 文章主标题(layout 的 h1#post-title)不在 markdown 内容中,不经过本插件
export default function rehypeHeadingAnchors() {
  return (tree) => {
    let counter = 0;
    const visit = (node) => {
      if (!node || typeof node !== "object") return;
      if (node.type === "element" && /^h[1-6]$/.test(node.tagName)) {
        const props = node.properties || (node.properties = {});
        const cls = props.className;
        const srOnly =
          cls &&
          (Array.isArray(cls) ? cls.includes("sr-only") : String(cls).split(/\s+/).includes("sr-only"));
        if (srOnly) {
          // 脚注自动标题等:不生成锚点、不分配 id(Astro 会用文本生成 slug,
          // 目录按 s+5位数字 正则过滤即可排除)
          delete props.id;
        } else {
          counter++;
          props.id = `s${String(counter).padStart(5, "0")}`;
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
