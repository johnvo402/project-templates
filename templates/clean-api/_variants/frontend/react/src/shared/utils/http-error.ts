export function getErrorMessage(error: unknown, fallback = 'The request could not be completed.') {
  if (error instanceof Error && error.message) return error.message;
  if (!error || typeof error !== 'object') return fallback;

  const record = error as Record<string, unknown>;
  for (const key of ['detail', 'title', 'message']) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
  }

  const validationErrors = record.errors;
  if (validationErrors && typeof validationErrors === 'object') {
    for (const value of Object.values(validationErrors as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        const first = value.find(item => typeof item === 'string' && item.trim());
        if (typeof first === 'string') return first;
      }
    }
  }

  return fallback;
}
