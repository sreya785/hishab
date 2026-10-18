import type { KhataRow, ShopProfile } from '../types/khata.ts';

export const DEFAULT_SHOP_PROFILE: ShopProfile = {
  shopName: 'মা বাবার দোয়া জেনারেল স্টোর',
  ownerName: 'মো: রফিকুল ইসলাম',
  phone: '০১৭১২-৩৪৫৬৭৮',
  marketAddress: 'দোকান নং ১২, কাওরান বাজার, ঢাকা',
  businessType: 'মুদি ও ডিপার্টমেন্টাল স্টোর (Grocery & Retail)',
  dailyIncomeTarget: 3500,
};

/**
 * Generates 30 days of realistic handwritten khata notebook sample data
 * for Bangladeshi shopkeepers.
 */
export function generate30DaySampleKhata(): KhataRow[] {
  const rows: KhataRow[] = [];
  const today = new Date(2026, 2, 30); // March 30, 2026

  // Realistic sample customers with baki transactions
  const sampleCustomers = [
    { name: 'রহিম মিয়া', phone: '০১৭১১-২২৩৩৪৪' },
    { name: 'করিম সওদাগর', phone: '০১৮১২-৩৩৪৪৫৫' },
    { name: 'আলমগীর ভাই', phone: '০১৯১১-৫৬৭৭৮৮' },
    { name: 'রফিক চাচা', phone: '০১৬৩৩-৯৯৮৮৭৭' },
    { name: 'জামান কন্ট্রাক্টর', phone: '০১৭২০-১১২২৩৩' },
    { name: 'শফিক মাস্টার', phone: '০১৮৩০-৪৪৩৩২২' },
  ];

  // Daily patterns
  for (let d = 29; d >= 0; d--) {
    const dayDate = new Date(today);
    dayDate.setDate(today.getDate() - d);
    const dateStr = dayDate.toISOString().split('T')[0];
    const dayIndex = 30 - d;

    // Daily base sales (steady range: 3,200 to 4,800 BDT)
    const baseSalesA = 1800 + ((dayIndex * 137) % 700);
    const baseSalesB = 1400 + ((dayIndex * 211) % 650);

    // Morning sales
    rows.push({
      id: `sample-${dayIndex}-s1`,
      date: dateStr,
      description: 'সকালের নগদ বিক্রি (চাল, ডাল, চিনি ও তেল)',
      type: 'sale',
      amount: baseSalesA,
      rawAmount: String(baseSalesA),
      pageId: `page-${Math.floor(dayIndex / 5) + 1}`,
      isSample: true,
    });

    // Afternoon/evening sales
    rows.push({
      id: `sample-${dayIndex}-s2`,
      date: dateStr,
      description: 'বিকালের নগদ বিক্রি (মসলা, ডিম, বিস্কুট ও চানাচুর)',
      type: 'sale',
      amount: baseSalesB,
      rawAmount: String(baseSalesB),
      pageId: `page-${Math.floor(dayIndex / 5) + 1}`,
      isSample: true,
    });

    // Periodic baki given (every 2-3 days)
    if (dayIndex % 2 === 0) {
      const cust = sampleCustomers[(dayIndex / 2) % sampleCustomers.length];
      const bakiAmt = 350 + (dayIndex * 40) % 600;
      rows.push({
        id: `sample-${dayIndex}-bg`,
        date: dateStr,
        description: `বাকি দেওয়া - ${cust.name}`,
        type: 'baki_given',
        amount: bakiAmt,
        rawAmount: String(bakiAmt),
        pageId: `page-${Math.floor(dayIndex / 5) + 1}`,
        isSample: true,
      });
    }

    // Periodic baki received / repayment (every 3-4 days)
    if (dayIndex % 3 === 0) {
      const cust = sampleCustomers[(dayIndex / 3) % sampleCustomers.length];
      const receivedAmt = 250 + (dayIndex * 35) % 450;
      rows.push({
        id: `sample-${dayIndex}-br`,
        date: dateStr,
        description: `বাকি আদায় - ${cust.name}`,
        type: 'baki_received',
        amount: receivedAmt,
        rawAmount: String(receivedAmt),
        pageId: `page-${Math.floor(dayIndex / 5) + 1}`,
        isSample: true,
      });
    }

    // Daily or periodic expenses
    if (dayIndex % 5 === 0) {
      const expAmt = 120 + (dayIndex % 3) * 30;
      rows.push({
        id: `sample-${dayIndex}-e1`,
        date: dateStr,
        description: 'দোকান ঝাড়ু, চা ও পলিথিন ব্যাগ খরচ',
        type: 'expense',
        amount: expAmt,
        rawAmount: String(expAmt),
        pageId: `page-${Math.floor(dayIndex / 5) + 1}`,
        isSample: true,
      });
    } else if (dayIndex === 1) {
      // Monthly rent
      rows.push({
        id: `sample-${dayIndex}-rent`,
        date: dateStr,
        description: 'দোকান ভাড়া (চলতি মাস)',
        type: 'expense',
        amount: 3500,
        rawAmount: '৩৫০০',
        pageId: 'page-1',
        isSample: true,
      });
    } else if (dayIndex === 15) {
      // Electricity bill
      rows.push({
        id: `sample-${dayIndex}-elec`,
        date: dateStr,
        description: 'বিদ্যুৎ বিল (ডেসকো/পল্লী বিদ্যুৎ)',
        type: 'expense',
        amount: 950,
        rawAmount: '৯৫০',
        pageId: 'page-3',
        isSample: true,
      });
    }
  }

  return rows;
}

/**
 * Creates an authentic SVG image representing a physical handwritten khata page
 * with blue/red ruled lines, Bengali ledger header, and handwriting style.
 */
export function getSampleKhataImageSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1050" width="100%" height="100%" style="background:#fcfbf7; font-family:'Hind Siliguri', 'Segoe UI', cursive, sans-serif;">
  <defs>
    <!-- Paper texture & margins -->
    <filter id="paper-shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#8c7853" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Notebook Page Background -->
  <rect x="20" y="20" width="760" height="1010" rx="8" fill="#fffdfa" stroke="#d5c8b5" stroke-width="2" filter="url(#paper-shadow)"/>
  
  <!-- Left Margin (Red Line) -->
  <line x1="160" y1="20" x2="160" y2="1030" stroke="#f87171" stroke-width="2.5" opacity="0.8"/>
  <line x1="166" y1="20" x2="166" y2="1030" stroke="#f87171" stroke-width="1" opacity="0.5"/>

  <!-- Top Margin (Red Line) -->
  <line x1="20" y1="130" x2="780" y2="130" stroke="#f87171" stroke-width="2.5" opacity="0.8"/>

  <!-- Khata Header Written in Bengali -->
  <text x="400" y="65" text-anchor="middle" font-size="24" font-weight="700" fill="#1e293b" letter-spacing="1">বিসমিল্লাহির রাহমানির রাহিম</text>
  <text x="400" y="98" text-anchor="middle" font-size="20" font-weight="600" fill="#1e3a8a">দৈনিক জমা-খরচ ও বিক্রির খাতা (মার্চ ২০২৬)</text>
  <text x="60" y="115" font-size="15" font-weight="600" fill="#475569">তারিখ</text>
  <text x="320" y="115" font-size="15" font-weight="600" fill="#475569">বিবরণ (হিসাব)</text>
  <text x="620" y="115" font-size="15" font-weight="600" fill="#475569">ধরণ</text>
  <text x="715" y="115" font-size="15" font-weight="600" fill="#475569">টাকা (৳)</text>

  <!-- Horizontal Blue Ruled Lines & Handwritten Entries -->
  ${[
    { y: 180, date: '০১/০৩/২৬', desc: 'নগদ বিক্রি (সকাল ও বিকাল)', type: 'বিক্রি (sale)', amt: '৩,৫০০', note: '' },
    { y: 230, date: '০১/০৩/২৬', desc: 'রহিম মিয়া - বাকি চাল ও তেল', type: 'বাকি দেওয়া', amt: '৫০০', note: '' },
    { y: 280, date: '০১/০৩/২৬', desc: 'দোকান ঝাড়ু ও চা খরচ', type: 'খরচ', amt: '১২০', note: '' },
    { y: 330, date: '০২/০৩/২৬', desc: 'তেল, ডাল ও চিনি বিক্রি', type: 'বিক্রি (sale)', amt: '৪,২০০', note: '' },
    { y: 380, date: '০২/০৩/২৬', desc: 'রহিম মিয়া - বাকি আদায়', type: 'বাকি আদায়', amt: '৩০০', note: '' },
    { y: 430, date: '০২/০৩/২৬', desc: 'করিম সওদাগর - বাকি', type: 'বাকি দেওয়া', amt: '৭০০', note: '' },
    { y: 480, date: '০৩/০৩/২৬', desc: 'সারাদিনের নগদ বেচাকেনা', type: 'বিক্রি (sale)', amt: '৩,৮৫০', note: '' },
    { y: 530, date: '০৩/০৩/২৬', desc: 'আলমগীর ভাই - বাকি ডিম ও মসলা', type: 'বাকি দেওয়া', amt: '৪৫০', note: '' },
    { y: 580, date: '০৪/০৩/২৬', desc: 'নগদ বিক্রি (চাল ও আটা)', type: 'বিক্রি (sale)', amt: '৩,৬০০', note: '' },
    { y: 630, date: '০৪/০৩/২৬', desc: 'দোকান ভাড়া পরিশোধ (অর্ধেক)', type: 'খরচ', amt: '১,৭৫০', note: '' },
    { y: 680, date: '০৫/০৩/২৬', desc: 'সারাদিনের দোকান বিক্রি', type: 'বিক্রি (sale)', amt: '৪,১০০', note: '' },
    { y: 730, date: '০৫/০৩/২৬', desc: 'করিম সওদাগর - বাকি জমা', type: 'বাকি আদায়', amt: '৪০০', note: '' },
    { y: 780, date: '০৬/০৩/২৬', desc: 'নগদ বিক্রি ও খুচরা পণ্য', type: 'বিক্রি (sale)', amt: '৩,৩০০', note: '' },
    { y: 830, date: '০৭/০৩/২৬', desc: 'হাটের দিন অতিরিক্ত বিক্রি', type: 'বিক্রি (sale)', amt: '৪,৮০০', note: '' },
    { y: 880, date: '০৭/০৩/২৬', desc: 'পলিথিন ব্যাগ ও ঠোঙা কেনা', type: 'খরচ', amt: '১৫০', note: '' },
    { y: 930, date: '০৮/০৩/২৬', desc: 'রফিক চাচা - বাকি পেঁয়াজ ও রসুন', type: 'বাকি দেওয়া', amt: '৩২০', note: '' },
    { y: 980, date: '০৮/০৩/২৬', desc: 'নগদ বেচাকেনা', type: 'বিক্রি (sale)', amt: '৩,৭০০', note: '' },
  ]
    .map(
      (item) => `
    <line x1="20" y1="${item.y}" x2="780" y2="${item.y}" stroke="#bfdbfe" stroke-width="1.2" opacity="0.85"/>
    <text x="50" y="${item.y - 12}" font-size="16" fill="#1e293b" font-weight="500">${item.date}</text>
    <text x="180" y="${item.y - 12}" font-size="17" fill="#0f172a" font-weight="600">${item.desc}</text>
    <text x="590" y="${item.y - 12}" font-size="14" fill="#334155">${item.type}</text>
    <text x="750" y="${item.y - 12}" font-size="18" fill="#09090b" font-weight="700" text-anchor="end">${item.amt}</text>
  `
    )
    .join('')}

  <!-- Vertical separator lines for table look -->
  <line x1="570" y1="95" x2="570" y2="1010" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="680" y1="95" x2="680" y2="1010" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3 3"/>

  <!-- Watermark / Stamp -->
  <g transform="translate(620, 890) rotate(-12)" opacity="0.35">
    <rect x="-10" y="-10" width="130" height="48" rx="6" fill="none" stroke="#2563eb" stroke-width="2.5"/>
    <text x="55" y="20" text-anchor="middle" font-size="14" font-weight="800" fill="#2563eb" letter-spacing="1">যাচাইকৃত খাতা</text>
  </g>
</svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
