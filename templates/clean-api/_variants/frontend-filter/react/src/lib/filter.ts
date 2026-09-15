export type FilterOperator =
  | '$eq'
  | '$eqi'
  | '$ne'
  | '$nei'
  | '$in'
  | '$notin'
  | '$lt'
  | '$lte'
  | '$gt'
  | '$gte'
  | '$between'
  | '$contains'
  | '$containsi'
  | '$notcontains'
  | '$notcontainsi'
  | '$startswith'
  | '$endswith';

export type FilterInput = Record<string, unknown>;

type QueryValue = string | number | boolean | Date;

function appendValue(entries: string[], key: string, value: unknown): void {
  if (value === null || value === undefined) return;

  if (Array.isArray(value)) {
    value.forEach((item, index) => appendValue(entries, `${key}[${index}]`, item));
    return;
  }

  if (value instanceof Date) {
    entries.push(`${key}=${encodeURIComponent(value.toISOString())}`);
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([nestedKey, nestedValue]) => {
      appendValue(entries, `${key}[${nestedKey}]`, nestedValue);
    });
    return;
  }

  if (typeof value === 'string' && value.trim().length === 0) return;

  entries.push(`${key}=${encodeURIComponent(String(value as QueryValue))}`);
}

/**
 * Builds VietWash-style LHS bracket filters, for example:
 * filter[Title][$containsi]=wash
 * filter[$or][0][IsCompleted][$eq]=true
 * filter[$or][1][Title][$startswith]=VIP
 */
export function buildFilterQuery(filterObject: FilterInput): string {
  const entries: string[] = [];
  appendValue(entries, 'filter', filterObject);
  return entries.join('&');
}
