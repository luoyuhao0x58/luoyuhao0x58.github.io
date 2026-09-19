# 部署架构说明

## 模型：构建一次 → 多端发布（模型 A）

GitHub Actions 负责**构建一次**，将同一份 `dist/` 产物推送到所有平台，保证**多端字节一致**（对应 OpenSpec `static-deployment` 的"一次构建双端发布"要求）。

```
push main → GitHub Actions
   ├─ 构建一次(pnpm build → dist/)
   ├─ 1. 推 gh-pages 分支(GitHub Pages 直接服务)
   └─ 2. 平台矩阵直传(同一份 dist):
          Cloudflare Pages / EdgeOne Makers / Vercel / Netlify
```

## 为什么不用"git 分支让平台自建"

只有 GitHub Pages 是**直接服务分支**；Vercel/Netlify/Cloudflare/EdgeOne 连 git 后是**自己构建**，产物字节可能不一致。模型 A 保证"一次构建、同字节"，且加平台只加一行 + 一个 secret。

## 平台矩阵与 Secrets

所有凭据走 **CI 环境变量 / Secrets**，未配置的平台步骤自动跳过（`if: env.X != ''`）。

| 平台 | 发布方式 | 所需 Secret |
|---|---|---|
| GitHub Pages | 推 `dist` → `gh-pages` 分支 | 内置 `GITHUB_TOKEN`（无需配置） |
| Cloudflare Pages | `wrangler pages deploy` | `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID` |
| EdgeOne Makers | `edgeone makers deploy -n nettix-blog -t <token>` | `EDGEONE_API_TOKEN` |
| Vercel | `vercel deploy dist --prod` | `VERCEL_TOKEN`、`VERCEL_ORG_ID`、`VERCEL_PROJECT_ID` |
| Netlify | `netlify deploy --prod --dir dist` | `NETLIFY_AUTH_TOKEN`、`NETLIFY_SITE_ID` |

各平台项目名统一为 `nettix-blog`（EdgeOne 首次部署自动创建）。

## 触发规则

- `push` 到 `main`，且仅当 `src/**`、`public/**`、构建配置变更时触发（文章/样式改动即发布）
- `workflow_dispatch` 支持手动触发
- `concurrency` 串行：新 push 排队，避免部署互相覆盖

## DNS 智能线路分流（大陆/海外）

双端发布是前提，**DNS 分流**是核心：

- **大陆线路** → EdgeOne
- **海外线路** → Cloudflare
- 在 DNS 服务商（如华为云）为子域配置两条线路记录，按访问来源解析到对应平台
- 两端均绑定自定义域名并开启 HTTPS

## 平台就绪检查

- Cloudflare：Pages 项目 `nettix-blog`（或首次 deploy 前手动创建）
- EdgeOne：Makers 项目（`deploy -n` 自动创建；纯静态托管需验证 dist 直传是否被直接托管——见任务 7.1 spike）
- Vercel：项目链接（`VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` 来自项目设置）
- Netlify：站点 `NETLIFY_SITE_ID` 来自站点设置
- GitHub Pages：仓库 Settings → Pages → Source 选择 `gh-pages` 分支
