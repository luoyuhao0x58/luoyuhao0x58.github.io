// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeHeadingAnchors from "./src/plugins/rehype-heading-anchors.mjs";
import rehypeImageLayout from "./src/plugins/rehype-image-layout.mjs";
import rehypeTasklist from "./src/plugins/rehype-tasklist.mjs";
import rehypeMermaidSsr from "./src/plugins/rehype-mermaid-ssr.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://luoyuhao.nettix.top",
  i18n: {
    defaultLocale: "zh",
    locales: ["zh", "zh-Hant", "en", "es", "ja", "ko", "ar"],
    routing: {
      prefixDefaultLocale: true,
      // false: the root index.astro is our own negotiation page; the i18n middleware
      // would otherwise intercept "/" and emit a plain 302 redirect template instead.
      redirectToDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeKatex,
      rehypeHeadingAnchors,
      rehypeImageLayout,
      // 任务列表 checkbox 去 disabled(让 accent-color 生效),须在 mermaid 前
      rehypeTasklist,
      // Mermaid 构建期渲染(无头浏览器 + js-mermaid → 静态 SVG 内嵌),
      // 放最后:先由其他插件处理完结构再替换代码块
      rehypeMermaidSsr,
    ],
    shikiConfig: {
      themes: {
        light: "solarized-light",
        dark: "solarized-dark",
      },
    },
  },
});
