import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ZoomIn,
  Image as ImageIcon,
  Save,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { KhataRow, TransactionType } from '../types/khata';
import { parseAmount } from '../utils/digitConverter';

interface KhataEditorProps {
  currentPhoto: string | null;
  onPhotoChange: (photo: string | null) => void;
  editableRows: KhataRow[];
  onUpdateEditableRows: (rows: KhataRow[] | ((prev: KhataRow[]) => KhataRow[])) => void;
  onSaveToLedger: () => void;
  onLoadSample: () => void;
  savedLedgerCount: number;
  saveSuccessMessage: string | null;
}

export const KhataEditor: React.FC<KhataEditorProps> = ({
  currentPhoto,
  onPhotoChange,
  editableRows,
  onUpdateEditableRows,
  onSaveToLedger,
  onLoadSample,
  savedLedgerCount,
  saveSuccessMessage,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle file or camera photo selection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      onPhotoChange(dataUrl);
      await sendPhotoToGemma(dataUrl, file.type || 'image/jpeg');
    };
    reader.onerror = () => {
      setErrorMessage('Photo is not clear. Retake in good light, one page at a time.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Send photo to backend extraction
  const sendPhotoToGemma = async (base64Image: string, mimeType: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/extract-khata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !Array.isArray(data.rows) || data.rows.length === 0) {
        setErrorMessage(data.error || 'Photo is not clear. Retake in good light, one page at a time.');
        return;
      }

      onUpdateEditableRows(data.rows);
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage('Photo is not clear. Retake in good light, one page at a time.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add new empty row to editable table
  const handleAddRow = () => {
    const today = new Date().toISOString().split('T')[0];
    const newRow: KhataRow = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: today,
      description: '',
      type: 'sale',
      amount: '',
      unclearFields: [],
    };
    onUpdateEditableRows((prev) => [...prev, newRow]);
  };

  // Update specific row cell in editable table
  const handleUpdateRow = (id: string, field: keyof KhataRow, value: unknown) => {
    onUpdateEditableRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const updated = { ...row, [field]: value };

        // If field was unclear, remove it from unclearFields list
        if (
          updated.unclearFields &&
          updated.unclearFields.includes(field as 'date' | 'description' | 'type' | 'amount')
        ) {
          updated.unclearFields = updated.unclearFields.filter((f) => f !== field);
        }

        return updated;
      })
    );
  };

  // Delete row from editable table
  const handleDeleteRow = (id: string) => {
    onUpdateEditableRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Check if a cell is unclear/null to highlight in yellow
  const isCellUnclear = (row: KhataRow, field: 'date' | 'description' | 'type' | 'amount') => {
    if (row.unclearFields && row.unclearFields.includes(field)) return true;
    if (field === 'date') return !row.date || row.date === 'null';
    if (field === 'description')
      return !row.description || row.description === 'null' || row.description.trim() === '';
    if (field === 'type') return !row.type;
    if (field === 'amount') {
      const parsed = parseAmount(row.amount);
      return parsed === null || isNaN(parsed) || row.amount === null || row.amount === 'null';
    }
    return false;
  };

  const unclearCount = editableRows.filter(
    (r) =>
      isCellUnclear(r, 'date') ||
      isCellUnclear(r, 'description') ||
      isCellUnclear(r, 'type') ||
      isCellUnclear(r, 'amount')
  ).length;

  return (
    <div className="space-y-6">
      {/* Step 1 & 2: Upload Action Hero with Large Buttons */}
      <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50/50 p-4 sm:p-6 rounded-2xl border border-emerald-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>ধাপ ১: খাতার ছবি তুলুন (Step 1: Khata Photo)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              খাতার পাতার স্পষ্ট ছবি তুলুন অথবা আপলোড করুন
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              কৃত্রিম বুদ্ধিমত্তা (Gemma) ছবি দেখে তারিখ, বিবরণ, ধরণ ও টাকার অঙ্ক স্বয়ংক্রিয়ভাবে শনাক্ত করবে।
            </p>
          </div>

          {/* Large Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Hidden inputs */}
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {/* Direct Camera Button */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              <Camera className="w-5 h-5 text-amber-300" />
              <span>ক্যামেরা দিয়ে তুলুন</span>
            </button>

            {/* Gallery Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 text-emerald-900 border-2 border-emerald-600 rounded-xl font-bold text-sm shadow-xs transition active:scale-95 disabled:opacity-50"
            >
              <Upload className="w-5 h-5 text-emerald-700" />
              <span>গ্যালারি থেকে আপলোড</span>
            </button>

            {/* Try Sample Notebook Button */}
            <button
              onClick={onLoadSample}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 rounded-xl font-bold text-sm shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              <BookOpen className="w-5 h-5 text-gray-950" />
              <span>নমুনা খাতা দেখুন (Try Sample)</span>
            </button>
          </div>
        </div>

        {/* Loading Banner */}
        {isLoading && (
          <div className="mt-4 p-4 bg-emerald-100 border border-emerald-300 rounded-xl flex items-center gap-3 animate-pulse">
            <div className="w-5 h-5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin shrink-0"></div>
            <div>
              <p className="font-bold text-emerald-900 text-sm">
                খাতার হাতের লেখা পড়া হচ্ছে... অনুগ্রহ করে একটু অপেক্ষা করুন।
              </p>
              <p className="text-xs text-emerald-700">
                Gemma AI খাতার পাতার তারিখ ও বাংলা/ইংরেজি অঙ্কগুলো অক্ষতভাবে বের করছে।
              </p>
            </div>
          </div>
        )}

        {/* Error Banner with Required Specific Wording */}
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-red-900">{errorMessage}</p>
              <p className="text-xs text-red-700 mt-1">
                ছবি তোলার সময় খেয়াল রাখুন: পর্যাপ্ত আলোতে খাতার পাতাটি সোজা রাখুন এবং পাতার চার কোনা যেন স্পষ্ট দেখা যায়।
              </p>
            </div>
          </div>
        )}

        {/* Green Saved Message Banner as specified */}
        {saveSuccessMessage && (
          <div className="mt-4 p-4 bg-emerald-50 border-2 border-emerald-500 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="font-bold text-emerald-900 text-sm sm:text-base">{saveSuccessMessage}</p>
          </div>
        )}
      </div>

      {/* Step 3: Side-by-Side Verification (Photo next to Editable Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Khata Photo Preview */}
        <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                খাতার ছবি (Original Photo)
              </h3>
            </div>
            {currentPhoto && (
              <button
                onClick={() => setIsPhotoZoomed(!isPhotoZoomed)}
                className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-semibold px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-200 transition"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>{isPhotoZoomed ? 'ছোট করুন' : 'বড় করে দেখুন'}</span>
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 mb-3">
            ডানদিকের টেবিলের সাথে মিলিয়ে নিন। কোনো লেখা অস্পষ্ট থাকলে ছবিতে দেখে ঠিক করুন।
          </p>

          <div
            className={`relative rounded-xl overflow-hidden border border-gray-300 bg-amber-50/30 flex items-center justify-center transition-all ${
              isPhotoZoomed ? 'max-h-[700px]' : 'max-h-[480px]'
            }`}
          >
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt="Khata Notebook Page"
                className="w-full h-auto object-contain max-h-[600px] hover:scale-105 transition duration-200"
              />
            ) : (
              <div className="p-12 text-center text-gray-400">
                <Camera className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium">কোনো ছবি নির্বাচিত হয়নি</p>
                <p className="text-xs">উপরে ক্যামেরা বা গ্যালারি থেকে খাতার ছবি আপলোড করুন</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Editable Table */}
        <div className="lg:col-span-7 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                  সম্পাদনাযোগ্য খাতার হিসাব (Editable Table)
                </h3>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                  {editableRows.length} টি সারি
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                হলুদ চিহ্নিত ঘরগুলোতে তথ্য অস্পষ্ট রয়েছে, সেগুলো সঠিক তথ্য দিয়ে পূরণ করুন।
              </p>
            </div>

            {/* Quick Unclear Warning Badge */}
            {unclearCount > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 border border-yellow-300 text-yellow-900 rounded-lg text-xs font-bold shrink-0">
                <HelpCircle className="w-4 h-4 text-yellow-700" />
                <span>{unclearCount}টি ঘরে যাচাই দরকার (Yellow)</span>
              </div>
            )}
          </div>

          {/* Table Container with Horizontal Scroll */}
          <div className="overflow-x-auto border border-gray-200 rounded-xl mb-4">
            <table className="w-full text-left text-sm border-collapse min-w-[580px]">
              <thead>
                <tr className="bg-emerald-800 text-white text-xs font-semibold">
                  <th className="py-2.5 px-3 w-28">তারিখ (Date)</th>
                  <th className="py-2.5 px-3">বিবরণ / খদ্দেরের নাম (Description)</th>
                  <th className="py-2.5 px-3 w-36">ধরণ (Type)</th>
                  <th className="py-2.5 px-3 w-28 text-right">টাকা (৳)</th>
                  <th className="py-2.5 px-2 w-12 text-center">মুছুন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {editableRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-500 text-sm">
                      <p className="font-bold text-gray-700 mb-1">
                        সম্পাদনার জন্য বর্তমানে কোনো নতুন সারি নেই
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        উপরে খাতার ছবি তুলুন অথবা নিচের বাটনে ক্লিক করে সারি যোগ করুন।
                      </p>
                      <button
                        onClick={handleAddRow}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-300 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>সারি যোগ করুন</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  editableRows.map((row, idx) => {
                    const dateUnclear = isCellUnclear(row, 'date');
                    const descUnclear = isCellUnclear(row, 'description');
                    const typeUnclear = isCellUnclear(row, 'type');
                    const amountUnclear = isCellUnclear(row, 'amount');

                    return (
                      <tr
                        key={row.id}
                        className={`hover:bg-gray-50 transition ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                        }`}
                      >
                        {/* Date Cell */}
                        <td
                          className={`p-1.5 ${
                            dateUnclear ? 'bg-yellow-100 border-2 border-yellow-400' : ''
                          }`}
                        >
                          <input
                            type="text"
                            value={row.date || ''}
                            placeholder="YYYY-MM-DD"
                            onChange={(e) => handleUpdateRow(row.id, 'date', e.target.value)}
                            className="w-full px-2 py-1 bg-transparent text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
                            title={dateUnclear ? 'তারিখটি অস্পষ্ট ছিল, দয়া করে লিখুন' : 'তারিখ'}
                          />
                        </td>

                        {/* Description Cell */}
                        <td
                          className={`p-1.5 ${
                            descUnclear ? 'bg-yellow-100 border-2 border-yellow-400' : ''
                          }`}
                        >
                          <input
                            type="text"
                            value={row.description || ''}
                            placeholder="পণ্য বা খদ্দেরের নাম লিখুন"
                            onChange={(e) => handleUpdateRow(row.id, 'description', e.target.value)}
                            className="w-full px-2 py-1 bg-transparent text-xs font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
                            title={descUnclear ? 'বিবরণটি অস্পষ্ট ছিল, দয়া করে লিখুন' : 'বিবরণ'}
                          />
                        </td>

                        {/* Transaction Type Cell */}
                        <td
                          className={`p-1.5 ${
                            typeUnclear ? 'bg-yellow-100 border-2 border-yellow-400' : ''
                          }`}
                        >
                          <select
                            value={row.type || ''}
                            onChange={(e) =>
                              handleUpdateRow(row.id, 'type', (e.target.value as TransactionType) || null)
                            }
                            className="w-full px-2 py-1 bg-white text-xs font-semibold text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            title={typeUnclear ? 'ধরণ নির্বাচন করুন' : 'লেনদেনের ধরণ'}
                          >
                            <option value="">নির্বাচন করুন</option>
                            <option value="sale">নগদ বিক্রি (Sale)</option>
                            <option value="baki_given">বাকি দেওয়া (Baki Given)</option>
                            <option value="baki_received">বাকি আদায় (Baki Received)</option>
                            <option value="expense">দোকানের খরচ (Expense)</option>
                          </select>
                        </td>

                        {/* Amount Cell */}
                        <td
                          className={`p-1.5 text-right ${
                            amountUnclear ? 'bg-yellow-100 border-2 border-yellow-400' : ''
                          }`}
                        >
                          <input
                            type="text"
                            value={row.amount !== null && row.amount !== undefined ? row.amount : ''}
                            placeholder="০.০০"
                            onChange={(e) => handleUpdateRow(row.id, 'amount', e.target.value)}
                            className="w-full px-2 py-1 bg-transparent text-xs font-bold text-gray-950 text-right focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
                            title={amountUnclear ? 'টাকার অঙ্কটি অস্পষ্ট ছিল, দয়া করে লিখুন' : 'টাকার অঙ্ক'}
                          />
                        </td>

                        {/* Delete Row Button */}
                        <td className="p-1.5 text-center">
                          <button
                            onClick={() => handleDeleteRow(row.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition rounded"
                            title="সারি মুছুন (Delete Row)"
                            aria-label={`সারি মুছুন ${row.description || idx + 1}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Action Row: Add Row & Save to Ledger */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={handleAddRow}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm rounded-xl border border-gray-300 transition"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>নতুন সারি যোগ করুন (Add Row)</span>
            </button>

            <button
              onClick={onSaveToLedger}
              disabled={editableRows.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5 text-amber-300" />
              <span>লেজারে জমা রাখুন (Save to ledger)</span>
            </button>
          </div>

          {/* Info note about combining multiple pages */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between gap-2">
            <div>
              <span className="font-bold">খাতার একাধিক পাতা: </span>
              প্রতিটি পাতা আলাদাভাবে ছবি তুলে যাচাই শেষে "লেজারে জমা রাখুন" চাপুন। সবগুলো পাতা একত্র হয়ে মূল লেজারে সংরক্ষিত হবে।
            </div>
            <span className="shrink-0 bg-blue-200/80 px-2 py-0.5 rounded font-bold text-[11px]">
              লেজারে সংরক্ষিত: {savedLedgerCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
