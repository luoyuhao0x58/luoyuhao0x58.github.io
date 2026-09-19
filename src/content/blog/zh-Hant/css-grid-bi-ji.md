---
title: "CSS Grid 實戰筆記"
pubDate: 2026-05-08
description: Grid 排版實際專案中的經驗：隱式列、fr 與 overflow 的陷阱。
tags: [css, layout]
lang: zh-Hant
category: tech
---

## 隱式列

當內容超出宣告的列數時，Grid 會自動建立隱式列，尺寸常常不是你想要的。

## fr 的陷阱

`1fr` 在內容有最小寬度時可能比預期更寬，搭配 `minmax()` 使用更可控。
