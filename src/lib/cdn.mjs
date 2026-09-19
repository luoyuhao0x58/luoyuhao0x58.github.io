/**
 * 图片 CDN 配置(发布前按需修改)。
 *
 * 用法:图片地址在 frontmatter 或 markdown 正文里**明写**占位符,
 * 渲染/构建时由 expandCdnBase() 把占位符替换为下面的 CDN 域名:
 *
 *   url: "{cdn_base_url}/images/about-photo.png"
 *     → https://static.nettix.top/images/about-photo.png
 *
 * 不写占位符的站内路径(/images/xxx.png)或外部 URL(http/https)保持原样,
 * 框架不做任何自动改写——"站内的链接就保持站内的"。
 */
export const CDN_BASE_URL = "https://static.nettix.top";

/** markdown 里明写的占位符(注意:YAML frontmatter 中以 { 开头是 flow 语法,必须加引号) */
export const CDN_PLACEHOLDER = "{cdn_base_url}";

/** 把字符串中的 {cdn_base_url} 占位符替换为实际 CDN 域名;不含占位符则原样返回。 */
export function expandCdnBase(src) {
  if (!src) return src;
  return src.split(CDN_PLACEHOLDER).join(CDN_BASE_URL);
}
