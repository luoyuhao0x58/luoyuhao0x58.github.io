import { getCollection } from "astro:content";
import { languages } from "../i18n";

/**
 * 保底语言配置:这些语言即使 posts 里一篇都没有,也始终构建
 * (主页/关于/空的文章列表可进入;文章详情等自然为空)。
 * 数组元素必须是 i18n.ts 中 languages 的 code;默认简体中文 + 英文。
 */
export const FALLBACK_LANGS = ["zh", "en"] as const;

/**
 * 活跃语言 = posts 集合里至少有一篇文章的语言 + 保底语言(FALLBACK_LANGS)。
 * 无文章的语言不渲染:对应 /[lang]/ 下所有页面(含 about 等有翻译内容的页)全部 404,
 * 根路径跳转与语言切换器也不列它。翻译文件仍保留在 content 里,该语言一旦有文章即自动启用。
 */
export async function getActiveLangs() {
  const posts = await getCollection("posts");
  const active = new Set(posts.map((p) => p.data.lang));
  for (const code of FALLBACK_LANGS) active.add(code);
  return languages.filter((l) => active.has(l.code));
}
