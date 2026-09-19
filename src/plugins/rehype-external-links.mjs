// 外部链接新标签页插件:给正文所有指向站外的链接(http/https)加
// target="_blank" + rel="noopener noreferrer"(防 window.opener 劫持)。
// 站内锚点(# 开头)、相对链接不动;与 rehype-heading-anchors 生成的
// 标题锚点链接互不冲突(后者 href 是 # 开头)。
// 不依赖 unist-util-visit,手写递归遍历,风格与同目录其他插件一致。

const EXTERNAL_RE = /^https?:\/\//i;

export default function rehypeExternalLinks() {
  return (tree) => {
    const visit = (node) => {
      if (!node || typeof node !== "object") return;
      if (node.type === "element" && node.tagName === "a") {
        const props = node.properties || (node.properties = {});
        const href = props.href;
        if (typeof href === "string" && EXTERNAL_RE.test(href)) {
          props.target = "_blank";
          // 合并已有 rel(若未来有插件先设置了 rel),不覆盖
          const rel = props.rel;
          const extra = "noopener noreferrer";
          if (typeof rel === "string") {
            if (!rel.split(/\s+/).includes("noopener")) props.rel = `${rel} ${extra}`;
          } else if (Array.isArray(rel)) {
            if (!rel.includes("noopener")) props.rel = [...rel, ...extra.split(" ")];
          } else {
            props.rel = extra;
          }
        }
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) visit(child);
      }
    };
    visit(tree);
  };
}
