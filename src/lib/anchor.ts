/**
 * Heading anchor ids — single source of truth.
 *
 * The heading-anchor rehype plugin (src/plugins/rehype-heading-anchors.mjs) assigns
 * every markdown h1-h6 a 6-char lowercase anchor id drawn from this charset, and the
 * TOC consumers (src/components/Toc.astro, src/layouts/MarkdownPostLayout.astro) only
 * count headings whose slug matches such an id (excluding sr-only / footnote auto
 * headings). Keeping the charset and the validity regex in one module prevents the two
 * sides from drifting apart.
 */

/** Lowercase letters minus the visually-confusable i/l/o (23 chars). */
export const ANCHOR_CHARSET = "abcdefghjkmnpqrstuvwxyz";

/** Matches exactly the plugin-assigned 6-char anchor ids (derived from the charset). */
export const ANCHOR_ID_REGEX = new RegExp(`^[${ANCHOR_CHARSET}]{6}$`);

/** Whether a slug is a plugin-assigned heading anchor id (6-char charset). */
export function isValidAnchorSlug(slug: string): boolean {
  return ANCHOR_ID_REGEX.test(slug);
}
