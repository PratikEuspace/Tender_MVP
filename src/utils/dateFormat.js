// Normalise form values to DD/MM/YYYY for SQLite TEXT columns.

export const formatDateForStorage = (value) => {
  if (value == null || value === '') return '';

  if (value instanceof Date) {
    if (isNaN(value.getTime())) return '';
    const d = String(value.getDate()).padStart(2, '0');
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const y = value.getFullYear();
    return `${d}/${m}/${y}`;
  }

  const s = String(value).trim();
  if (!s || s === '{}' || s === '[object Object]') return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;

  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) {
    const d = String(parsed.getDate()).padStart(2, '0');
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const y = parsed.getFullYear();
    return `${d}/${m}/${y}`;
  }

  return s;
};

/** Parse stored DD/MM/YYYY (or ISO) to Date; null when empty/invalid. */
export const parseStoredDate = (value) => {
  const stored = formatDateForStorage(value);
  if (!stored) return null;

  const slashParts = stored.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashParts) {
    const d = Number(slashParts[1]);
    const m = Number(slashParts[2]);
    const y = Number(slashParts[3]);
    const date = new Date(y, m - 1, d);
    if (!Number.isNaN(date.getTime())) return date;
  }

  const parsed = new Date(stored);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/** Native date picker value when field may be empty. */
export const parseStoredDateForPicker = (value) => parseStoredDate(value) ?? new Date();
