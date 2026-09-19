import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { languages, langPath } from "../i18n";
import { PAGE_SIZE } from "../lib/pagination";

interface SitemapEntry {
  path: string;
  lastmod?: string;
}

const CATEGORIES = ["tech", "journal"] as const;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/** Number of paginated pages for a list with the given item count (at least 1). */
function pageCount(count: number): number {
  return Math.max(1, Math.ceil(count / PAGE_SIZE));
}

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site ?? new URL("https://luoyuhao.nettix.top");
  const posts = await getCollection("blog");
  const byLang = new Map<string, typeof posts>();
  const tagsByLang = new Map<string, Set<string>>();
  for (const post of posts) {
    const list = byLang.get(post.data.lang) ?? [];
    list.push(post);
    byLang.set(post.data.lang, list);
    const tagSet = tagsByLang.get(post.data.lang) ?? new Set<string>();
    for (const tag of post.data.tags) tagSet.add(tag);
    tagsByLang.set(post.data.lang, tagSet);
  }

  const entries: SitemapEntry[] = [];
  for (const lang of languages) {
    const prefix = `/${langPath(lang.code)}`;
    const langPosts = byLang.get(lang.code) ?? [];
    const langTags = [...(tagsByLang.get(lang.code) ?? new Set<string>())];

    // Language home (hero + featured posts, no pagination).
    entries.push({ path: `${prefix}/` });

    // Posts list (all articles) + its pagination.
    entries.push({ path: `${prefix}/posts/` });
    for (let p = 2; p <= pageCount(langPosts.length); p++) {
      entries.push({ path: `${prefix}/posts/page/${p}/` });
    }

    // Category index + category pages (with pagination).
    entries.push({ path: `${prefix}/category/` });
    for (const category of CATEGORIES) {
      const count = langPosts.filter((post) => post.data.category === category).length;
      entries.push({ path: `${prefix}/category/${category}/` });
      for (let p = 2; p <= pageCount(count); p++) {
        entries.push({ path: `${prefix}/category/${category}/page/${p}/` });
      }
    }

    // Series index + series pages.
    entries.push({ path: `${prefix}/series/` });
    const seriesSet = new Set<string>();
    for (const post of langPosts) if (post.data.series) seriesSet.add(post.data.series);
    for (const name of seriesSet) {
      entries.push({ path: `${prefix}/series/${encodeURIComponent(name)}/` });
    }

    // Tag index + tag article pages (with pagination).
    entries.push({ path: `${prefix}/tags/` });
    for (const tag of langTags) {
      const count = langPosts.filter((post) => post.data.tags.includes(tag)).length;
      const tagPath = encodeURIComponent(tag);
      entries.push({ path: `${prefix}/tags/${tagPath}/` });
      for (let p = 2; p <= pageCount(count); p++) {
        entries.push({ path: `${prefix}/tags/${tagPath}/page/${p}/` });
      }
    }

    // About page.
    entries.push({ path: `${prefix}/about/` });
  }

  // Article pages, URL driven by the post's frontmatter lang.
  for (const post of posts) {
    const [, slug] = post.id.split("/");
    if (!slug) continue;
    entries.push({
      path: `/${langPath(post.data.lang)}/posts/${slug}/`,
      lastmod: post.data.pubDate.toISOString().slice(0, 10),
    });
  }

  const urlXml = entries
    .map((entry) => {
      const loc = escapeXml(new URL(entry.path, siteUrl).href);
      const lastmod = entry.lastmod
        ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`
        : "";
      return `  <url>\n    <loc>${loc}</loc>${lastmod}\n  </url>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlXml}\n</urlset>`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
