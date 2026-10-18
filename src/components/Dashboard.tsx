import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Award,
  AlertCircle,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  MessageSquare,
  FileDown,
  CalendarClock,
  Send,
} from 'lucide-react';
import { KhataStats, CustomerBaki, ShopProfile } from '../types/khata';
import { formatTaka, englishToBanglaDigits } from '../utils/digitConverter';
import { BakiReminderModal } from './BakiReminderModal';

interface DashboardProps {
  stats: KhataStats;
  profile: ShopProfile;
  onNavigateToScan: () => void;
  onExportCsv?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  profile,
  onNavigateToScan,
  onExportCsv,
}) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [selectedReminderCustomer, setSelectedReminderCustomer] = useState<CustomerBaki | null>(null);
  const [showAllBaki, setShowAllBaki] = useState(false);

  // If no data is available
  if (stats.daysCount === 0 || stats.dailySummaries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-xl mx-auto shadow-xs">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">লেজারে এখনো কোনো হিসাব নেই</h3>
        <p className="text-sm text-gray-600 mb-6">
          খাতার ছবি আপলোড করুন অথবা ডেমো দেখতে "নমুনা খাতা লোড করুন" বাটনে ক্লিক করুন।
        </p>
        <button
          onClick={onNavigateToScan}
          className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm transition"
        >
          খাতা স্ক্যান বা নমুনা দেখুন
        </button>
      </div>
    );
  }

  // Calculate highest daily sale for chart scaling
  const maxDailySale = Math.max(
    1,
    ...stats.dailySummaries.filter((d) => d.date !== 'No Date').map((d) => d.sales)
  );

  // Filter valid dates for the bar chart
  const chartDays = stats.dailySummaries.filter((d) => d.date !== 'No Date');

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Total Sales */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-emerald-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold text-emerald-800">মোট বিক্রি</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-gray-950">
            {formatTaka(stats.totalSales)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Total Sales ({stats.dailySummaries.length} days)
          </div>
        </div>

        {/* Card 2: Average Daily Income */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-blue-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold text-blue-800">দৈনিক গড় আয়</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-blue-900">
            {formatTaka(stats.averageDailyIncome)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Average Daily Income
          </div>
        </div>

        {/* Card 3: Best Day */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-amber-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold text-amber-800">সেরা বিক্রির দিন</span>
            <ArrowUpRight className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-base sm:text-xl font-black text-amber-900">
            {stats.bestDay ? formatTaka(stats.bestDay.amount) : '৳০'}
          </div>
          <div className="text-[11px] text-gray-600 truncate mt-1">
            {stats.bestDay?.date ? stats.bestDay.date : 'কোনো তথ্য নেই'}
          </div>
        </div>

        {/* Card 4: Worst Day */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold text-gray-700">কম বিক্রির দিন</span>
            <ArrowDownRight className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-base sm:text-xl font-black text-gray-800">
            {stats.worstDay ? formatTaka(stats.worstDay.amount) : '৳০'}
          </div>
          <div className="text-[11px] text-gray-600 truncate mt-1">
            {stats.worstDay?.date ? stats.worstDay.date : 'কোনো তথ্য নেই'}
          </div>
        </div>

        {/* Card 5: Total Expenses */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-red-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold text-red-800">মোট খরচ</span>
            <Receipt className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-red-700">
            {formatTaka(stats.totalExpenses)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Total Expenses
          </div>
        </div>

        {/* Card 6: Recorded Days */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-purple-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold text-purple-800">খাতার দিন সংখ্যা</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-purple-900">
            {stats.daysCount} দিন
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            {stats.daysCount >= 30 ? '✓ ৩০+ দিনের রেকর্ড' : `${30 - stats.daysCount} দিন বাকি`}
          </div>
        </div>
      </div>

      {/* Main Section: Daily Sales Bar Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                দৈনিক বিক্রির বার চার্ট (Daily Sales Bar Chart)
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              প্রতিদিনের বিক্রির পরিমাণ ও ধারাবাহিকতা (স্থির বিক্রিতে ব্যাংকের আস্থা বাড়ে)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-emerald-600 rounded-sm"></span>
              <span className="text-gray-700">দৈনিক বিক্রি</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-blue-500"></span>
              <span className="text-blue-700">দৈনিক গড় ({formatTaka(stats.averageDailyIncome)})</span>
            </div>
          </div>
        </div>

        {/* Responsive Bar Chart Canvas */}
        <div className="relative">
          {/* Average Line */}
          {maxDailySale > 0 && stats.averageDailyIncome > 0 && (
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-blue-400 z-10 pointer-events-none"
              style={{
                bottom: `${Math.min(95, Math.max(5, (stats.averageDailyIncome / maxDailySale) * 190))}px`,
              }}
            >
              <span className="absolute -top-4 right-2 text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                গড় {formatTaka(stats.averageDailyIncome)}
              </span>
            </div>
          )}

          {/* Bars Container */}
          <div className="flex items-end gap-1.5 sm:gap-2 h-52 pt-8 pb-2 border-b border-gray-200 overflow-x-auto scrollbar-thin">
            {chartDays.map((item, index) => {
              const heightPercent = Math.min(100, Math.max(12, Math.round((item.sales / maxDailySale) * 100)));
              const isBest = stats.bestDay?.date === item.date;
              const isHovered = hoveredBar === index;
              const dayShort = item.date.slice(-2); // DD

              return (
                <div
                  key={item.date}
                  className="flex-1 min-w-[22px] sm:min-w-[28px] max-w-[40px] h-full flex flex-col justify-end items-center group relative cursor-pointer"
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-12 z-30 bg-gray-900 text-white text-xs py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
                      <div className="font-bold text-amber-300">{formatTaka(item.sales)}</div>
                      <div className="text-[10px] text-gray-300">{item.date}</div>
                    </div>
                  )}

                  {/* Best day star */}
                  {isBest && (
                    <span className="text-xs text-amber-500 font-bold -top-4 absolute animate-bounce">
                      ★
                    </span>
                  )}

                  {/* Bar */}
                  <div
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      isBest
                        ? 'bg-amber-500 group-hover:bg-amber-600'
                        : isHovered
                        ? 'bg-emerald-500'
                        : 'bg-emerald-700 group-hover:bg-emerald-600'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  ></div>

                  {/* Date label underneath */}
                  <span className="text-[10px] text-gray-500 mt-1 font-medium group-hover:text-emerald-700 group-hover:font-bold">
                    {englishToBanglaDigits(dayShort)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[11px] text-gray-500 mt-2 px-1">
            <span>শুরু: {stats.dateRange?.start || ''}</span>
            <span className="font-semibold text-gray-700">
              মোট {chartDays.length} দিনের দৈনিক বিক্রির গ্রাফ
            </span>
            <span>শেষ: {stats.dateRange?.end || ''}</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Baki Customers (Sorted by Biggest Amount & Oldest Debt) & Monthly Total */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Baki Reminder & Debtors List */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                  বাকি খদ্দেরের তালিকা ও তাগাদা (Baki Reminders)
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                বড় অঙ্ক এবং সবচেয়ে পুরনো বাকির ভিত্তিতে ক্রমানুসারে সাজানো
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {onExportCsv && (
                <button
                  onClick={onExportCsv}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold border border-gray-300 transition"
                  title="লেজারের সব হিসাব এক্সেলে ডাউনলোড করুন"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Export to Excel/CSV</span>
                </button>
              )}
              <span className="text-xs font-bold px-2.5 py-1.5 bg-amber-100 text-amber-900 rounded-lg whitespace-nowrap">
                মোট বাকি: {formatTaka(stats.totalOutstandingBaki)}
              </span>
            </div>
          </div>

          {(() => {
            const debtors = (stats.allBakiCustomers && stats.allBakiCustomers.length > 0)
              ? stats.allBakiCustomers
              : stats.topBakiCustomers;

            if (debtors.length === 0) {
              return (
                <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium">কোনো বকেয়া বাকি নেই</p>
                  <p className="text-xs text-gray-500 mt-1">সব বাকি আদায় হয়েছে অথবা কোনো বাকির খাতা নেই।</p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {debtors.map((cust, idx) => (
                  <div
                    key={cust.customerName}
                    className="p-3.5 bg-gray-50 hover:bg-emerald-50/50 rounded-xl border border-gray-200/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{cust.customerName}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                          <span>মোট দেওয়া: {formatTaka(cust.given)}</span>
                          <span>•</span>
                          <span className="text-emerald-700">আদায়: {formatTaka(cust.received)}</span>
                          {cust.oldestDate && (
                            <>
                              <span>•</span>
                              <span className="text-amber-800 font-semibold bg-amber-100/80 px-1.5 py-0.2 rounded">
                                পুরনো বাকি: {cust.oldestDate}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                      <div className="text-left sm:text-right">
                        <div className="font-black text-amber-900 text-base">
                          {formatTaka(cust.outstanding)}
                        </div>
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          বকেয়া পাওনা
                        </span>
                      </div>

                      {/* Remind Button */}
                      <button
                        onClick={() => setSelectedReminderCustomer(cust)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0"
                        title={`${cust.customerName}-কে বাকি তাগাদা পাঠান (WhatsApp/SMS)`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                        <span>তাগাদা (Remind)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Baki Reminder Modal */}
        <BakiReminderModal
          isOpen={Boolean(selectedReminderCustomer)}
          onClose={() => setSelectedReminderCustomer(null)}
          customer={selectedReminderCustomer}
          profile={profile}
        />

        {/* Monthly Total Card & Financial Health Summary */}
        <div className="lg:col-span-5 space-y-4">
          {/* Monthly Total Card */}
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
                মাসিক মোট কার্ড (Monthly Total)
              </span>
              <Calendar className="w-4 h-4 text-emerald-300" />
            </div>

            {stats.monthlyTotalSales.length > 0 ? (
              <div className="space-y-3">
                {stats.monthlyTotalSales.map((m) => (
                  <div
                    key={m.month}
                    className="flex items-center justify-between p-3 bg-emerald-900/60 rounded-xl border border-emerald-700/60"
                  >
                    <span className="font-bold text-sm text-emerald-100">{m.month}</span>
                    <span className="text-lg font-black text-amber-300">{formatTaka(m.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xl font-bold text-amber-300">{formatTaka(stats.totalSales)}</div>
            )}

            <div className="mt-4 pt-3 border-t border-emerald-700/70 text-xs text-emerald-200 flex items-center justify-between">
              <span>নগদ প্রবাহ (Net Cashflow)</span>
              <span className="font-bold text-white">
                {formatTaka(stats.totalSales - stats.totalExpenses)}
              </span>
            </div>
          </div>

          {/* Quick Bank Summary Callout */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-gray-900 text-sm">ব্যাংক ঋণের জন্য কেন গুরুত্বপূর্ণ?</h4>
                <p className="text-xs text-gray-600 mt-1">
                  ব্যাংক কর্মকর্তা দেখতে চান দোকানে নগদ ক্যাশফ্লো কতটা নিয়মিত। দৈনিক গড় বিক্রি এবং বাকি আদায় ঠিকমতো হলে সহজ শর্তে ক্ষুদ্র ঋণ পাওয়া যায়।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
