/** 博客站级外壳文案(机制与其他站一致,内容独立)。 */
export const messages = {
  zh: {
    siteName: "羽皓のBlog",
    navHome: "首页",
    tocTitle: "目录",
    backToTop: "返回顶部",
    listEmpty: "暂无文章",
    notFoundTitle: "页面不存在",
    notFoundDesc: "你访问的页面不存在或已被移动。",
    byPrefix: "发布于",
  },
  en: {
    siteName: "Yuhao's Blog",
    navHome: "Home",
    tocTitle: "Contents",
    backToTop: "Back to top",
    listEmpty: "No posts yet",
    notFoundTitle: "Page not found",
    notFoundDesc: "The page you are looking for does not exist or has moved.",
    byPrefix: "Published",
  },
} as const;

export type Locale = "zh" | "en";
export type MessageKey = keyof (typeof messages)["zh"];

export function t(locale: string, key: MessageKey): string {
  return messages[(locale === "en" ? "en" : "zh") as Locale][key];
}

export function langFromPath(pathname: string): Locale {
  const m = pathname.match(/^\/(zh|en)(\/|$)/);
  return m ? (m[1] as Locale) : "zh";
}
