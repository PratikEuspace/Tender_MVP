/**
 * Frontend-only input filters — applied in Inputboxfield before onChangeText.
 * Save/repository layers unchanged (they already strip formatting on persist).
 */

/** Names, departments, status labels — no digits. */
export const sanitizeTextOnly = (value) =>
  String(value ?? '').replace(/[0-9]/g, '');

/**
 * Codes / references — letters, digits, spaces, common separators.
 * Examples: ERK-2025-0001, FY 2025-26, DKT 005-2035
 */
export const sanitizeAlphanumeric = (value) =>
  String(value ?? '').replace(/[^a-zA-Z0-9\s\-_/.]/g, '');

/** ₹ amounts — digits, thousand separators (commas), optional decimal point. */
export const sanitizeAmount = (value) => {
  const raw = String(value ?? '');
  let out = '';
  let hasDot = false;

  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
    if (ch >= '0' && ch <= '9') {
      out += ch;
    } else if (ch === ',') {
      out += ch;
    } else if (ch === '.' && !hasDot) {
      out += ch;
      hasDot = true;
    }
  }

  return out;
};

/** Percentages / decimals — digits and at most one dot. */
export const sanitizeDecimal = (value) => {
  const raw = String(value ?? '');
  let out = '';
  let hasDot = false;

  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
    if (ch >= '0' && ch <= '9') {
      out += ch;
    } else if (ch === '.' && !hasDot) {
      out += ch;
      hasDot = true;
    }
  }

  return out;
};

/** Mobile / contact — digits only. */
export const sanitizeDigitsOnly = (value) =>
  String(value ?? '').replace(/\D/g, '');

const SANITIZERS_BY_TYPE = {
  textOnly: sanitizeTextOnly,
  alphanumeric: sanitizeAlphanumeric,
  number: sanitizeAmount,
  amount: sanitizeAmount,
  decimal: sanitizeDecimal,
  phone: sanitizeDigitsOnly,
};

export const sanitizeForInputType = (type, value) => {
  const sanitize = SANITIZERS_BY_TYPE[type];
  return sanitize ? sanitize(value) : value;
};
