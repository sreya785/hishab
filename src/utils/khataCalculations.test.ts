import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseAmount,
  banglaToEnglishDigits,
  englishToBanglaDigits,
  formatTaka,
} from './digitConverter.ts';
import {
  normalizeDate,
  extractCustomerName,
  calculateKhataStats,
  calculateLoanReadinessScore,
} from './khataCalculations.ts';
import type { KhataRow } from '../types/khata.ts';

test('banglaToEnglishDigits converts Bengali numbers correctly', () => {
  assert.equal(banglaToEnglishDigits('০১২৩৪৫৬৭৮৯'), '0123456789');
  assert.equal(banglaToEnglishDigits('১২৫০ টাকা'), '1250 টাকা');
  assert.equal(banglaToEnglishDigits('১০/০৩/২০২৬'), '10/03/2026');
  assert.equal(banglaToEnglishDigits('5০0'), '500'); // mixed digits
});

test('englishToBanglaDigits converts English numbers to Bengali numbers', () => {
  assert.equal(englishToBanglaDigits('0123456789'), '০১২৩৪৫৬৭৮৯');
  assert.equal(englishToBanglaDigits(1500), '১৫০০');
});

test('parseAmount extracts numbers from Bengali and English representations', () => {
  assert.equal(parseAmount('১,২৫০'), 1250);
  assert.equal(parseAmount('৳ ২,৫০০.৫০'), 2500.5);
  assert.equal(parseAmount('Tk 750/-'), 750);
  assert.equal(parseAmount(420), 420);
  assert.equal(parseAmount(null), null);
  assert.equal(parseAmount(''), null);
  assert.equal(parseAmount('unclear'), null);
});

test('normalizeDate parses both ISO and DD-MM-YYYY formats with Bangla digits', () => {
  assert.equal(normalizeDate('২০২৬-০৩-১৫'), '2026-03-15');
  assert.equal(normalizeDate('15/03/2026'), '2026-03-15');
  assert.equal(normalizeDate('১৫-০৩-২৬'), '2026-03-15');
});

test('extractCustomerName strips prefixes like baki, dena, paona', () => {
  assert.equal(extractCustomerName('রহিম বাকি'), 'রহিম');
  assert.equal(extractCustomerName('বাকি দেওয়া - করিম'), 'করিম');
  assert.equal(extractCustomerName('Baki: Kamal Mia'), 'Kamal Mia');
  assert.equal(extractCustomerName('বাকি আদায় রহিম'), 'রহিম');
});

test('calculateKhataStats correctly computes sales, baki, expenses, and averages', () => {
  const rows: KhataRow[] = [
    { id: '1', date: '2026-03-01', description: 'চাল ৫০ কেজি', type: 'sale', amount: '৩,৫০০' },
    { id: '2', date: '2026-03-01', description: 'রহিম বাকি', type: 'baki_given', amount: '৫০০' },
    { id: '3', date: '2026-03-01', description: 'দোকান ঝাড়ু ও চা খরচ', type: 'expense', amount: '১২০' },
    { id: '4', date: '2026-03-02', description: 'তেল ও ডাল বিক্রি', type: 'sale', amount: '৪,২০০' },
    { id: '5', date: '2026-03-02', description: 'রহিম বাকি আদায়', type: 'baki_received', amount: '৩০০' },
    { id: '6', date: '2026-03-02', description: 'করিম বাকি', type: 'baki_given', amount: '৭০০' },
  ];

  const stats = calculateKhataStats(rows);

  assert.equal(stats.totalSales, 7700);
  assert.equal(stats.totalExpenses, 120);
  assert.equal(stats.totalBakiGiven, 1200);
  assert.equal(stats.totalBakiReceived, 300);
  assert.equal(stats.totalOutstandingBaki, 900);
  assert.equal(stats.daysCount, 2);
  assert.equal(stats.averageDailyIncome, 3850);
  assert.equal(stats.bestDay?.date, '2026-03-02');
  assert.equal(stats.bestDay?.amount, 4200);
  assert.equal(stats.worstDay?.date, '2026-03-01');
  assert.equal(stats.worstDay?.amount, 3500);

  // Top baki customer:
  // Karim has 700 - 0 = 700
  // Rahim has 500 - 300 = 200
  assert.equal(stats.topBakiCustomers.length, 2);
  assert.equal(stats.topBakiCustomers[0].customerName, 'করিম');
  assert.equal(stats.topBakiCustomers[0].outstanding, 700);
  assert.equal(stats.topBakiCustomers[1].customerName, 'রহিম');
  assert.equal(stats.topBakiCustomers[1].outstanding, 200);
});

test('calculateLoanReadinessScore computes 40/30/30 point breakdown', () => {
  // Test case 1: 30 days recorded -> 40 points on days
  // steady sales -> ~30 points consistency
  // meets target 3000 -> 30 points
  const rows: KhataRow[] = [];
  for (let i = 1; i <= 30; i++) {
    const dayStr = i < 10 ? `0${i}` : `${i}`;
    rows.push({
      id: `sale-${i}`,
      date: `2026-03-${dayStr}`,
      description: 'নগদ বিক্রি',
      type: 'sale',
      amount: 3200 + (i % 3) * 50, // steady 3200 - 3300
    });
  }

  const stats = calculateKhataStats(rows);
  const score = calculateLoanReadinessScore(stats, 3000);

  assert.equal(score.daysRecorded, 30);
  assert.equal(score.daysScore, 40); // 30+ days gets full 40
  assert.equal(score.incomeScore, 30); // Avg daily income ~3250 >= 3000 target
  assert.ok(score.consistencyScore >= 25); // Very steady
  assert.ok(score.totalScore >= 95);
  assert.equal(score.grade, 'Excellent');

  // Test case 2: 15 days recorded -> 20 points on days
  const halfRows = rows.slice(0, 15);
  const halfStats = calculateKhataStats(halfRows);
  const halfScore = calculateLoanReadinessScore(halfStats, 3000);

  assert.equal(halfScore.daysScore, 20); // 15/30 * 40 = 20
});

test('allBakiCustomers is sorted by biggest amount and oldest debt date', () => {
  const rows: KhataRow[] = [
    // Customer A: 500 baki starting 2026-03-05
    { id: '1', date: '2026-03-05', description: 'Customer A বাকি', type: 'baki_given', amount: 500 },
    // Customer B: 1000 baki starting 2026-03-08
    { id: '2', date: '2026-03-08', description: 'Customer B বাকি', type: 'baki_given', amount: 1000 },
    // Customer C: 500 baki starting 2026-03-01 (older than Customer A)
    { id: '3', date: '2026-03-01', description: 'Customer C বাকি', type: 'baki_given', amount: 500 },
  ];

  const stats = calculateKhataStats(rows);
  assert.equal(stats.allBakiCustomers.length, 3);
  // Customer B has biggest amount (1000) -> 1st
  assert.equal(stats.allBakiCustomers[0].customerName, 'Customer B');
  assert.equal(stats.allBakiCustomers[0].outstanding, 1000);

  // Customer C and A both have 500, but Customer C owes since 2026-03-01 (older) -> 2nd
  assert.equal(stats.allBakiCustomers[1].customerName, 'Customer C');
  assert.equal(stats.allBakiCustomers[1].oldestDate, '2026-03-01');

  // Customer A owes since 2026-03-05 -> 3rd
  assert.equal(stats.allBakiCustomers[2].customerName, 'Customer A');
});

test('generateBakiReminderMessage and WhatsApp / SMS URLs', async () => {
  const { generateBakiReminderMessage, getWhatsAppReminderUrl, getSmsReminderUrl, convertLedgerToCsv } =
    await import('./bakiReminder.ts');

  const msg = generateBakiReminderMessage('রহিম মিয়া', 1250, 'মা বাবার দোয়া স্টোর');
  assert.ok(msg.includes('রহিম মিয়া'));
  assert.ok(msg.includes('1,250'));
  assert.ok(msg.includes('মা বাবার দোয়া স্টোর'));

  const waUrl = getWhatsAppReminderUrl('রহিম মিয়া', 1250, 'মা বাবার দোয়া স্টোর');
  assert.ok(waUrl.startsWith('https://wa.me/?text='));
  assert.ok(waUrl.includes(encodeURIComponent('রহিম মিয়া')));

  const smsUrl = getSmsReminderUrl('রহিম মিয়া', 1250, 'মা বাবার দোয়া স্টোর');
  assert.ok(smsUrl.startsWith('sms:?body='));

  // CSV conversion
  const csv = convertLedgerToCsv([
    { id: '1', date: '2026-03-01', description: 'চাল বিক্রি', type: 'sale', amount: 3500 },
  ]);
  assert.ok(csv.startsWith('\uFEFF')); // UTF-8 BOM
  assert.ok(csv.includes('2026-03-01'));
  assert.ok(csv.includes('চাল বিক্রি'));
  assert.ok(csv.includes('3500'));
});

test('generate30DaySampleKhata marks every row as sample and sample removal keeps all real rows', async () => {
  const { generate30DaySampleKhata } = await import('./sampleKhataData.ts');

  const sampleRows = generate30DaySampleKhata();
  assert.equal(sampleRows.length, 92);
  // Verify EVERY single sample row has isSample: true
  assert.ok(sampleRows.every((r) => r.isSample === true));

  // Add 12 real extracted rows
  const realRows: KhataRow[] = [];
  for (let i = 1; i <= 12; i++) {
    realRows.push({
      id: `extracted-${i}`,
      date: '2026-03-10',
      description: `আসল খাতা এন্ট্রি ${i}`,
      type: 'sale',
      amount: 1000 + i * 50,
      isSample: false,
    });
  }

  const combinedLedger = [...sampleRows, ...realRows];
  assert.equal(combinedLedger.length, 104);

  // Removing sample rows:
  const afterRemoveSample = combinedLedger.filter((r) => r.isSample !== true);
  assert.equal(afterRemoveSample.length, 12);
  assert.ok(afterRemoveSample.every((r) => r.isSample === false));
  assert.equal(afterRemoveSample[0].description, 'আসল খাতা এন্ট্রি 1');
});

