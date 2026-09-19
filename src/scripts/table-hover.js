/* global document, window */
// 表格十字交叉 hover 高亮(行高亮由 CSS `tbody tr:hover` 实现,列高亮由本脚本实现):
// 鼠标悬停某个表体单元格时,给该列所有 tbody td 加 .table-col-hover(仅表体,表头 th 不参与)。
// 事件委托到 document + window 单次注册标记(与 post-toc.js 一致:View Transitions
// 导航后模块脚本可能重新执行,委托到 document 只注册一次,每次导航后实时查找当前 DOM)。
(function () {
  if (window.__tableHoverBound__) return;
  window.__tableHoverBound__ = true;

  // 清除当前表体的列高亮,并给 index 列(仅 TD)加高亮
  const setColumn = (td) => {
    const tbody = td.closest("tbody");
    if (!tbody) return;
    tbody
      .querySelectorAll("td.table-col-hover")
      .forEach((cell) => cell.classList.remove("table-col-hover"));
    const idx = td.cellIndex;
    tbody.querySelectorAll("tr").forEach((tr) => {
      const cell = tr.children[idx];
      if (cell && cell.tagName === "TD") cell.classList.add("table-col-hover");
    });
  };

  const clearTable = (tbody) => {
    tbody?.querySelectorAll("td.table-col-hover").forEach((cell) => cell.classList.remove("table-col-hover"));
  };

  document.addEventListener("mouseover", (e) => {
    const td = e.target.closest(".article-content tbody td");
    if (td) setColumn(td);
  });

  // 移出表体(relatedTarget 不在同一表体内)时清除列高亮
  document.addEventListener("mouseout", (e) => {
    const tbody = e.target.closest ? e.target.closest(".article-content tbody") : null;
    if (!tbody) return;
    const rel = e.relatedTarget;
    if (rel && tbody.contains(rel)) return;
    clearTable(tbody);
  });
})();
