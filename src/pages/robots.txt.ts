import type { APIRoute } from "astro";

/**
 * robots.txt 动态生成:Sitemap 行取 Astro.site(astro.config.mjs 的 site 字段),
 * 换域名只改 astro.config.mjs 一处,robots.txt / sitemap.xml / canonical /
 * JSON-LD 全部跟随,无硬编码域名残留。
 */
export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site ?? new URL("https://luoyuhao.nettix.top");
  const sitemapUrl = new URL("/sitemap.xml", siteUrl).href;
  const body = [
    "# 全站开放收录,无需屏蔽任何路径。",
    "# 分页/语言协商页均为可抓取内容,不设 Disallow。",
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${sitemapUrl}`,
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
