let configuredCurrency = 'VND';

export function configureCurrency(currency: string | null | undefined): void {
  const normalized = currency?.trim().toUpperCase() ?? '';
  configuredCurrency = /^[A-Z]{3}$/.test(normalized) ? normalized : 'VND';
}

export function getConfiguredCurrency(): string {
  return configuredCurrency;
}

export function formatCurrency(value: number, currency = configuredCurrency, locale?: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value ?? 0);
}

export function formatDate(value: string | Date, locale?: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));
}

export function formatDateTime(value: string | Date, locale?: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
