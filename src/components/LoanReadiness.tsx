import React, { useState } from 'react';
import {
  Award,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Calendar,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Edit2,
  Info,
} from 'lucide-react';
import { KhataStats, LoanReadinessBreakdown } from '../types/khata';
import { calculateLoanReadinessScore } from '../utils/khataCalculations';
import { formatTaka } from '../utils/digitConverter';

interface LoanReadinessProps {
  stats: KhataStats;
  targetDailyIncome: number;
  onUpdateTarget: (target: number) => void;
}

export const LoanReadiness: React.FC<LoanReadinessProps> = ({
  stats,
  targetDailyIncome,
  onUpdateTarget,
}) => {
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(String(targetDailyIncome));

  const breakdown: LoanReadinessBreakdown = calculateLoanReadinessScore(
    stats,
    targetDailyIncome
  );

  const handleSaveTarget = () => {
    const num = Number(tempTarget);
    if (!isNaN(num) && num > 0) {
      onUpdateTarget(num);
      setIsEditingTarget(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-600', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-300' };
    if (score >= 65) return { bg: 'bg-blue-600', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800', border: 'border-blue-300' };
    if (score >= 50) return { bg: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-900', border: 'border-amber-300' };
    return { bg: 'bg-rose-600', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-900', border: 'border-rose-300' };
  };

  const colors = getScoreColor(breakdown.totalScore);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero: Score Meter & Summary Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>কোড দ্বারা নির্ভুলভাবে গণনাকৃত (0-100 Pure Code)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              ক্ষুদ্র ঋণ প্রস্তুতি স্কোর (Loan Readiness Score)
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-xl mt-1.5">
              এই স্কোরটি ব্যাংক বা আর্থিক প্রতিষ্ঠানের ক্ষুদ্র ঋণের মানদণ্ড অনুযায়ী তৈরি। খাতার ধারাবাহিকতা, বিক্রির স্থিতিশীলতা এবং আয়ের উপর ভিত্তি করে ১০০ নম্বরের মধ্যে মূল্যায়ন করা হয়।
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${colors.badge}`}>
                গ্রেড: {breakdown.grade}
              </span>
              <span className="text-xs text-gray-500">
                • {stats.daysCount} দিনের হিসাবের উপর ভিত্তি করে
              </span>
            </div>
          </div>

          {/* Big Circular Score Display */}
          <div className="relative flex flex-col items-center justify-center shrink-0">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-8 border-gray-100 flex flex-col items-center justify-center shadow-inner relative">
              {/* Circular SVG Progress */}
              <svg className="w-full h-full -rotate-90 absolute inset-0">
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  className="stroke-gray-100"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  className={breakdown.totalScore >= 80 ? 'stroke-emerald-600' : breakdown.totalScore >= 65 ? 'stroke-blue-600' : breakdown.totalScore >= 50 ? 'stroke-amber-500' : 'stroke-rose-600'}
                  strokeWidth="10"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * breakdown.totalScore) / 100}
                  strokeLinecap="round"
                  fill="none"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>

              <div className="text-center z-10">
                <span className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
                  {breakdown.totalScore}
                </span>
                <span className="text-xs sm:text-sm text-gray-500 block font-semibold">
                  / ১০০ পয়েন্ট
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Pillar Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Days Recorded (Max 40 points) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                ১. খাতার দিন সংখ্যা
              </span>
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <h4 className="font-bold text-gray-900 text-sm">হিসাবের স্থায়িত্ব</h4>
              <span className="text-xl font-black text-emerald-700">
                {breakdown.daysScore} <span className="text-xs text-gray-400">/ ৪০</span>
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden my-2">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(breakdown.daysScore / 40) * 100}%` }}
              ></div>
            </div>

            <p className="text-xs text-gray-600 mt-2">
              {breakdown.daysRecorded >= 30
                ? '✓ ৩০ বা তার বেশি দিনের হিসাব রয়েছে (পূর্ণ ৪০ পয়েন্ট অর্জিত)।'
                : `বর্তমানে ${breakdown.daysRecorded} দিনের হিসাব রয়েছে। ৩০ দিন পূর্ণ হলে ৪০-এ ৪০ পাবেন।`}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
            নিয়ম: ৩০ দিন বা তার বেশি = ৪০ পয়েন্ট
          </div>
        </div>

        {/* Pillar 2: Consistency Score (Max 30 points) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                ২. বিক্রির ধারাবাহিকতা
              </span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <h4 className="font-bold text-gray-900 text-sm">দৈনিক স্থিতিশীলতা</h4>
              <span className="text-xl font-black text-blue-700">
                {breakdown.consistencyScore} <span className="text-xs text-gray-400">/ ৩০</span>
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden my-2">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(breakdown.consistencyScore / 30) * 100}%` }}
              ></div>
            </div>

            <p className="text-xs text-gray-600 mt-2">
              প্রতিদিনের বিক্রি কতটা নিয়মিত। প্রতিদিন বিরতিহীন ও পরিমিত বিক্রি বজায় রাখলে ব্যাংকের ক্রেডিট মূল্যায়ন বাড়ে।
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
            নিয়ম: স্থির ক্যাশফ্লো ও কম তারতম্য = সর্বোচ্চ ৩০ পয়েন্ট
          </div>
        </div>

        {/* Pillar 3: Daily Income vs Target (Max 30 points) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                ৩. দৈনিক গড় আয়
              </span>
              <DollarSign className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <h4 className="font-bold text-gray-900 text-sm">লক্ষ্যমাত্রা বনাম আয়</h4>
              <span className="text-xl font-black text-amber-700">
                {breakdown.incomeScore} <span className="text-xs text-gray-400">/ ৩০</span>
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden my-2">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(breakdown.incomeScore / 30) * 100}%` }}
              ></div>
            </div>

            <div className="text-xs text-gray-600 mt-2 space-y-1">
              <div className="flex justify-between">
                <span>বর্তমান গড় আয়:</span>
                <span className="font-bold text-gray-900">{formatTaka(breakdown.averageDailyIncome)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>দৈনিক লক্ষ্যমাত্রা:</span>
                <span className="font-bold text-emerald-800">{formatTaka(targetDailyIncome)}</span>
              </div>
            </div>
          </div>

          {/* Editable Target Input */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            {isEditingTarget ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={tempTarget}
                  onChange={(e) => setTempTarget(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500"
                  placeholder="3000"
                />
                <button
                  onClick={handleSaveTarget}
                  className="px-2.5 py-1 bg-emerald-700 text-white rounded text-xs font-bold hover:bg-emerald-800"
                >
                  সংরক্ষণ
                </button>
                <button
                  onClick={() => setIsEditingTarget(false)}
                  className="px-2 py-1 text-gray-500 hover:text-gray-700 text-xs"
                >
                  বাতিল
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTempTarget(String(targetDailyIncome));
                  setIsEditingTarget(true);
                }}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>লক্ষ্যমাত্রা পরিবর্তন করুন (Edit Target)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Actionable Advice: How to Raise Your Score */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-emerald-700" />
          <h3 className="font-bold text-gray-900 text-base sm:text-lg">
            কীভাবে স্কোর বাড়াবেন? (How to Raise Your Loan Score)
          </h3>
        </div>

        <div className="space-y-3">
          {breakdown.tips.map((tip, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div className="text-xs sm:text-sm">
                <p className="font-bold text-gray-900">{tip.bn}</p>
                <p className="text-gray-500 text-xs mt-0.5">{tip.en}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
