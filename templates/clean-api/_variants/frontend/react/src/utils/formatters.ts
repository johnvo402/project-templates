export function formatCurrency(value: number, currency = 'USD', locale?: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value ?? 0);
}

export function formatDate(value: string | Date, locale?: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));
}

export function formatDateTime(value: string | Date, locale?: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
