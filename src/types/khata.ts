export type TransactionType = 'sale' | 'baki_given' | 'baki_received' | 'expense';

export interface KhataRow {
  id: string;
  date: string | null;
  description: string | null;
  type: TransactionType | null;
  amount: number | string | null;
  rawAmount?: string | null;
  pageId?: string;
  unclearFields?: ('date' | 'description' | 'type' | 'amount')[];
  isSample?: boolean;
}

export interface ShopProfile {
  shopName: string;
  ownerName: string;
  phone: string;
  marketAddress: string;
  businessType: string;
  dailyIncomeTarget: number;
}

export interface CustomerBaki {
  customerName: string;
  given: number;
  received: number;
  outstanding: number;
  transactionCount: number;
  lastDate?: string;
  oldestDate?: string;
}

export interface DailySalesSummary {
  date: string;
  formattedDate: string;
  sales: number;
  expenses: number;
  bakiGiven: number;
  bakiReceived: number;
}

export interface KhataStats {
  totalSales: number;
  totalExpenses: number;
  totalBakiGiven: number;
  totalBakiReceived: number;
  totalOutstandingBaki: number;
  daysCount: number;
  averageDailyIncome: number;
  bestDay: { date: string; amount: number } | null;
  worstDay: { date: string; amount: number } | null;
  dailySummaries: DailySalesSummary[];
  topBakiCustomers: CustomerBaki[];
  allBakiCustomers: CustomerBaki[];
  monthlyTotalSales: { month: string; amount: number }[];
  dateRange: { start: string; end: string } | null;
}

export interface LoanReadinessBreakdown {
  totalScore: number;
  daysScore: number; // Max 40
  consistencyScore: number; // Max 30
  incomeScore: number; // Max 30
  daysRecorded: number;
  targetDailyIncome: number;
  averageDailyIncome: number;
  consistencyMetric: number; // Coefficient of variation or consistency percentage
  grade: 'Excellent' | 'Good' | 'Moderate' | 'Needs Improvement';
  tips: { bn: string; en: string }[];
}
