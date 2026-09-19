// 手机端:导航条"目录"按钮开合下拉面板。
// 平板端:折叠目录滚动定住时加玻璃质感(.is-stuck)。
const tocBtn = document.getElementById("toc-nav-btn");
const tocPanel = document.getElementById("mobile-toc-panel");
if (tocBtn && tocPanel) {
  tocBtn.addEventListener("click", () => {
    const open = tocPanel.classList.toggle("is-open");
    tocBtn.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (e) => {
    if (
      tocPanel.classList.contains("is-open") &&
      !e.target.closest("#toc-nav-btn") &&
      !e.target.closest("#mobile-toc-panel")
    ) {
      tocPanel.classList.remove("is-open");
      tocBtn.setAttribute("aria-expanded", "false");
    }
  });
}

const tocFold = document.querySelector(".post-toc-mobile");
if (tocFold) {
  const onScroll = () => {
    tocFold.classList.toggle(
      "is-stuck",
      tocFold.getBoundingClientRect().top <= 80,
    );
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}
