export type ListFilter = {
  field: string;
  operator: '$eq' | '$eqi' | '$lte' | '$gte';
  value: string | number | boolean;
};

export type ListQuery = {
  page: number;
  pageSize: number;
  keyword?: string;
  targets?: string[];
  sort?: string;
  filters?: ListFilter[];
};

export const FILTER_ENABLED = false;

export function buildListUrl(resource: 'products' | 'orders' | 'employees', query: ListQuery): string {
  const params = new URLSearchParams({ page: String(query.page), pageSize: String(query.pageSize) });
  return `/api/${resource}?${params.toString()}`;
}
