// 任务列表 checkbox 插件:移除 disabled 属性,让 accent-color 对选中态生效。
//
// 背景:remark-gfm 生成的任务列表 checkbox 带 disabled="",浏览器对 disabled 的
// 原生控件强制灰色、忽略 accent-color(选中勾号无法自定义颜色)。这里在构建期
// 去掉 disabled,改用 aria-disabled 保留"只读状态"语义 + tabindex=-1 移出 Tab 序,
// CSS 侧再配 pointer-events:none 保持完全不可交互。
export default function rehypeTasklist() {
  return (tree) => {
    const visit = (node) => {
      if (!node || typeof node !== "object") return;
      if (
        node.type === "element" &&
        node.tagName === "input" &&
        node.properties &&
        node.properties.type === "checkbox"
      ) {
        delete node.properties.disabled;
        node.properties["aria-disabled"] = "true";
        node.properties.tabindex = "-1";
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) visit(child);
      }
    };
    visit(tree);
  };
}
