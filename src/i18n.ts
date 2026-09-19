/** Blog site-wide shell copy (mechanism shared with other sites, content independent). */

export interface Language {
  code: string;
  /** Compact label for the language switcher button, e.g. 简/繁/EN. */
  shortLabel: string;
  /** Full human-readable label, e.g. 简体中文/繁體中文/English. */
  label: string;
  /** `lang` attribute value for <html>, e.g. zh-CN/zh-Hant/en. */
  htmlLang: string;
  /** Language family used for the root-path negotiation, e.g. zh/en. */
  family: string;
}

/** Language table — single source of truth for all supported locales. Add a row to add a language. */
export const languages = [
  { code: "zh", shortLabel: "简", label: "简体中文", htmlLang: "zh-CN", family: "zh" },
  { code: "zh-Hant", shortLabel: "繁", label: "繁體中文", htmlLang: "zh-Hant", family: "zh" },
  { code: "en", shortLabel: "EN", label: "English", htmlLang: "en", family: "en" },
  { code: "es", shortLabel: "ES", label: "Español", htmlLang: "es", family: "es" },
  { code: "ja", shortLabel: "日", label: "日本語", htmlLang: "ja", family: "ja" },
  { code: "ko", shortLabel: "한", label: "한국어", htmlLang: "ko", family: "ko" },
  { code: "ru", shortLabel: "РУ", label: "Русский", htmlLang: "ru", family: "ru" },
  { code: "ar", shortLabel: "ع", label: "العربية", htmlLang: "ar", family: "ar" },
] as const satisfies readonly Language[];

/** Union of language codes from the language table. */
export type Locale = (typeof languages)[number]["code"];

/** Lowercased URL path segment for a language code, e.g. "zh-Hant" -> "zh-hant". */
export function langPath(code: string): string {
  return code.toLowerCase();
}

/** Resolve a URL path segment (e.g. "zh-hant") back to its language code; defaults to "zh". */
export function codeFromPath(path: string): Locale {
  const match = languages.find((l) => l.code.toLowerCase() === path.toLowerCase());
  return match ? match.code : "zh";
}

/** Regex alternation of all language URL segments, longest first (e.g. "zh-hant|zh|en"). */
export const langSegment = languages
  .map((l) => langPath(l.code))
  .sort((a, b) => b.length - a.length)
  .join("|");

/** Strip the leading language prefix from a pathname, returning "/" plus the remainder. */
export function stripLangPrefix(pathname: string): string {
  return pathname.replace(new RegExp(`^/(${langSegment})(/|$)`), "/");
}

export const messages = {
  zh: {
    siteName: "羽皓のBlog",
    copyrightName: "羽皓",
    toolsMenu: "工具菜单",
    toolsLanguage: "语言选择",
    navHome: "首页",
    navAbout: "关于",
    navPosts: "文章",
    navCategories: "分类",
    navSeries: "专栏",
    tocTitle: "目录",
    backToTop: "返回顶部",
    listEmpty: "暂无文章",
    notFoundTitle: "页面不存在",
    notFoundDesc: "你访问的页面不存在或已被移动。",
    byPrefix: "发布于",
    updatedPrefix: "更新于",
    summaryBadge: "摘要",
    themeLight: "白天",
    themeDark: "黑夜",
    themeAuto: "自动",
    themeToggleAria: "切换主题",
    themeToggleTitle: "主题:白天 / 黑夜 / 自动",
    heroTitle: "你好，我是羽皓",
    heroSubtitle: "程序员。写技术文章与个人文摘，偶尔拍拍照。",
    avatarAlt: "羽皓的头像",
    latestPosts: "最新文章",
    writingPlaceholder: "文章正在路上，稍后再来看看。",
    tagsTitle: "标签",
    seriesLabel: "专栏",
    prevPage: "上一页",
    nextPage: "下一页",
    paginationAria: "分页导航",
    videoLabelBilibili: "B站观看",
    videoLabelYoutube: "YouTube 观看",
    videoSwitchAria: "切换视频平台",
    socialsTitle: "社交账号",
    doubanTitle: "豆瓣书影音",
    skillsTitle: "技术能力",
    interestsTitle: "喜好",
  },
  "zh-Hant": {
    siteName: "羽皓のBlog",
    copyrightName: "羽皓",
    toolsMenu: "工具菜单",
    toolsLanguage: "语言选择",
    navHome: "首頁",
    navAbout: "關於",
    navPosts: "文章",
    navCategories: "分類",
    navSeries: "專欄",
    tocTitle: "目錄",
    backToTop: "返回頂部",
    listEmpty: "暫無文章",
    notFoundTitle: "頁面不存在",
    notFoundDesc: "你訪問的頁面不存在或已被移動。",
    byPrefix: "發佈於",
    updatedPrefix: "更新於",
    summaryBadge: "摘要",
    themeLight: "白天",
    themeDark: "黑夜",
    themeAuto: "自動",
    themeToggleAria: "切換主題",
    themeToggleTitle: "主題:白天 / 黑夜 / 自動",
    heroTitle: "你好，我是羽皓",
    heroSubtitle: "程式設計師。寫技術文章與個人文摘，偶爾拍拍照。",
    avatarAlt: "羽皓的頭像",
    latestPosts: "最新文章",
    writingPlaceholder: "文章正在路上，稍後再來看看。",
    tagsTitle: "標籤",
    seriesLabel: "專欄",
    prevPage: "上一頁",
    nextPage: "下一頁",
    paginationAria: "分頁導覽",
    videoLabelBilibili: "B站觀看",
    videoLabelYoutube: "YouTube 觀看",
    videoSwitchAria: "切換影片平台",
    socialsTitle: "社交帳號",
    doubanTitle: "豆瓣書影音",
    skillsTitle: "技術能力",
    interestsTitle: "喜好",
  },
  en: {
    siteName: "Yuhao's Blog",
    copyrightName: "Yuhao",
    toolsMenu: "Tools",
    toolsLanguage: "Language",
    navHome: "Home",
    navAbout: "About",
    navPosts: "Posts",
    navCategories: "Categories",
    navSeries: "Series",
    tocTitle: "Contents",
    backToTop: "Back to top",
    listEmpty: "No posts yet",
    notFoundTitle: "Page not found",
    notFoundDesc: "The page you are looking for does not exist or has moved.",
    byPrefix: "Published",
    updatedPrefix: "Updated",
    summaryBadge: "Summary",
    themeLight: "Light",
    themeDark: "Dark",
    themeAuto: "Auto",
    themeToggleAria: "Switch theme",
    themeToggleTitle: "Theme: light / dark / auto",
    heroTitle: "Hi, I'm Yuhao",
    heroSubtitle: "Programmer. Writing about tech and life, occasionally taking photos.",
    avatarAlt: "Yuhao's avatar",
    latestPosts: "Latest Posts",
    writingPlaceholder: "Writing in progress — check back soon.",
    tagsTitle: "Tags",
    seriesLabel: "Series",
    prevPage: "Previous",
    nextPage: "Next",
    paginationAria: "Pagination",
    videoLabelBilibili: "Watch on Bilibili",
    videoLabelYoutube: "Watch on YouTube",
    videoSwitchAria: "Switch video platform",
    socialsTitle: "Socials",
    doubanTitle: "Douban Books & Films",
    skillsTitle: "Skills",
    interestsTitle: "Interests",
  },
  es: {
    siteName: "Blog de Yuhao",
    copyrightName: "Yuhao",
    toolsMenu: "Menú de herramientas",
    toolsLanguage: "Idioma",
    navHome: "Inicio",
    navAbout: "Acerca de",
    navPosts: "Artículos",
    navCategories: "Categorías",
    navSeries: "Series",
    tocTitle: "Contenido",
    backToTop: "Volver arriba",
    listEmpty: "Aún no hay artículos",
    notFoundTitle: "Página no encontrada",
    notFoundDesc: "La página que buscas no existe o ha sido movida.",
    byPrefix: "Publicado",
    updatedPrefix: "Actualizado",
    summaryBadge: "Resumen",
    themeLight: "Claro",
    themeDark: "Oscuro",
    themeAuto: "Automático",
    themeToggleAria: "Cambiar tema",
    themeToggleTitle: "Tema: claro / oscuro / automático",
    heroTitle: "Hola, soy Yuhao",
    heroSubtitle: "Programador. Escribo artículos técnicos y notas personales, y a veces hago fotos.",
    avatarAlt: "Avatar de Yuhao",
    latestPosts: "Últimos artículos",
    writingPlaceholder: "Escribiendo artículos, vuelve más tarde.",
    tagsTitle: "Etiquetas",
    seriesLabel: "Series",
    prevPage: "Anterior",
    nextPage: "Siguiente",
    paginationAria: "Paginación",
    videoLabelBilibili: "Ver en Bilibili",
    videoLabelYoutube: "Ver en YouTube",
    videoSwitchAria: "Cambiar plataforma de vídeo",
    socialsTitle: "Redes sociales",
    doubanTitle: "Douban: libros y cine",
    skillsTitle: "Habilidades",
    interestsTitle: "Intereses",
  },
  ja: {
    siteName: "羽皓のBlog",
    copyrightName: "羽皓",
    toolsMenu: "ツールメニュー",
    toolsLanguage: "言語",
    navHome: "ホーム",
    navAbout: "プロフィール",
    navPosts: "記事",
    navCategories: "カテゴリ",
    navSeries: "シリーズ",
    tocTitle: "目次",
    backToTop: "トップへ戻る",
    listEmpty: "記事はまだありません",
    notFoundTitle: "ページが見つかりません",
    notFoundDesc: "お探しのページは存在しないか、移動しました。",
    byPrefix: "公開日",
    updatedPrefix: "更新日",
    summaryBadge: "要約",
    themeLight: "ライト",
    themeDark: "ダーク",
    themeAuto: "自動",
    themeToggleAria: "テーマを切り替え",
    themeToggleTitle: "テーマ:ライト / ダーク / 自動",
    heroTitle: "こんにちは、羽皓です",
    heroSubtitle: "プログラマー。技術記事と個人の読書メモを書き、たまに写真を撮ります。",
    avatarAlt: "羽皓のアバター",
    latestPosts: "最新記事",
    writingPlaceholder: "記事を執筆中です。また後で来てください。",
    tagsTitle: "タグ",
    seriesLabel: "シリーズ",
    prevPage: "前のページ",
    nextPage: "次のページ",
    paginationAria: "ページネーション",
    videoLabelBilibili: "Bilibili で見る",
    videoLabelYoutube: "YouTube で見る",
    videoSwitchAria: "動画プラットフォームを切り替え",
    socialsTitle: "SNS",
    doubanTitle: "豆瓣 本・映画・音楽",
    skillsTitle: "スキル",
    interestsTitle: "趣味",
  },
  ko: {
    siteName: "우호의 Blog",
    copyrightName: "우호",
    toolsMenu: "도구 메뉴",
    toolsLanguage: "언어",
    navHome: "홈",
    navAbout: "소개",
    navPosts: "글",
    navCategories: "카테고리",
    navSeries: "시리즈",
    tocTitle: "목차",
    backToTop: "맨 위로",
    listEmpty: "아직 글이 없습니다",
    notFoundTitle: "페이지를 찾을 수 없습니다",
    notFoundDesc: "요청하신 페이지가 없거나 이동되었습니다.",
    byPrefix: "게시일",
    updatedPrefix: "업데이트",
    summaryBadge: "요약",
    themeLight: "라이트",
    themeDark: "다크",
    themeAuto: "자동",
    themeToggleAria: "테마 전환",
    themeToggleTitle: "테마: 라이트 / 다크 / 자동",
    heroTitle: "안녕하세요, 우호입니다",
    heroSubtitle: "프로그래머. 기술 글과 개인 메모를 쓰고, 가끔 사진을 찍습니다.",
    avatarAlt: "우호의 아바타",
    latestPosts: "최신 글",
    writingPlaceholder: "글을 쓰는 중입니다. 잠시 후 다시 방문해 주세요.",
    tagsTitle: "태그",
    seriesLabel: "시리즈",
    prevPage: "이전",
    nextPage: "다음",
    paginationAria: "페이지네이션",
    videoLabelBilibili: "Bilibili에서 보기",
    videoLabelYoutube: "YouTube에서 보기",
    videoSwitchAria: "동영상 플랫폼 전환",
    socialsTitle: "SNS",
    doubanTitle: "豆瓣 도서·영화·음악",
    skillsTitle: "기술",
    interestsTitle: "취미",
  },
  ru: {
    siteName: "Блог Юхао",
    copyrightName: "Юхао",
    toolsMenu: "Меню инструментов",
    toolsLanguage: "Язык",
    navHome: "Главная",
    navAbout: "Обо мне",
    navPosts: "Статьи",
    navCategories: "Категории",
    navSeries: "Серии",
    tocTitle: "Содержание",
    backToTop: "Наверх",
    listEmpty: "Пока нет статей",
    notFoundTitle: "Страница не найдена",
    notFoundDesc: "Страница, которую вы ищете, не существует или была перемещена.",
    byPrefix: "Опубликовано",
    updatedPrefix: "Обновлено",
    summaryBadge: "Резюме",
    themeLight: "Светлая",
    themeDark: "Тёмная",
    themeAuto: "Авто",
    themeToggleAria: "Переключить тему",
    themeToggleTitle: "Тема: светлая / тёмная / авто",
    heroTitle: "Привет, я Юхао",
    heroSubtitle: "Программист. Пишу технические статьи и личные заметки, иногда фотографирую.",
    avatarAlt: "Аватар Юхао",
    latestPosts: "Последние статьи",
    writingPlaceholder: "Статьи в процессе написания — загляните позже.",
    tagsTitle: "Теги",
    seriesLabel: "Серии",
    prevPage: "Назад",
    nextPage: "Вперёд",
    paginationAria: "Постраничная навигация",
    videoLabelBilibili: "Смотреть на Bilibili",
    videoLabelYoutube: "Смотреть на YouTube",
    videoSwitchAria: "Переключить видеоплатформу",
    socialsTitle: "Соцсети",
    doubanTitle: "Douban: книги и фильмы",
    skillsTitle: "Навыки",
    interestsTitle: "Интересы",
  },
  ar: {
    siteName: "مدونة يوهاو",
    copyrightName: "يوهاو",
    toolsMenu: "قائمة الأدوات",
    toolsLanguage: "اللغة",
    navHome: "الرئيسية",
    navAbout: "عني",
    navPosts: "المقالات",
    navCategories: "التصنيفات",
    navSeries: "السلسلات",
    tocTitle: "المحتوى",
    backToTop: "العودة للأعلى",
    listEmpty: "لا توجد مقالات بعد",
    notFoundTitle: "الصفحة غير موجودة",
    notFoundDesc: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
    byPrefix: "نُشر في",
    updatedPrefix: "حُدّث في",
    summaryBadge: "ملخص",
    themeLight: "فاتح",
    themeDark: "داكن",
    themeAuto: "تلقائي",
    themeToggleAria: "تبديل المظهر",
    themeToggleTitle: "المظهر: فاتح / داكن / تلقائي",
    heroTitle: "مرحباً، أنا يوهاو",
    heroSubtitle: "مبرمج. أكتب مقالات تقنية وملاحظات شخصية، وألتقط الصور أحياناً.",
    avatarAlt: "صورة يوهاو",
    latestPosts: "أحدث المقالات",
    writingPlaceholder: "جارٍ كتابة المقالات، عد لاحقاً.",
    tagsTitle: "الوسوم",
    seriesLabel: "سلسلة",
    prevPage: "السابق",
    nextPage: "التالي",
    paginationAria: "ترقيم الصفحات",
    videoLabelBilibili: "مشاهدة على Bilibili",
    videoLabelYoutube: "مشاهدة على YouTube",
    videoSwitchAria: "تبديل منصة الفيديو",
    socialsTitle: "حسابات التواصل",
    doubanTitle: "دوبان: كتب وأفلام وموسيقى",
    skillsTitle: "المهارات",
    interestsTitle: "الاهتمامات",
  },
} as const;

export type MessageKey = keyof (typeof messages)["zh"];

export function t(locale: string, key: MessageKey): string {
  const code = codeFromPath(locale);
  const table = messages[code];
  if (table && key in table) return table[key];
  return messages.zh[key];
}

/** Intl locale tag for date/number formatting per language. */
export function intlLocale(locale: string): string {
  const code = codeFromPath(locale);
  switch (code) {
    case "en":
      return "en-US";
    case "es":
      return "es-ES";
    case "zh-Hant":
      return "zh-Hant";
    case "ja":
      return "ja-JP";
    case "ko":
      return "ko-KR";
    case "ru":
      return "ru-RU";
    case "ar":
      return "ar";
    default:
      return "zh-CN";
  }
}

export function langFromPath(pathname: string): Locale {
  const m = pathname.match(new RegExp(`^/(${langSegment})(/|$)`));
  return m ? codeFromPath(m[1]) : "zh";
}
