/** Shared pagination configuration and helpers for all list pages (home, category, tag). */

export const PAGE_SIZE = 10;

/** Shape of the pagination object consumed by Pagination.astro (mirrors Astro's Page<T> subset). */
export interface PaginationInfo<T> {
  data: T[];
  start: number;
  end: number;
  total: number;
  size: number;
  currentPage: number;
  lastPage: number;
  url: {
    current: string;
    prev: string | undefined;
    next: string | undefined;
    first: string | undefined;
    last: string | undefined;
  };
}

/**
 * Build the "page 1" pagination object for a statically rendered list.
 * Page 1 lives on the index route (e.g. `/zh/`); subsequent pages are generated
 * by the sibling `page/[...page].astro` route via Astro's paginate().
 * Filled with the same fields as Astro's `Page<T>`, so it is assignable to it.
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
    start: 1,
    end: Math.min(PAGE_SIZE, items.length),
    total: items.length,
    size: PAGE_SIZE,
    currentPage: 1,
    lastPage,
    url: {
      current: currentUrl,
      prev: undefined,
      next: lastPage > 1 ? `${pageBaseUrl}/page/2/` : undefined,
      first: undefined,
      last: lastPage > 1 ? `${pageBaseUrl}/page/${lastPage}/` : undefined,
    },
  };
}
