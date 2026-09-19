---
title: "CSS Grid Notes from a Real Project"
pubDate: 2026-04-02
description: "What I learned shipping a grid-heavy layout: implicit rows, fr vs auto, and overflow traps."
tags: [css, layout]
lang: en
category: tech
---

## Implicit rows bite

When content exceeds your declared rows, Grid creates implicit ones with `auto` sizing — which is often not what you wanted.

## fr is a suggestion

`1fr` means "at least as small as min-content unless you say otherwise". Pair it with `minmax()` when you care about the minimum.

Ship grid layouts by testing with real content, not boxes.
