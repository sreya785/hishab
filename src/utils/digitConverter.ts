/**
 * Utilities for converting between Bangla (০-৯) and English (0-9) digits,
 * parsing amounts, and formatting Taka currency.
 */

const BANGLA_TO_ENG_DIGITS: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

const ENG_TO_BANGLA_DIGITS: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

/**
 * Converts a string with Bangla or mixed digits into English digits string.
 */
export function banglaToEnglishDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  return str.replace(/[০-৯]/g, (match) => BANGLA_TO_ENG_DIGITS[match] || match);
}

/**
 * Converts an English digits string or number into Bangla digits string.
 */
export function englishToBanglaDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  return str.replace(/[0-9]/g, (match) => ENG_TO_BANGLA_DIGITS[match] || match);
}

/**
 * Safely parses an amount from mixed Bangla/English input.
 * Strips currency symbols like ৳, Tk, commas, spaces.
 * Returns null if the value is null, undefined, empty, or not a valid number.
 */
export function parseAmount(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    return isNaN(val) ? null : Math.round(val * 100) / 100;
  }

  const str = String(val).trim();
  if (!str) return null;

  // Convert any Bengali digits to English
  const normalized = banglaToEnglishDigits(str);

  // Remove currency signs (৳, Tk, tk, /-, =, - etc) and thousand commas
  const cleaned = normalized
    .replace(/[৳Tk\s,\/=\-]/gi, '')
    .trim();

  if (!cleaned) return null;

  const num = Number(cleaned);
  if (isNaN(num)) return null;

  return Math.round(num * 100) / 100;
}

/**
 * Formats a number into Bangladeshi Taka string with ৳ symbol and commas.
 */
export function formatTaka(val: number | null | undefined, useBanglaDigits = false): string {
  if (val === null || val === undefined || isNaN(val)) return '৳০';
  const rounded = Math.round(val);
  const formattedEn = '৳' + rounded.toLocaleString('en-IN');
  if (useBanglaDigits) {
    return englishToBanglaDigits(formattedEn);
  }
  return formattedEn;
}
