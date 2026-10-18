import React from 'react';
import {
  Printer,
  Download,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  User,
  MapPin,
  Phone,
  Shield,
  Edit,
} from 'lucide-react';
import { ShopProfile, KhataStats } from '../types/khata';
import { formatTaka } from '../utils/digitConverter';

interface IncomeProofReportProps {
  profile: ShopProfile;
  stats: KhataStats;
  loanScore: number;
  onEditProfile: () => void;
}

export const IncomeProofReport: React.FC<IncomeProofReportProps> = ({
  profile,
  stats,
  loanScore,
  onEditProfile,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 no-print">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-emerald-950 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            <span>ব্যাংক লোনের জন্য আয়ের প্রমাণপত্র (Income Proof Report)</span>
          </h2>
          <p className="text-xs text-emerald-800 mt-0.5">
            এই রিপোর্টটি প্রিন্ট করে অথবা PDF আকারে সংরক্ষণ করে ব্যাংক বা এনজিওতে ঋণের আবেদনের সাথে জমা দিন।
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onEditProfile}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-emerald-800 border border-emerald-300 rounded-xl text-xs sm:text-sm font-semibold hover:bg-emerald-50 transition"
          >
            <Edit className="w-4 h-4" />
            <span>দোকানের তথ্য পরিবর্তন</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition active:scale-95"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>প্রিন্ট বা PDF হিসেবে সংরক্ষণ</span>
          </button>
        </div>
      </div>

      {/* The Printable Document Container (A4 Printable Layout) */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl border-2 border-gray-300 shadow-md text-gray-900 page-break-avoid print:border-none print:shadow-none print:p-0">
        {/* Document Header with Seal */}
        <div className="border-b-2 border-gray-800 pb-5 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-block px-2.5 py-0.5 bg-emerald-800 text-white text-[11px] font-bold rounded uppercase tracking-wider mb-2">
                ক্ষুদ্র ব্যবসা আয়ের বিবরণী • MSME Cashflow Proof
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                {profile.shopName}
              </h1>
              <p className="text-sm font-semibold text-gray-600 mt-0.5">
                {profile.businessType}
              </p>
            </div>

            {/* Official Report Badge & Score */}
            <div className="text-right shrink-0">
              <div className="inline-block p-2 rounded-xl border-2 border-emerald-800 bg-emerald-50 text-center min-w-[110px]">
                <div className="text-[10px] uppercase font-bold text-emerald-900">লোন স্কোর</div>
                <div className="text-2xl font-black text-emerald-800">{loanScore}/১০০</div>
                <div className="text-[10px] text-emerald-700 font-semibold">
                  {loanScore >= 80 ? 'চমৎকার' : loanScore >= 65 ? 'ভালো' : 'সন্তোষজনক'}
                </div>
              </div>
            </div>
          </div>

          {/* Shopkeeper and Store Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-gray-200 text-xs text-gray-700">
            <div>
              <span className="text-gray-400 block text-[10px]">মালিকের নাম / প্রোপ্রাইটর:</span>
              <span className="font-bold text-gray-900">{profile.ownerName}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">মোবাইল নম্বর:</span>
              <span className="font-bold text-gray-900">{profile.phone}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">হিসাবের সময়কাল:</span>
              <span className="font-bold text-gray-900">
                {stats.dateRange ? `${stats.dateRange.start} থেকে ${stats.dateRange.end}` : 'সর্বশেষ মাস'}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">মোট রেকর্ডকৃত দিন:</span>
              <span className="font-bold text-gray-900">{stats.daysCount} দিন</span>
            </div>
          </div>
        </div>

        {/* Financial Highlights Table (Required fields: total sales, avg daily income, expenses, days recorded) */}
        <div className="mb-6">
          <h3 className="text-xs uppercase font-bold tracking-wider text-gray-500 mb-2">
            আর্থিক সারসংক্ষেপ (Financial Summary)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-xs text-gray-500 block">মোট বিক্রি (Total Sales)</span>
              <span className="text-lg sm:text-xl font-black text-gray-950">
                {formatTaka(stats.totalSales)}
              </span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-xs text-emerald-800 block">দৈনিক গড় আয় (Avg Daily)</span>
              <span className="text-lg sm:text-xl font-black text-emerald-900">
                {formatTaka(stats.averageDailyIncome)}
              </span>
            </div>

            <div className="p-3 bg-red-50 rounded-xl border border-red-200">
              <span className="text-xs text-red-800 block">মোট খরচ (Expenses)</span>
              <span className="text-lg sm:text-xl font-black text-red-800">
                {formatTaka(stats.totalExpenses)}
              </span>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-xs text-amber-800 block">বাকি পাওনা (Net Baki)</span>
              <span className="text-lg sm:text-xl font-black text-amber-900">
                {formatTaka(stats.totalOutstandingBaki)}
              </span>
            </div>
          </div>
        </div>

        {/* Weekly & Daily Summary Section */}
        <div className="mb-6">
          <h3 className="text-xs uppercase font-bold tracking-wider text-gray-500 mb-2">
            দৈনিক বিক্রির বিবরণী (খাতার নমুনা সারাংশ)
          </h3>
          <div className="border border-gray-300 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-300">
                  <th className="py-2 px-3">তারিখ (Date)</th>
                  <th className="py-2 px-3 text-right">নগদ বিক্রি (Sales)</th>
                  <th className="py-2 px-3 text-right">বাকি দেওয়া (Baki Out)</th>
                  <th className="py-2 px-3 text-right">বাকি আদায় (Baki In)</th>
                  <th className="py-2 px-3 text-right">খরচ (Expense)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.dailySummaries.slice(0, 8).map((day) => (
                  <tr key={day.date} className="hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-gray-900">{day.date}</td>
                    <td className="py-2 px-3 text-right font-bold text-gray-900">{formatTaka(day.sales)}</td>
                    <td className="py-2 px-3 text-right text-gray-600">{formatTaka(day.bakiGiven)}</td>
                    <td className="py-2 px-3 text-right text-emerald-700">{formatTaka(day.bakiReceived)}</td>
                    <td className="py-2 px-3 text-right text-red-700">{formatTaka(day.expenses)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {stats.dailySummaries.length > 8 && (
            <p className="text-[10px] text-gray-500 mt-1 italic">
              * রিপোর্টে স্থান সঙ্কুলানের জন্য প্রথম ৮ দিনের বিস্তারিত দেখানো হয়েছে (লেজারে পূর্ণ {stats.daysCount} দিনের হিসাব সংরক্ষিত রয়েছে)।
            </p>
          )}
        </div>

        {/* MANDATORY DISCLAIMER NOTE AS INSTRUCTED */}
        <div className="my-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-center">
          <p className="text-xs sm:text-sm font-bold text-amber-950">
            "Self-reported from notebook photos. Not verified by a bank."
          </p>
          <p className="text-xs text-amber-900 mt-0.5">
            (খাতার ছবি থেকে সংগৃহীত স্ব-ঘোষিত হিসাব। কোনো ব্যাংক কর্তৃক সত্যায়িত নয়।)
          </p>
        </div>

        {/* Verification & Signatures Block for Bank Presentation */}
        <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-gray-300">
          <div>
            <div className="h-16 border-b border-dashed border-gray-400 mb-2"></div>
            <p className="text-xs font-bold text-gray-900 text-center">
              দোকানদারের স্বাক্ষর ও তারিখ
            </p>
            <p className="text-[10px] text-gray-500 text-center">
              (স্ব-ঘোষিত আয় সত্য বলে প্রত্যায়ন করিলাম)
            </p>
          </div>

          <div>
            <div className="h-16 border-b border-dashed border-gray-400 mb-2"></div>
            <p className="text-xs font-bold text-gray-900 text-center">
              ব্যাংক কর্মকর্তা / ঋণ যাচাইকারী কর্মকর্তার সিল ও তারিখ
            </p>
            <p className="text-[10px] text-gray-500 text-center">
              (মাঠ পর্যায়ের পরিদর্শন ও প্রাথমিক পর্যালোচনা)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
