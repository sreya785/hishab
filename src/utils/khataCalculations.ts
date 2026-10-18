import type {
  KhataRow,
  KhataStats,
  CustomerBaki,
  DailySalesSummary,
  LoanReadinessBreakdown,
} from '../types/khata.ts';
import { parseAmount, banglaToEnglishDigits } from './digitConverter.ts';

/**
 * Normalizes date strings (Bangla or English) to standard YYYY-MM-DD or DD/MM/YYYY.
 */
export function normalizeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const converted = banglaToEnglishDigits(dateStr).trim();

  // Try parsing ISO YYYY-MM-DD
  const isoMatch = converted.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Try parsing DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = converted.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, '0');
    const m = dmyMatch[2].padStart(2, '0');
    let y = dmyMatch[3];
    if (y.length === 2) y = '20' + y;
    return `${y}-${m}-${d}`;
  }

  return converted;
}

/**
 * Extracts a clean customer name from transaction description
 * for baki_given and baki_received.
 * e.g., "রহিম বাকি" -> "রহিম", "Baki - Karim Mia" -> "Karim Mia"
 */
export function extractCustomerName(description: string | null | undefined): string {
  if (!description) return 'সাধারণ খদ্দের (General)';
  let cleaned = description.trim();

  // Strip prefixes/suffixes like বাকি, baki, দেনা, পাওনা, আদায়
  cleaned = cleaned
    .replace(/(বাকি\s*দেওয়া|বাকি\s*আদায়|বাকি|দেনা|পাওনা|নগদ)/gi, '')
    .replace(/(baki\s*given|baki\s*received|baki|due|paid)/gi, '')
    .replace(/[:\-–—,\(\)]/g, ' ')
    .trim();

  if (!cleaned || cleaned.length < 2) {
    return description.trim() || 'সাধারণ খদ্দের (General)';
  }

  return cleaned;
}

/**
 * Computes all financial totals and statistics from khata rows.
 * Pure deterministic code calculation.
 */
export function calculateKhataStats(rows: KhataRow[]): KhataStats {
  const dailyMap = new Map<string, { sales: number; expenses: number; bakiGiven: number; bakiReceived: number }>();
  const customerBakiMap = new Map<
    string,
    { given: number; received: number; count: number; lastDate: string; oldestDate: string }
  >();
  const monthlyMap = new Map<string, number>();

  let totalSales = 0;
  let totalExpenses = 0;
  let totalBakiGiven = 0;
  let totalBakiReceived = 0;

  for (const row of rows) {
    const amount = parseAmount(row.amount);
    if (amount === null || amount < 0) continue;

    const rawDate = normalizeDate(row.date);
    const dateKey = rawDate || 'অজানা তারিখ (No Date)';

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, { sales: 0, expenses: 0, bakiGiven: 0, bakiReceived: 0 });
    }
    const dailyEntry = dailyMap.get(dateKey)!;

    if (row.type === 'sale') {
      totalSales += amount;
      dailyEntry.sales += amount;

      if (rawDate && rawDate.length >= 7) {
        const monthKey = rawDate.slice(0, 7); // YYYY-MM
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + amount);
      }
    } else if (row.type === 'expense') {
      totalExpenses += amount;
      dailyEntry.expenses += amount;
    } else if (row.type === 'baki_given') {
      totalBakiGiven += amount;
      dailyEntry.bakiGiven += amount;

      const custName = extractCustomerName(row.description);
      const custEntry = customerBakiMap.get(custName) || { given: 0, received: 0, count: 0, lastDate: rawDate, oldestDate: rawDate };
      custEntry.given += amount;
      custEntry.count += 1;
      if (rawDate) {
        if (!custEntry.oldestDate || rawDate < custEntry.oldestDate) custEntry.oldestDate = rawDate;
        if (!custEntry.lastDate || rawDate > custEntry.lastDate) custEntry.lastDate = rawDate;
      }
      customerBakiMap.set(custName, custEntry);
    } else if (row.type === 'baki_received') {
      totalBakiReceived += amount;
      dailyEntry.bakiReceived += amount;

      const custName = extractCustomerName(row.description);
      const custEntry = customerBakiMap.get(custName) || { given: 0, received: 0, count: 0, lastDate: rawDate, oldestDate: rawDate };
      custEntry.received += amount;
      custEntry.count += 1;
      if (rawDate) {
        if (!custEntry.lastDate || rawDate > custEntry.lastDate) custEntry.lastDate = rawDate;
      }
      customerBakiMap.set(custName, custEntry);
    }
  }

  // Build daily summaries sorted chronologically
  const dailySummaries: DailySalesSummary[] = [];
  const validDates = Array.from(dailyMap.keys()).filter((d) => d !== 'অজানা তারিখ (No Date)');
  validDates.sort();

  for (const date of validDates) {
    const entry = dailyMap.get(date)!;
    dailySummaries.push({
      date,
      formattedDate: date,
      sales: Math.round(entry.sales * 100) / 100,
      expenses: Math.round(entry.expenses * 100) / 100,
      bakiGiven: Math.round(entry.bakiGiven * 100) / 100,
      bakiReceived: Math.round(entry.bakiReceived * 100) / 100,
    });
  }

  // Include undated if present
  if (dailyMap.has('অজানা তারিখ (No Date)')) {
    const entry = dailyMap.get('অজানা তারিখ (No Date)')!;
    dailySummaries.push({
      date: 'No Date',
      formattedDate: 'অজানা তারিখ',
      sales: Math.round(entry.sales * 100) / 100,
      expenses: Math.round(entry.expenses * 100) / 100,
      bakiGiven: Math.round(entry.bakiGiven * 100) / 100,
      bakiReceived: Math.round(entry.bakiReceived * 100) / 100,
    });
  }

  const daysCount = validDates.length > 0 ? validDates.length : (rows.length > 0 ? 1 : 0);
  const averageDailyIncome = daysCount > 0 ? Math.round((totalSales / daysCount) * 100) / 100 : 0;

  // Best day and worst day calculation (only considering days with sales, or valid recorded days)
  let bestDay: { date: string; amount: number } | null = null;
  let worstDay: { date: string; amount: number } | null = null;

  const salesDays = dailySummaries.filter((d) => d.date !== 'No Date');
  if (salesDays.length > 0) {
    let maxSale = -1;
    let minSale = Infinity;
    for (const d of salesDays) {
      if (d.sales > maxSale) {
        maxSale = d.sales;
        bestDay = { date: d.date, amount: d.sales };
      }
      if (d.sales < minSale) {
        minSale = d.sales;
        worstDay = { date: d.date, amount: d.sales };
      }
    }
  }

  // Customers who owe money, sorted by:
  // 1. Biggest amount descending (b.outstanding - a.outstanding)
  // 2. Oldest debt date ascending (a.oldestDate compared to b.oldestDate)
  const allBakiCustomers: CustomerBaki[] = Array.from(customerBakiMap.entries())
    .map(([customerName, data]) => ({
      customerName,
      given: data.given,
      received: data.received,
      outstanding: Math.max(0, data.given - data.received),
      transactionCount: data.count,
      lastDate: data.lastDate,
      oldestDate: data.oldestDate,
    }))
    .filter((c) => c.outstanding > 0)
    .sort((a, b) => {
      // Primary: biggest amount first
      if (b.outstanding !== a.outstanding) {
        return b.outstanding - a.outstanding;
      }
      // Secondary: oldest debt first
      const dateA = a.oldestDate || '9999';
      const dateB = b.oldestDate || '9999';
      return dateA.localeCompare(dateB);
    });

  const topBakiCustomers = allBakiCustomers.slice(0, 5);

  const totalOutstandingBaki = Math.max(0, totalBakiGiven - totalBakiReceived);

  // Monthly totals array sorted
  const monthlyTotalSales = Array.from(monthlyMap.entries())
    .map(([month, amount]) => ({ month, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const dateRange = validDates.length > 0 ? {
    start: validDates[0],
    end: validDates[validDates.length - 1],
  } : null;

  return {
    totalSales: Math.round(totalSales * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    totalBakiGiven: Math.round(totalBakiGiven * 100) / 100,
    totalBakiReceived: Math.round(totalBakiReceived * 100) / 100,
    totalOutstandingBaki: Math.round(totalOutstandingBaki * 100) / 100,
    daysCount,
    averageDailyIncome,
    bestDay,
    worstDay,
    dailySummaries,
    topBakiCustomers,
    allBakiCustomers,
    monthlyTotalSales,
    dateRange,
  };
}

/**
 * Calculates Loan Readiness Score (0-100) strictly using pure code:
 * - 40 points: days recorded (30 or more days gets full 40 points)
 * - 30 points: consistency (how steady daily sales are)
 * - 30 points: average daily income compared with an editable threshold
 */
export function calculateLoanReadinessScore(
  stats: KhataStats,
  targetDailyIncome = 3000
): LoanReadinessBreakdown {
  const safeTarget = Math.max(500, targetDailyIncome);

  // 1. Days Recorded (0-40 points)
  // 30 or more days gets full 40 points
  const daysRecorded = stats.daysCount;
  const daysScore = Math.min(40, Math.round((daysRecorded / 30) * 40));

  // 2. Consistency Score (0-30 points)
  // Evaluates stability of daily sales using coefficient of variation (stdDev / mean)
  let consistencyScore = 0;
  let cv = 0;

  const dailyAmounts = stats.dailySummaries
    .filter((d) => d.date !== 'No Date')
    .map((d) => d.sales);

  if (dailyAmounts.length >= 2) {
    const mean = dailyAmounts.reduce((a, b) => a + b, 0) / dailyAmounts.length;
    if (mean > 0) {
      const variance =
        dailyAmounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        dailyAmounts.length;
      const stdDev = Math.sqrt(variance);
      cv = stdDev / mean;

      // If CV <= 0.15: exceptionally consistent (full 30 pts)
      // If CV >= 0.85: highly irregular (low points)
      // Linear scale between 0.15 and 0.85
      if (cv <= 0.15) {
        consistencyScore = 30;
      } else if (cv >= 0.85) {
        consistencyScore = Math.max(5, Math.round((1 - Math.min(1.5, cv)) * 10));
      } else {
        const factor = 1 - (cv - 0.15) / (0.85 - 0.15);
        consistencyScore = Math.round(10 + factor * 20);
      }
    }
  } else if (dailyAmounts.length === 1 && dailyAmounts[0] > 0) {
    consistencyScore = 10;
  }

  // 3. Daily Income vs Target Threshold (0-30 points)
  const incomeRatio = stats.averageDailyIncome / safeTarget;
  const incomeScore = Math.min(30, Math.round(incomeRatio * 30));

  const totalScore = Math.min(100, Math.max(0, daysScore + consistencyScore + incomeScore));

  let grade: LoanReadinessBreakdown['grade'] = 'Needs Improvement';
  if (totalScore >= 80) grade = 'Excellent';
  else if (totalScore >= 65) grade = 'Good';
  else if (totalScore >= 50) grade = 'Moderate';

  // Actionable tips explaining what would raise the score
  const tips: { bn: string; en: string }[] = [];

  if (daysRecorded < 30) {
    const missingDays = 30 - daysRecorded;
    tips.push({
      bn: `কমপক্ষে আরও ${missingDays} দিনের খাতা আপলোড করুন (৩০ দিন পূর্ণ হলে ৪০-এ ৪০ পয়েন্ট পাবেন)।`,
      en: `Record at least ${missingDays} more days to get full 40/40 points on ledger history.`,
    });
  } else {
    tips.push({
      bn: `অসাধারণ! ৩০ দিনের বেশি খাতার রেকর্ড রয়েছে (৪০-এ পূর্ণ পয়েন্ট)।`,
      en: `Great! 30+ days of history verified (full 40/40 points).`,
    });
  }

  if (consistencyScore < 24) {
    tips.push({
      bn: `দৈনিক বিক্রির তারতম্য কম রাখুন ও প্রতি কর্মদিবসের হিসাব নিয়মিত তুলুন (ধারাবাহিক বিক্রিতে ৩০ পয়েন্ট পর্যন্ত মিলবে)।`,
      en: `Record sales every single business day without skipping days to raise consistency points.`,
    });
  }

  if (incomeScore < 25) {
    tips.push({
      bn: `গড় দৈনিক বিক্রি লক্ষমাত্রার (৳${safeTarget.toLocaleString()}) কাছাকাছি পৌঁছালে আয় স্কোরে আরও পয়েন্ট যোগ হবে।`,
      en: `Reach your daily income target (৳${safeTarget.toLocaleString()}) to maximize income points.`,
    });
  }

  if (stats.totalOutstandingBaki > stats.totalSales * 0.4 && stats.totalSales > 0) {
    tips.push({
      bn: `বাকি পাওনা আদায়ের গতি বাড়ান। অতিরিক্ত বাকি থাকলে ব্যাংক ঋণ মঞ্জুরিতে ঝুঁকি মনে করতে পারে।`,
      en: `Recover outstanding customer dues promptly. High baki may be viewed as credit risk.`,
    });
  }

  return {
    totalScore,
    daysScore,
    consistencyScore,
    incomeScore,
    daysRecorded,
    targetDailyIncome: safeTarget,
    averageDailyIncome: stats.averageDailyIncome,
    consistencyMetric: Math.round(cv * 100) / 100,
    grade,
    tips,
  };
}
