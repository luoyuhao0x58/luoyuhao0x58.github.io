/* global document, window, Element */
// 目录交互(事件委托 + window 单次注册标记:View Transitions 导航后模块脚本可能
// 重新执行,重复 addEventListener 会累积监听器;委托到 document 只注册一次,
// 每次导航后实时查找当前 DOM 的元素)。
//
// 手机端:导航条"目录"按钮(#toc-nav-btn)开合浮动面板(#mobile-toc-panel)。
// 平板端:折叠目录(.post-toc-mobile)滚动吸顶时加玻璃质感(.is-stuck),
//         点击面板外部自动收起(open)。
(function () {
  if (window.__postTocBound__) return;
  window.__postTocBound__ = true;

  // 桌面目录对齐:目录"目录"文字垂直中线对齐文章分割线(post-meta-divider)。
  // 动态测量(非固定 px):自适应题图有无、标题折行、标签折行与字体变化。
  // 初始 CSS 兜底:无题图 margin-top 74px / 有题图对齐标题顶部,JS 在此基础上微调。
  const alignToc = () => {
    const toc = document.querySelector(".post-toc");
    const tocTitle = toc?.querySelector(".toc > p");
    const divider = document.querySelector(".post-meta-divider");
    if (!toc || !tocTitle || !divider) return;
    requestAnimationFrame(() => {
      const dMid =
        divider.getBoundingClientRect().top + divider.getBoundingClientRect().height / 2;
      const tMid =
        tocTitle.getBoundingClientRect().top + tocTitle.getBoundingClientRect().height / 2;
      const diff = dMid - tMid;
      if (Math.abs(diff) < 0.5) return;
      const cur = parseFloat(getComputedStyle(toc).marginTop) || 0;
      toc.style.marginTop = cur + diff + "px";
    });
  };
  document.addEventListener("astro:page-load", alignToc);
  window.addEventListener("load", alignToc);
  window.addEventListener("toc-realign", alignToc); /* 题图加载失败回退布局后重对齐 */
  document.fonts?.ready?.then(alignToc);
  alignToc();

  document.addEventListener("click", (e) => {
    if (!(e.target instanceof Element)) return;

    // 手机:目录按钮开合浮动面板
    if (e.target.closest("#toc-nav-btn")) {
      const panel = document.getElementById("mobile-toc-panel");
      const btn = document.getElementById("toc-nav-btn");
      if (panel && btn) {
        const open = panel.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(open));
      }
      return;
    }

    // 手机:点面板外部时收起浮动面板
    const panel = document.getElementById("mobile-toc-panel");
    if (panel && panel.classList.contains("is-open") && !e.target.closest("#mobile-toc-panel")) {
      panel.classList.remove("is-open");
      const btn = document.getElementById("toc-nav-btn");
      if (btn) btn.setAttribute("aria-expanded", "false");
    }

    // 平板:点折叠目录外部时收起(展开为浮层,不点 summary 也能关)
    const fold = e.target.closest(".post-toc-mobile");
    if (!fold && document.querySelector(".post-toc-mobile[open]")) {
      document.querySelector(".post-toc-mobile[open]")?.removeAttribute("open");
    }

    // 点击目录链接(锚点跳转)后自动收起:手机浮动面板与平板折叠目录都要收回
    if (e.target.closest("#mobile-toc-panel a")) {
      const panel = document.getElementById("mobile-toc-panel");
      const btn = document.getElementById("toc-nav-btn");
      if (panel) panel.classList.remove("is-open");
      if (btn) btn.setAttribute("aria-expanded", "false");
    }
    if (e.target.closest(".post-toc-mobile .toc-body a")) {
      document.querySelector(".post-toc-mobile[open]")?.removeAttribute("open");
    }
  });

  // 平板:吸顶玻璃质感
  const updateStuck = () => {
    const el = document.querySelector(".post-toc-mobile");
    if (el) {
      el.classList.toggle("is-stuck", el.getBoundingClientRect().top <= 80);
    }
  };

  // 目录滚动高亮(scrollspy):找出当前章节(最后一个顶部越过判定线的标题),
  // 在目录各容器(桌面右栏/平板折叠/手机面板)里高亮对应链接。
  // 按容器独立计算:避免隐藏容器(display:none)的链接覆盖 current 导致可见目录不高亮。
  const updateActiveToc = () => {
    const containers = [".post-toc", ".post-toc-mobile", ".mobile-toc-panel"];
    const marker = 90; // 当前章节判定线:视口顶部下方(导航条 + 留白)
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    for (const sel of containers) {
      const links = [...document.querySelectorAll(`${sel} .toc a`)];
      if (links.length === 0) continue;
      let current = null;
      for (const a of links) {
        const id = a.getAttribute("href")?.slice(1);
        if (!id) continue;
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= marker) current = a;
      }
      // 滚动到底部:无条件强制高亮最后一项。文章末尾常出现多个小节同屏
      // (最后标题内容短,从未顶到判定线),若仅在 current 为空时才兜底,
      // 目录会一直停在倒数第二项,与"已看完"的阅读位置不符。
      if (atBottom) current = links[links.length - 1];
      for (const a of links) a.classList.toggle("is-active", a === current);
    }
  };

  const onScroll = () => {
    updateStuck();
    updateActiveToc();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateActiveToc);
  document.addEventListener("astro:page-load", updateActiveToc);
  updateStuck();
  updateActiveToc();
})();
