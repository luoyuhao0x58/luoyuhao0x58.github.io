// Mermaid 懒加载渲染:无图页面不引入运行时。
// 单套渲染一次:颜色由 .mermaid-container 的 CSS 规则用令牌变量实时覆盖,
// 黑白/手动切换主题时无需重新渲染,图表颜色即时跟随。
(async () => {
  const pres = Array.from(
    document.querySelectorAll('pre[data-language="mermaid"]'),
  );
  if (pres.length === 0) return;

  const { default: mermaid } = await import("mermaid");

  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    themeVariables: {
      fontFamily: "var(--font-sans)",
      fontSize: "14px",
    },
  });

  for (const pre of pres) {
    const code = pre.querySelector("code");
    const source = (code ?? pre).textContent ?? "";
    try {
      const { svg, bindFunctions } = await mermaid.render(
        `mmd-${Math.random().toString(36).slice(2)}`,
        source,
      );
      pre.innerHTML = svg;
      bindFunctions?.(pre);
      // 清除 Shiki 的内联亮色背景,让主题令牌生效
      pre.style.removeProperty("background-color");
      pre.style.removeProperty("color");
      pre.classList.add("mermaid-container");
    } catch (err) {
      console.error("[mermaid] render failed", err);
    }
  }
})();
