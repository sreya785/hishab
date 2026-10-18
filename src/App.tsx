/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { KhataEditor } from './components/KhataEditor';
import { Dashboard } from './components/Dashboard';
import { LoanReadiness } from './components/LoanReadiness';
import { IncomeProofReport } from './components/IncomeProofReport';
import { ShopProfileModal } from './components/ShopProfileModal';
import { KhataRow, ShopProfile } from './types/khata';
import { calculateKhataStats, calculateLoanReadinessScore } from './utils/khataCalculations';
import { DEFAULT_SHOP_PROFILE, generate30DaySampleKhata, getSampleKhataImageSvg } from './utils/sampleKhataData';
import { parseAmount } from './utils/digitConverter';
import { downloadLedgerCsv } from './utils/bakiReminder';

const STORAGE_KEY_ROWS = 'hishab_ledger_rows_v2';
const LEGACY_STORAGE_KEY_ROWS = 'hishab_ledger_rows';
const STORAGE_KEY_PROFILE = 'hishab_shop_profile_v2';

// 1. Helper to save full ledger to localStorage every time it changes, wrapped in try/catch
function saveLedgerToStorage(rows: KhataRow[]): boolean {
  try {
    const json = JSON.stringify(rows);
    localStorage.setItem(STORAGE_KEY_ROWS, json);
    // Also sync to legacy key for backwards compatibility
    localStorage.setItem(LEGACY_STORAGE_KEY_ROWS, json);
    return true;
  } catch (err) {
    console.error('Failed to save ledger to localStorage:', err);
    return false;
  }
}

// 2. On app start, load the ledger from localStorage first.
// Load sample data ONLY if nothing is saved yet, or when user presses "Try Sample".
// Never overwrite saved rows with sample data.
function loadInitialLedger(): KhataRow[] {
  try {
    let saved = localStorage.getItem(STORAGE_KEY_ROWS);
    if (saved === null) {
      saved = localStorage.getItem(LEGACY_STORAGE_KEY_ROWS);
    }

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Saved data exists (even if empty [] after clear).
        // Never overwrite with sample data!
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load ledger from localStorage:', err);
  }

  // ONLY if nothing is saved yet in localStorage:
  const initialSample = generate30DaySampleKhata(); // all rows marked with isSample: true
  saveLedgerToStorage(initialSample);
  return initialSample;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('scanner');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isSavedOnDevice, setIsSavedOnDevice] = useState(true);

  // 1. ONE shared master ledger state at the top level of the app
  const [ledgerRows, setLedgerRows] = useState<KhataRow[]>(() => loadInitialLedger());

  // Shop Profile state
  const [profile, setProfile] = useState<ShopProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error('Failed to load profile from localStorage:', err);
    }
    return DEFAULT_SHOP_PROFILE;
  });

  // Photo state kept at top level so switching tabs NEVER clears the photo
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(() => getSampleKhataImageSvg());

  // Editable rows in scanner kept at top level so switching tabs NEVER clears un-saved edited rows
  const [editableRows, setEditableRows] = useState<KhataRow[]>(() => [
    { id: 'init-1', date: '2026-03-01', description: 'চাল ৫০ কেজি ও তেল', type: 'sale', amount: 3500, isSample: false },
    { id: 'init-2', date: '2026-03-01', description: 'রহিম বাকি', type: 'baki_given', amount: 500, isSample: false },
    { id: 'init-3', date: '2026-03-01', description: 'দোকান ঝাড়ু ও চা খরচ', type: 'expense', amount: 120, isSample: false },
    { id: 'init-4', date: '2026-03-02', description: 'তেল ও ডাল বিক্রি', type: 'sale', amount: 4200, isSample: false },
    { id: 'init-5', date: '2026-03-02', description: 'রহিম বাকি আদায়', type: 'baki_received', amount: 300, isSample: false },
    { id: 'init-6', date: '2026-03-02', description: 'করিম সওদাগর বাকি', type: 'baki_given', amount: 700, isSample: false },
    { id: 'init-7', date: null, description: 'মসলা বিক্রি (অস্পষ্ট)', type: null, amount: null, isSample: false, unclearFields: ['date', 'type', 'amount'] },
  ]);

  // Save the ledger to localStorage every time it changes, wrapped in try/catch
  useEffect(() => {
    saveLedgerToStorage(ledgerRows);
  }, [ledgerRows]);

  // Save profile to localStorage automatically, wrapped in try/catch
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch (err) {
      console.error('Failed to save profile to localStorage:', err);
    }
  }, [profile]);

  // 5. Dashboard, Loan Score and Income Proof read from the shared ledger
  const stats = useMemo(() => {
    return calculateKhataStats(ledgerRows);
  }, [ledgerRows]);

  const loanBreakdown = useMemo(() => {
    return calculateLoanReadinessScore(stats, profile.dailyIncomeTarget || 3500);
  }, [stats, profile.dailyIncomeTarget]);

  // Count unclear rows in the editable table
  const unclearCount = useMemo(() => {
    return editableRows.filter((r) => {
      const parsedAmt = parseAmount(r.amount);
      return !r.date || !r.description || !r.type || parsedAmt === null;
    }).length;
  }, [editableRows]);

  // Count sample rows currently in the shared ledger
  const sampleRowsCount = useMemo(() => {
    return ledgerRows.filter((r) => r.isSample).length;
  }, [ledgerRows]);

  // Export ledger to Excel / CSV
  const handleExportCsv = () => {
    const filename = `${profile.shopName.replace(/\s+/g, '_')}_ledger.csv`;
    downloadLedgerCsv(ledgerRows, filename);
  };

  // 3. "Save to ledger" adds the rows to the shared ledger (do not replace old rows).
  // Explicitly mark every saved extracted/manual row as real (isSample: false).
  // Immediately save full ledger to localStorage wrapped in try/catch.
  const handleSaveToLedger = () => {
    if (editableRows.length === 0) return;

    const count = editableRows.length;
    const realRows: KhataRow[] = editableRows.map((r) => ({
      ...r,
      isSample: false, // strictly mark as real, never sample!
    }));

    const updated = [...ledgerRows, ...realRows];
    setLedgerRows(updated);
    saveLedgerToStorage(updated);
    setEditableRows([]);
    setIsSavedOnDevice(true);
    setSaveSuccessMessage(`Saved. ${count} rows added.`);

    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 5000);
  };

  // "Try Sample" adds sample data into the same shared ledger and marks those rows as sample
  const handleLoadSample = () => {
    const sample = generate30DaySampleKhata().map((r) => ({
      ...r,
      isSample: true, // mark every sample row as sample
    }));
    const updated = [...ledgerRows, ...sample];
    setLedgerRows(updated);
    saveLedgerToStorage(updated);
    setCurrentPhoto(getSampleKhataImageSvg());
    setIsSavedOnDevice(true);
    setSaveSuccessMessage(`Saved. ${sample.length} rows added.`);

    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 5000);
  };

  // Remove sample data without deleting real rows
  // "নমুনা মুছুন" must remove only sample rows and never real rows.
  const handleRemoveSampleData = () => {
    if (sampleRowsCount === 0) return;
    if (
      window.confirm(
        `আপনি কি নিশ্চিত যে ${sampleRowsCount}টি নমুনা সারি মুছে ফেলতে চান? আপনার স্ক্যানকৃত আসল হিসাব অক্ষত থাকবে। (Remove ${sampleRowsCount} sample rows? Real extracted rows will be kept.)`
      )
    ) {
      const realOnly = ledgerRows.filter((r) => r.isSample !== true);
      setLedgerRows(realOnly);
      saveLedgerToStorage(realOnly);
      setIsSavedOnDevice(true);
      setSaveSuccessMessage(`নমুনা ডাটা মুছে ফেলা হয়েছে (${sampleRowsCount}টি সারি)।`);
      setTimeout(() => {
        setSaveSuccessMessage(null);
      }, 4000);
    }
  };

  // Clear all data button with confirmation
  const handleClearAllData = () => {
    if (
      window.confirm(
        'আপনি কি নিশ্চিত যে সব সংরক্ষিত হিসাব মুছে ফেলতে চান? (Are you sure you want to clear all data? This cannot be undone.)'
      )
    ) {
      setLedgerRows([]);
      setEditableRows([]);
      saveLedgerToStorage([]);
      setIsSavedOnDevice(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-gray-900 flex flex-col font-sans">
      {/* Header with tagline, total saved rows count & Saved on this device text */}
      <Header
        profile={profile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onClearAllData={handleClearAllData}
        onRemoveSampleData={sampleRowsCount > 0 ? handleRemoveSampleData : undefined}
        onExportCsv={handleExportCsv}
        totalSavedRows={ledgerRows.length}
        totalDays={stats.daysCount}
        sampleRowsCount={sampleRowsCount}
        isSavedOnDevice={isSavedOnDevice}
      />

      {/* Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unclearCount={unclearCount}
      />

      {/* Main Content Area - keeping panels mounted with CSS display so switching tabs NEVER loses state */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6">
        <div style={{ display: activeTab === 'scanner' ? 'block' : 'none' }}>
          <KhataEditor
            currentPhoto={currentPhoto}
            onPhotoChange={setCurrentPhoto}
            editableRows={editableRows}
            onUpdateEditableRows={setEditableRows}
            onSaveToLedger={handleSaveToLedger}
            onLoadSample={handleLoadSample}
            savedLedgerCount={ledgerRows.length}
            saveSuccessMessage={saveSuccessMessage}
          />
        </div>

        <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
          <Dashboard
            stats={stats}
            profile={profile}
            onNavigateToScan={() => setActiveTab('scanner')}
            onExportCsv={handleExportCsv}
          />
        </div>

        <div style={{ display: activeTab === 'loan-score' ? 'block' : 'none' }}>
          <LoanReadiness
            stats={stats}
            targetDailyIncome={profile.dailyIncomeTarget || 3500}
            onUpdateTarget={(target) =>
              setProfile((prev) => ({ ...prev, dailyIncomeTarget: target }))
            }
          />
        </div>

        <div style={{ display: activeTab === 'income-proof' ? 'block' : 'none' }}>
          <IncomeProofReport
            profile={profile}
            stats={stats}
            loanScore={loanBreakdown.totalScore}
            onEditProfile={() => setIsProfileModalOpen(true)}
          />
        </div>
      </main>

      {/* Shop Profile Modal */}
      <ShopProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSave={(updated) => setProfile(updated)}
      />

      {/* Footer with Small Legal Disclaimer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-4 text-center text-xs text-gray-500 no-print mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-gray-700">
            Hishab (হিসাব) — ক্ষুদ্র ব্যবসায়ীদের ডিজিটাল খাতা ও ঋণ প্রস্তুতি প্ল্যাটফর্ম
          </p>
          <p className="text-gray-400">
            স্ব-ঘোষিত খাতার হিসাব • নট ফাইন্যান্সিয়াল অ্যাডভাইস (Not financial advice)
          </p>
        </div>
      </footer>
    </div>
  );
}
