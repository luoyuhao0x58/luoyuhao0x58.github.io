/** Shared pagination configuration and helpers for all list pages (home, category, tag). */

export const PAGE_SIZE = 10;

/** Shape of the pagination object consumed by Pagination.astro (mirrors Astro's Page<T> subset). */
export interface PaginationInfo<T> {
  data: T[];
  currentPage: number;
  lastPage: number;
  url: {
    current?: string;
    next?: string;
    prev?: string;
    first?: string;
    last?: string;
  };
}

/**
 * Build the "page 1" pagination object for a statically rendered list.
 * Page 1 lives on the index route (e.g. `/zh/`); subsequent pages are generated
 * by the sibling `page/[...page].astro` route via Astro's paginate().
 *
 * @param items Full list (already sorted) to paginate over.
 * @param currentUrl URL of this index page (page 1).
 * @param pageBaseUrl Base path for page-1-off routes, e.g. `/zh` or `/zh/category/tech`.
 */
export function firstPage<T>(
  items: T[],
  currentUrl: string,
  pageBaseUrl: string,
): PaginationInfo<T> {
  const lastPage = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  return {
    data: items.slice(0, PAGE_SIZE),
    currentPage: 1,
    lastPage,
    url: {
      current: currentUrl,
      next: lastPage > 1 ? `${pageBaseUrl}/page/2/` : undefined,
      prev: undefined,
      first: undefined,
      last: lastPage > 1 ? `${pageBaseUrl}/page/${lastPage}/` : undefined,
    },
  };
}
