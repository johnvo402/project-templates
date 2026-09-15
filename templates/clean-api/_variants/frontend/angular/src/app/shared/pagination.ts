export type PaginationItem = number | 'ellipsis';

export function buildPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  const total = Math.max(0, Math.floor(totalPages));
  if (total === 0) return [];

  const current = Math.min(Math.max(1, Math.floor(currentPage)), total);
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const visible = new Set<number>([1, total, current - 1, current, current + 1]);

  if (current <= 4) {
    [2, 3, 4, 5].forEach(page => visible.add(page));
  }

  if (current >= total - 3) {
    [total - 4, total - 3, total - 2, total - 1].forEach(page => visible.add(page));
  }

  const pages = [...visible]
    .filter(page => page >= 1 && page <= total)
    .sort((left, right) => left - right);

  const items: PaginationItem[] = [];
  for (const page of pages) {
    const previous = items.at(-1);
    if (typeof previous === 'number' && page - previous > 1) items.push('ellipsis');
    items.push(page);
  }

  return items;
}
