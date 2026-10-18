import React, { useState } from 'react';
import { X, MessageSquare, Send, Phone, Copy, Check, ExternalLink } from 'lucide-react';
import { CustomerBaki, ShopProfile } from '../types/khata';
import { formatTaka } from '../utils/digitConverter';
import {
  generateBakiReminderMessage,
  getWhatsAppReminderUrl,
  getSmsReminderUrl,
} from '../utils/bakiReminder';

interface BakiReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerBaki | null;
  profile: ShopProfile;
}

export const BakiReminderModal: React.FC<BakiReminderModalProps> = ({
  isOpen,
  onClose,
  customer,
  profile,
}) => {
  const [copied, setCopied] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  if (!isOpen || !customer) return null;

  const reminderMessage = generateBakiReminderMessage(
    customer.customerName,
    customer.outstanding,
    profile.shopName
  );

  const waUrl = getWhatsAppReminderUrl(
    customer.customerName,
    customer.outstanding,
    profile.shopName,
    phoneNumber
  );

  const smsUrl = getSmsReminderUrl(
    customer.customerName,
    customer.outstanding,
    profile.shopName,
    phoneNumber
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(reminderMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 no-print">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base sm:text-lg">
              বাকি তাগাদা পাঠান (Baki Reminder)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg transition"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Customer & Amount Summary Card */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-800 font-semibold block">খদ্দেরের নাম</span>
              <span className="text-base font-bold text-gray-900">{customer.customerName}</span>
              {customer.oldestDate && (
                <span className="text-[11px] text-amber-700 block mt-0.5">
                  সবচেয়ে পুরনো বকেয়া: {customer.oldestDate}
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs text-amber-800 font-semibold block">মোট বকেয়া পাওনা</span>
              <span className="text-xl font-black text-amber-900">
                {formatTaka(customer.outstanding)}
              </span>
            </div>
          </div>

          {/* Optional Phone Number Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              খদ্দেরের মোবাইল নম্বর (ঐচ্ছিক / Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                placeholder="017xxxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              নম্বর দিলে সরাসরি সেই নম্বরে চ্যাট বা মেসেজ খুলবে। ফাঁকা রাখলে যেকোনো কন্ট্যাক্ট সিলেক্ট করতে পারবেন।
            </p>
          </div>

          {/* Auto-filled Polite Bangla Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-700">
                স্বয়ংক্রিয় বিনীত মেসেজ (Polite Bangla Message)
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'কপি হয়েছে' : 'মেসেজ কপি'}</span>
              </button>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-300 text-xs sm:text-sm text-gray-800 leading-relaxed font-sans">
              "{reminderMessage}"
            </div>
          </div>

          {/* Send Action Buttons: WhatsApp & SMS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 text-center"
            >
              <Send className="w-4 h-4 text-emerald-100" />
              <span>WhatsApp-এ পাঠান (wa.me)</span>
            </a>

            <a
              href={smsUrl}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 text-center"
            >
              <MessageSquare className="w-4 h-4 text-blue-100" />
              <span>SMS-এ পাঠান (sms: link)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
