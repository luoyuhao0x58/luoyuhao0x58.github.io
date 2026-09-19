/**
 * Cloudflare Web Analytics 配置(部署前按需修改)。
 *
 * token 从 Cloudflare 控制台 → Web Analytics → 站点设置里复制,本身**非机密**:
 * 它公开嵌入在每个访客页面的 HTML 中(view-source 即可见),不属于密钥范畴。
 * 置空(token = "")即关闭统计,BaseLayout 不渲染 beacon 脚本。
 *
 * 参考:https://developers.cloudflare.com/analytics/web-analytics/
 */
export const CF_WEB_ANALYTICS = {
  /** 站点 token,Cloudflare Web Analytics 控制台获取 */
  token: "7d01869ba16c4b3b9d38bc15798c528b",
};
