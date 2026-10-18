import type { KhataRow } from '../types/khata.ts';
import { formatTaka } from './digitConverter.ts';

/**
 * Generates a ready, polite Bangla reminder message for customer baki.
 */
export function generateBakiReminderMessage(
  customerName: string,
  amount: number,
  shopName = 'আমাদের দোকান'
): string {
  const formattedAmt = formatTaka(amount, false);
  return `আসসালামু আলাইকুম ${customerName} ভাই/সাহেব, ${shopName} থেকে বিনীত অনুরোধ: আপনার কাছে আমাদের দোকানের পূর্বের মোট ${formattedAmt} বাকি রয়েছে। সুবিধাজনক সময়ে হিসাবটি পরিষ্কার করার জন্য অনুরোধ জানাচ্ছি। কোনো ভুল থাকলে জানাবেন। ধন্যবাদ!`;
}

/**
 * Creates WhatsApp reminder URL (wa.me link).
 */
export function getWhatsAppReminderUrl(
  customerName: string,
  amount: number,
  shopName = 'আমাদের দোকান',
  phone = ''
): string {
  const message = generateBakiReminderMessage(customerName, amount, shopName);
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone) {
    const intlPhone = cleanPhone.startsWith('880') ? cleanPhone : cleanPhone.startsWith('0') ? `88${cleanPhone}` : cleanPhone;
    return `https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`;
  }
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Creates SMS reminder URL (sms: link).
 */
export function getSmsReminderUrl(
  customerName: string,
  amount: number,
  shopName = 'আমাদের দোকান',
  phone = ''
): string {
  const message = generateBakiReminderMessage(customerName, amount, shopName);
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone) {
    return `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
  }
  return `sms:?body=${encodeURIComponent(message)}`;
}

/**
 * Exports all ledger rows (date, description, type, amount) to Excel-compatible CSV format.
 * Includes UTF-8 BOM (\uFEFF) so Bengali characters open properly in Microsoft Excel and Google Sheets.
 */
export function convertLedgerToCsv(rows: KhataRow[]): string {
  const headers = ['Date', 'Description', 'Type', 'Amount'];
  const banglaHeaders = ['তারিখ (Date)', 'বিবরণ (Description)', 'লেনদেনের ধরণ (Type)', 'টাকার অঙ্ক (Amount)'];

  const typeLabels: Record<string, string> = {
    sale: 'নগদ বিক্রি (Sale)',
    baki_given: 'বাকি দেওয়া (Baki Given)',
    baki_received: 'বাকি আদায় (Baki Received)',
    expense: 'দোকানের খরচ (Expense)',
  };

  const escapeCsv = (str: string | null | undefined): string => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const lines = [
    banglaHeaders.map((h) => `"${h}"`).join(','),
  ];

  for (const row of rows) {
    const dateVal = escapeCsv(row.date);
    const descVal = escapeCsv(row.description);
    const typeVal = escapeCsv(typeLabels[row.type || ''] || row.type || '');
    const amountVal = row.amount !== null && row.amount !== undefined ? Number(row.amount) || 0 : 0;

    lines.push([dateVal, descVal, typeVal, amountVal].join(','));
  }

  // Prepend UTF-8 BOM (\uFEFF) for proper Excel Bengali encoding
  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Triggers browser download of the ledger CSV file.
 */
export function downloadLedgerCsv(rows: KhataRow[], filename = 'hishab_ledger.csv'): void {
  const csvContent = convertLedgerToCsv(rows);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
