// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeHeadingAnchors from "./src/plugins/rehype-heading-anchors.mjs";
import rehypeImageLayout from "./src/plugins/rehype-image-layout.mjs";
import rehypeTasklist from "./src/plugins/rehype-tasklist.mjs";
import rehypeMermaidSsr from "./src/plugins/rehype-mermaid-ssr.mjs";
import rehypeExternalLinks from "./src/plugins/rehype-external-links.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://luoyuhao.nettix.top",
  i18n: {
    defaultLocale: "zh",
    locales: ["zh", "zh-Hant", "en", "es", "ja", "ko", "ru", "ar"],
    routing: {
      prefixDefaultLocale: true,
      // false: the root index.astro is our own negotiation page; the i18n middleware
      // would otherwise intercept "/" and emit a plain 302 redirect template instead.
      redirectToDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      // vite8+rolldown 依赖扫描器把 .astro 源码当 JS 解析,冷启动误报
      // PARSE_ERROR(dev 无害、build 不受影响)。noDiscovery 跳过冷启动扫描,
      // 本站浏览器端无第三方依赖需要预构建,故可安全关闭。
      noDiscovery: true,
    },
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeKatex,
      rehypeHeadingAnchors,
      rehypeImageLayout,
      // 任务列表 checkbox 去 disabled(让 accent-color 生效),须在 mermaid 前
      rehypeTasklist,
      // 外部链接新标签页(脚注出处等站外链接),不依赖元素替换,顺序无要求
      rehypeExternalLinks,
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
