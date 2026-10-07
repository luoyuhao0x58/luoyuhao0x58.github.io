import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

/**
 * Resolve a post's URL slug: explicit frontmatter `slug` wins, otherwise derive
 * it from the collection id (first path segment). Shared by the post pages,
 * sitemap and RSS feed so all three stay in sync.
 */
export function postSlug(post: CollectionEntry<"posts">): string {
  return post.data.slug ?? post.id.split("/")[1] ?? "";
}

/**
 * Map of language code → tag → number of posts carrying that tag.
 * Only tags actually used by at least one post in that language appear.
 */
export type TagCounts = Map<string, Map<string, number>>;

/**
 * Single source of truth for tag statistics, shared by the tag list pages,
 * their pagination routes and the sitemap so all three stay in sync.
 * Keys are inserted in post iteration order, matching the previous per-page logic.
 */
export async function getTagCounts(): Promise<TagCounts> {
  const posts = await getCollection("posts");
  const counts: TagCounts = new Map();
  for (const post of posts) {
    const byLang = counts.get(post.data.lang) ?? new Map<string, number>();
    for (const tag of post.data.tags) {
      byLang.set(tag, (byLang.get(tag) ?? 0) + 1);
    }
    counts.set(post.data.lang, byLang);
  }
  return counts;
}
