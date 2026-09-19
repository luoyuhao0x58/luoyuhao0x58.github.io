import { codeFromPath } from "./i18n";
import type { Locale } from "./i18n";

/**
 * 内容元数据映射表(tag / category / series)。
 *
 * 规则:
 * - key 一律小写英文概念(如 `tech`),是 frontmatter 与 URL 的唯一身份;
 * - 值为 8 语言显示文案,渲染时按当前语言取用;
 * - frontmatter 只允许写已定义的 key,未命中即构建失败(content.config.ts 校验),
 *   报错会点名无效值与提示,保证跨语言聚合一致。
 *
 * 新增概念:先在此补 key + 7 语言文案,再在文章中引用。
 *
 * 当前状态(测试期清理):标签与专栏映射暂空,分类仅保留 programmer(程序员);
 * 恢复文章前需按文章 frontmatter 实际引用的 key 补回映射,否则构建失败。
 */

/** 标签映射表:key = 英文概念,value = 各语言显示名。 */
export const tagLabels: Record<string, Record<Locale, string>> = {
  blog: {
    zh: "博客",
    "zh-Hant": "部落格",
    en: "Blog",
    es: "Blog",
    ja: "ブログ",
    ko: "블로그",
    ru: "Блог",
    ar: "مدونة",
  },
};

/** 分类映射表:key = 英文概念(可扩展,不必改代码),value = 各语言显示名。仅保留 programmer(程序员)。 */
export const categoryLabels: Record<string, Record<Locale, string>> = {
  programmer: {
    zh: "程序员",
    "zh-Hant": "程式設計師",
    en: "Programmer",
    es: "Programador",
    ja: "プログラマー",
    ko: "프로그래머",
    ru: "Программист",
    ar: "مبرمج",
  },
};

/** 专栏映射表:key = 专栏英文概念,value = 各语言显示名。 */
export const seriesLabels: Record<string, Record<Locale, string>> = {
  "building-my-blog-from-scratch": {
    zh: "从零搭建我的博客",
    "zh-Hant": "從零搭建我的博客",
    en: "Building My Blog From Scratch",
    es: "Construyendo mi blog desde cero",
    ja: "私のブログをゼロから作る",
    ko: "내 블로그를 처음부터 만들기",
    ru: "Строим мой блог с нуля",
    ar: "بناء مدونتي من الصفر",
  },
};

/** 取某语言下的显示名;缺该语言回退英文,再缺回退 key 本身。 */
export function taxonomyLabel(
  table: Record<string, Record<Locale, string>>,
  key: string,
  lang: string,
): string {
  const entry = table[key];
  if (!entry) return key;
  return entry[codeFromPath(lang)] ?? entry.en ?? key;
}
