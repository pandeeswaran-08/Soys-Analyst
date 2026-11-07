"use client";

import React from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export function LiveTicker() {
  const quotes = [
    { symbol: "CBOT Soybeans (ZS)", price: "$10.24½ / bu", change: "+8¼", positive: true },
    { symbol: "Soybean Meal (ZM)", price: "$314.80 / ton", change: "+$2.40", positive: true },
    { symbol: "Soybean Oil (ZL)", price: "44.65¢ / lb", change: "+0.58¢", positive: true },
    { symbol: "Board Crush", price: "148.25¢ / bu", change: "+4.10¢", positive: true },
    { symbol: "Decatur Basis", price: "+12.0¢ over", change: "Unch", positive: true },
    { symbol: "CIF Gulf NOLA", price: "+68.0¢ over", change: "-2.0¢", positive: false },
    { symbol: "Illinois River Barge", price: "380% of Tariff", change: "+15%", positive: false },
  ];

  return (
    <div className="bg-[var(--surface)] border-b border-[var(--border)] text-xs px-4 py-1.5 flex items-center justify-between overflow-hidden select-none transition-colors">
      <div className="flex items-center gap-1.5 text-[#10A37F] font-medium shrink-0 mr-4 tracking-wider uppercase text-[10px] bg-[#10A37F]/10 border border-[#10A37F]/30 px-2 py-0.5 rounded">
        <Activity className="w-3 h-3 text-[#10A37F]" />
        <span>Market Feeds</span>
      </div>
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap">
        {quotes.map((q, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-[var(--text)]">
            <span className="font-medium text-[var(--text-muted)] text-[11px]">{q.symbol}:</span>
            <span className="font-mono text-[var(--text)] font-semibold tabular-nums text-xs">{q.price}</span>
            <span className={`flex items-center text-[11px] font-mono font-medium tabular-nums ${q.positive ? "text-[#10A37F]" : "text-[#EF4146]"}`}>
              {q.positive ? <TrendingUp className="w-3 h-3 mr-0.5 shrink-0" /> : <TrendingDown className="w-3 h-3 mr-0.5 shrink-0" />}
              {q.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
