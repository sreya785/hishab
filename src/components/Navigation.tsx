import React from 'react';
import { Camera, BarChart3, Award, FileText } from 'lucide-react';

export type ActiveTab = 'scanner' | 'dashboard' | 'loan-score' | 'income-proof';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  unclearCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  unclearCount,
}) => {
  const tabs = [
    {
      id: 'scanner' as ActiveTab,
      labelBn: 'খাতা ও ছবি',
      labelEn: 'Khata & Photo',
      icon: Camera,
      badge: unclearCount > 0 ? `${unclearCount} যাচাই বাকি` : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'dashboard' as ActiveTab,
      labelBn: 'ড্যাশবোর্ড',
      labelEn: 'Dashboard',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'loan-score' as ActiveTab,
      labelBn: 'লোন স্কোর',
      labelEn: 'Loan Readiness',
      icon: Award,
      badge: null,
    },
    {
      id: 'income-proof' as ActiveTab,
      labelBn: 'আয়ের প্রমাণপত্র',
      labelEn: 'Income Proof',
      icon: FileText,
      badge: 'ব্যাংকের জন্য',
      badgeColor: 'bg-emerald-600 text-white',
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition whitespace-nowrap shrink-0 relative ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-amber-300' : 'text-gray-500'}`} />
                <div className="text-left leading-tight">
                  <div className="font-bold">{tab.labelBn}</div>
                  <div className={`text-[10px] ${isActive ? 'text-emerald-200' : 'text-gray-400'}`}>
                    {tab.labelEn}
                  </div>
                </div>

                {tab.badge && (
                  <span
                    className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      tab.badgeColor || 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
