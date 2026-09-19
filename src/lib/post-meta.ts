/**
 * 文章元数据辅助(时间等)。
 * 呈现规则尚未最终确定:此处仅沉淀取值逻辑,页面引用时一处调用即可。
 */

interface PostTimeMeta {
  data: { updated?: Date; pubDate: Date };
}

/**
 * 文章最后修改时间:frontmatter 填了 `updated` 用之,否则回退到首次发布时间。
 * 语义:内容每次修订应更新 `updated`;未填表示尚未修订过,以发布为准。
 */
export function postUpdatedAt(post: PostTimeMeta): Date {
  return post.data.updated ?? post.data.pubDate;
}
