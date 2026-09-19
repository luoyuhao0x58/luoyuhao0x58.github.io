import { codeFromPath } from "./i18n";
import type { Locale } from "./i18n";

/**
 * 内容元数据映射表(tag / category / series)。
 *
 * 规则:
 * - key 一律小写英文概念(如 `test`),是 frontmatter 与 URL 的唯一身份;
 * - 值为 8 语言显示文案,渲染时按当前语言取用;
 * - frontmatter 只允许写已定义的 key,未命中即构建失败(content.config.ts 校验),
 *   报错会点名无效值与提示,保证跨语言聚合一致。
 *
 * 新增概念:先在此补 key + 7 语言文案,再在文章中引用。
 */

/** 8 语言同文案(专有名词等),避免重复书写。 */
function same(v: string): Record<Locale, string> {
  return {
    zh: v,
    "zh-Hant": v,
    en: v,
    es: v,
    ja: v,
    ko: v,
    ru: v,
    ar: v,
  };
}

/** 标签映射表:key = 英文概念,value = 各语言显示名。 */
export const tagLabels: Record<string, Record<Locale, string>> = {
  a11y: {
    zh: "无障碍",
    "zh-Hant": "無障礙",
    en: "Accessibility",
    es: "Accesibilidad",
    ja: "アクセシビリティ",
    ko: "접근성",
    ru: "Доступность",
    ar: "إمكانية الوصول",
  },
  astro: same("Astro"),
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
  book: {
    zh: "读书",
    "zh-Hant": "閱讀",
    en: "Books",
    es: "Libros",
    ja: "読書",
    ko: "독서",
    ru: "Книги",
    ar: "كتب",
  },
  browser: {
    zh: "浏览器",
    "zh-Hant": "瀏覽器",
    en: "Browser",
    es: "Navegador",
    ja: "ブラウザ",
    ko: "브라우저",
    ru: "Браузер",
    ar: "المتصفح",
  },
  ci: same("CI"),
  css: same("CSS"),
  design: {
    zh: "设计",
    "zh-Hant": "設計",
    en: "Design",
    es: "Diseño",
    ja: "デザイン",
    ko: "디자인",
    ru: "Дизайн",
    ar: "تصميم",
  },
  history: {
    zh: "历史",
    "zh-Hant": "歷史",
    en: "History",
    es: "Historia",
    ja: "歴史",
    ko: "역사",
    ru: "История",
    ar: "تاريخ",
  },
  katex: same("KaTeX"),
  layout: {
    zh: "布局",
    "zh-Hant": "佈局",
    en: "Layout",
    es: "Maquetación",
    ja: "レイアウト",
    ko: "레이아웃",
    ru: "Макет",
    ar: "تخطيط",
  },
  life: {
    zh: "生活",
    "zh-Hant": "生活",
    en: "Life",
    es: "Vida",
    ja: "暮らし",
    ko: "일상",
    ru: "Жизнь",
    ar: "حياة",
  },
  markdown: same("Markdown"),
  migration: {
    zh: "迁移",
    "zh-Hant": "遷移",
    en: "Migration",
    es: "Migración",
    ja: "移行",
    ko: "마이그레이션",
    ru: "Миграция",
    ar: "ترحيل",
  },
  movie: {
    zh: "电影",
    "zh-Hant": "電影",
    en: "Movies",
    es: "Cine",
    ja: "映画",
    ko: "영화",
    ru: "Кино",
    ar: "أفلام",
  },
  performance: {
    zh: "性能",
    "zh-Hant": "效能",
    en: "Performance",
    es: "Rendimiento",
    ja: "パフォーマンス",
    ko: "성능",
    ru: "Производительность",
    ar: "الأداء",
  },
  react: same("React"),
  terminal: {
    zh: "终端",
    "zh-Hant": "終端機",
    en: "Terminal",
    es: "Terminal",
    ja: "ターミナル",
    ko: "터미널",
    ru: "Терминал",
    ar: "طرفية",
  },
  test: {
    zh: "测试",
    "zh-Hant": "測試",
    en: "Test",
    es: "Pruebas",
    ja: "テスト",
    ko: "테스트",
    ru: "Тесты",
    ar: "اختبار",
  },
  tooling: {
    zh: "工具链",
    "zh-Hant": "工具鏈",
    en: "Tooling",
    es: "Herramientas",
    ja: "ツール",
    ko: "도구",
    ru: "Инструменты",
    ar: "أدوات",
  },
  travel: {
    zh: "旅行",
    "zh-Hant": "旅行",
    en: "Travel",
    es: "Viajes",
    ja: "旅",
    ko: "여행",
    ru: "Путешествия",
    ar: "سفر",
  },
  typescript: same("TypeScript"),
  web: same("Web"),
  writing: {
    zh: "写作",
    "zh-Hant": "寫作",
    en: "Writing",
    es: "Escritura",
    ja: "執筆",
    ko: "글쓰기",
    ru: "Письмо",
    ar: "كتابة",
  },
};

/** 分类映射表:key = 英文概念(可扩展,不必改代码),value = 各语言显示名。 */
export const categoryLabels: Record<string, Record<Locale, string>> = {
  tech: {
    zh: "技术",
    "zh-Hant": "技術",
    en: "Tech",
    es: "Artículos técnicos",
    ja: "技術",
    ko: "기술 글",
    ru: "Технические статьи",
    ar: "مقالات تقنية",
  },
  journal: {
    zh: "个人文摘",
    "zh-Hant": "個人文摘",
    en: "Journal",
    es: "Notas personales",
    ja: "個人メモ",
    ko: "개인 메모",
    ru: "Личные заметки",
    ar: "ملاحظات شخصية",
  },
};

/** 专栏映射表:key = 6 位风格小写 id(字母开头),value = 各语言标题。 */
export const seriesLabels: Record<string, Record<Locale, string>> = {
  webarchaeology: {
    zh: "Web 考古",
    "zh-Hant": "Web 考古",
    en: "Web Archaeology",
    es: "Arqueología Web",
    ja: "Web 考古学",
    ko: "웹 고고학",
    ru: "Веб-археология",
    ar: "علم آثار الويب",
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
