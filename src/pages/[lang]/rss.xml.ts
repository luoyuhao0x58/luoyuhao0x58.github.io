import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { codeFromPath, langPath, t } from "../../i18n";
import { getActiveLangs } from "../../lib/active-langs";
import { postSlug } from "../../lib/posts";

/** 每语言一个 RSS feed:/[lang]/rss.xml(仅活跃语言 zh/zh-Hant/en,自动跟随 posts)。 */
export async function getStaticPaths() {
  const langs = await getActiveLangs();
  return langs.map((lang) => ({ params: { lang: langPath(lang.code) } }));
}

export const GET: APIRoute = async (context) => {
  const lang = codeFromPath(context.params.lang ?? "zh");
  const posts = (await getCollection("posts"))
    .filter((post) => post.data.lang === lang)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: t(lang, "siteName"),
    // channel 级描述:RSS 2.0 规范要求"描述频道内容"的短语/句子,
    // 复用各语言的 heroSubtitle(首页副标题),比"站点名·RSS"更有信息量
    description: t(lang, "heroSubtitle"),
    site: context.site ?? "https://luoyuhao.nettix.top",
    // 每篇文章一条 item:日期(@astrojs/rss 自动转 RFC 822)、描述、链接;
    // tags 输出为 RSS 标准 <category> 元素,便于阅读器分类
    items: posts.map((post) => {
      const slug = postSlug(post);
      const tags = post.data.tags ?? [];
      return {
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `/${langPath(lang)}/posts/${slug}/`,
        ...(tags.length > 0
          ? { customData: tags.map((tag) => `<category>${tag}</category>`).join("") }
          : {}),
      };
    }),
  });
};
