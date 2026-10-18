import React from 'react';
import { BookOpen, Store, AlertCircle, Trash2, Database, FileDown } from 'lucide-react';
import { ShopProfile } from '../types/khata';

interface HeaderProps {
  profile: ShopProfile;
  onOpenProfile: () => void;
  onClearAllData: () => void;
  onRemoveSampleData?: () => void;
  onExportCsv: () => void;
  totalSavedRows: number;
  totalDays: number;
  sampleRowsCount: number;
  isSavedOnDevice?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenProfile,
  onClearAllData,
  onRemoveSampleData,
  onExportCsv,
  totalSavedRows,
  totalDays,
  sampleRowsCount,
  isSavedOnDevice = true,
}) => {
  return (
    <header className="bg-emerald-800 text-white shadow-md border-b-4 border-emerald-950 no-print">
      {/* Top Tagline & Main Header */}
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="bg-emerald-700/80 p-2.5 rounded-xl border border-emerald-600/50 shadow-inner flex items-center justify-center shrink-0">
              <BookOpen className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Hishab - হিসাব
                <span className="text-emerald-300 text-sm sm:text-base font-normal">
                  (Apnar khata, apnar proof)
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                দোকানের খাতার ছবি তুলুন — ডিজিটাল আয়ের প্রমাণপত্র ও ব্যাংক লোন স্কোর তৈরি করুন
              </p>
            </div>
          </div>

          {/* Shop Profile Badge, Export CSV, Sample Cleaner & Clear All Data Button */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/80 hover:bg-emerald-900 border border-emerald-600 rounded-lg text-xs sm:text-sm font-semibold transition"
              title="দোকানের তথ্য পরিবর্তন করুন (Edit shop details)"
            >
              <Store className="w-4 h-4 text-amber-300" />
              <span className="truncate max-w-[140px] sm:max-w-[180px]">{profile.shopName}</span>
            </button>

            {/* Export to Excel/CSV Button */}
            <button
              onClick={onExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 rounded-lg text-xs sm:text-sm font-bold transition shadow-xs"
              title="সব হিসাব এক্সেলে ডাউনলোড করুন (Export to Excel/CSV)"
            >
              <FileDown className="w-4 h-4 text-amber-300" />
              <span>Export to Excel/CSV</span>
            </button>

            {sampleRowsCount > 0 && onRemoveSampleData && (
              <button
                onClick={onRemoveSampleData}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-600/80 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition border border-amber-500"
                title="শুধুমাত্র নমুনা ডাটা মুছে ফেলুন (Remove sample data only)"
              >
                <span>নমুনা মুছুন ({sampleRowsCount})</span>
              </button>
            )}

            <button
              onClick={onClearAllData}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-950/70 hover:bg-red-900 text-red-200 hover:text-white border border-red-700/80 rounded-lg text-xs font-medium transition"
              title="সব ডাটা মুছুন (Clear all data)"
              aria-label="সব ডাটা মুছুন (Clear all data)"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-300" />
              <span>সব মুছুন (Clear All)</span>
            </button>
          </div>
        </div>

        {/* Status Bar & Mandatory Disclaimer */}
        <div className="mt-2.5 pt-2 border-t border-emerald-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 sm:gap-3 text-emerald-100 flex-wrap">
            <span className="bg-emerald-700 px-2.5 py-0.5 rounded text-[11px] font-bold text-amber-300 flex items-center gap-1">
              <Database className="w-3 h-3 text-amber-300" />
              মোট সংরক্ষিত এন্ট্রি: {totalSavedRows} টি
            </span>
            {isSavedOnDevice && (
              <span className="text-emerald-300 font-semibold text-[11px] flex items-center gap-1 bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-600/50">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Saved on this device</span>
              </span>
            )}
            <span className="bg-emerald-700 px-2.5 py-0.5 rounded text-[11px] font-bold text-emerald-200">
              রেকর্ড করা দিন: {totalDays} দিন
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-200 bg-emerald-950/60 px-2.5 py-1 rounded-md text-[11px]">
            <AlertCircle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>স্ব-ঘোষিত হিসাব সহকারী • Not financial advice • ব্যাংক ঋণ সিদ্ধান্তের জন্য সহায়ক</span>
          </div>
        </div>
      </div>
    </header>
  );
};
