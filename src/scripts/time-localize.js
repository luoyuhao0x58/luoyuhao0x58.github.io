/**
 * 时间本地化:SSR 阶段不知道浏览器时区/locale,展示的是东八区兑底值。
 * 这里在客户端把:
 * - [data-tz-date-text]  → 按浏览器系统时区重算为统一短格式 YYYY/MM/DD
 * - [data-tz-tip]        → 按浏览器 locale + 系统时区重算为当地语言格式(精确到分钟)
 * - [data-tz-cal]        → 列表日历块:按浏览器系统时区重算月/年/日/星期,
 *                          并同步月份四季淡彩、年份 4 周期淡彩、日期星期心情色
 * 数据源取最近 <time> 的 datetime(UTC ISO,时刻不变);日历块用自身 data-tz-cal。
 * astro:page-load 处理 View Transitions 导航后的新 DOM。
 */
(function () {
  const p = (n) => String(n).padStart(2, "0");
  const tipFmt = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  // 星期名(英文,与 tokens 的 --cal-mon~sun 对应):getDay() 0=Sunday
  const WEEKDAY_TOKENS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  function localizeCal() {
    for (const cal of document.querySelectorAll("[data-tz-cal]")) {
      const iso = cal.getAttribute("data-tz-cal");
      const d = iso ? new Date(iso) : null;
      if (!d || Number.isNaN(d.getTime())) continue;
      const mEl = cal.querySelector("[data-cal-month]");
      const yEl = cal.querySelector("[data-cal-year]");
      const dEl = cal.querySelector("[data-cal-day]");
      if (!mEl || !yEl || !dEl) continue;
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      mEl.textContent = String(m);
      mEl.style.backgroundColor = `var(--cal-month-${m})`;
      yEl.textContent = String(y);
      yEl.style.backgroundColor = `var(--cal-year-${y % 4})`;
      dEl.textContent = String(d.getDate());
      dEl.style.color = `var(--cal-${WEEKDAY_TOKENS[d.getDay()]})`;
    }
  }

  function localize() {
    // 图标右侧日期:YYYY/MM/DD(浏览器本地时区的年/月/日)
    for (const el of document.querySelectorAll("[data-tz-date-text]")) {
      const time = el.closest("time");
      const iso = time && time.getAttribute("datetime");
      const d = iso ? new Date(iso) : null;
      if (d && !Number.isNaN(d.getTime())) {
        el.textContent = `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())}`;
      }
    }
    // tooltip:当地语言格式精确到分钟(浏览器 locale + 时区)
    for (const tip of document.querySelectorAll("[data-tz-tip]")) {
      const time = tip.closest("time");
      const iso = time && time.getAttribute("datetime");
      const d = iso ? new Date(iso) : null;
      if (d && !Number.isNaN(d.getTime())) tip.textContent = tipFmt.format(d);
    }
    // 日历块:月/年/日/星期按浏览器时区重算,同步背景色与文字色
    localizeCal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", localize);
  } else {
    localize();
  }
  document.addEventListener("astro:page-load", localize);
})();
