/** Cursor-free pagination helpers for list pages (`?seite=2`). */
export interface Page {
  page: number;
  perPage: number;
  skip: number;
  take: number;
}

export function parsePage(value: string | string[] | undefined, perPage = 20): Page {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Math.max(1, Math.min(10_000, Number.parseInt(raw ?? "1", 10) || 1));
  return { page, perPage, skip: (page - 1) * perPage, take: perPage };
}

export function pageCount(total: number, perPage: number): number {
  return Math.max(1, Math.ceil(total / perPage));
}

/** Builds a URL with the page parameter replaced, keeping the other params. */
export function pageHref(basePath: string, params: Record<string, string | undefined>, page: number): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) search.set(k, v);
  if (page > 1) search.set("seite", String(page));
  else search.delete("seite");
  const q = search.toString();
  return q ? `${basePath}?${q}` : basePath;
}
