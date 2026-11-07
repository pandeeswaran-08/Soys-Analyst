"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Activity, 
  Play, 
  Pause, 
  BarChart2, 
  Globe, 
  ArrowUpRight,
  Bot
} from "lucide-react";

export function HeroTerminalMockup({ 
  heroImageSrc, 
  blendMode = "screen" 
}: { 
  heroImageSrc?: string;
  blendMode?: "screen" | "normal";
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState<"parity" | "forecast" | "flow">("parity");
  const [spotPrice, setSpotPrice] = useState(4900);
  const [paritySpread, setParitySpread] = useState(4831.60);

  // Live simulation tick
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.48) * 4;
      setSpotPrice((p) => Number((p + delta).toFixed(2)));
      setParitySpread((s) => Number((s - delta).toFixed(2)));
    }, 2400);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="w-full max-w-5xl rounded-2xl p-1 bg-[var(--surface)] border border-[var(--border)] shadow-md relative group transition-all">
      {/* Terminal Container */}
      <div className="rounded-xl bg-[var(--bg)] border border-[var(--border)] overflow-hidden">
        {/* Terminal Titlebar */}
        <div className="px-4 py-2.5 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4146] inline-block opacity-80" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623] inline-block opacity-80" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#10A37F] inline-block opacity-80" />
            </div>
            <span className="text-[11px] font-mono font-medium text-[var(--text-muted)] pl-2 border-l border-[var(--border)] flex items-center gap-2">
              <span className="text-[#10A37F] font-semibold">SOYDECISION_TERMINAL</span>
              <span className="text-[var(--text-muted)]">/</span>
              <span>LIVE_EXECUTION_MATRIX</span>
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px]">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--bg)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] transition-colors cursor-pointer"
              title={isPlaying ? "Pause live simulation" : "Resume live simulation"}
            >
              {isPlaying ? <Pause className="w-2.5 h-2.5 text-[#F5A623]" /> : <Play className="w-2.5 h-2.5 text-[#10A37F]" />}
              <span>{isPlaying ? "LIVE FEED" : "PAUSED"}</span>
            </button>
            <span className="flex items-center gap-1 text-[#10A37F] font-medium px-2 py-0.5 rounded bg-[#10A37F]/10 border border-[#10A37F]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10A37F]" />
              100% GROUNDED
            </span>
          </div>
        </div>

        {/* Hero Visual Area: Image / Cinematic Holographic Chart */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-[var(--surface)]">
          {heroImageSrc ? (
            <div className="absolute inset-0 z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={heroImageSrc} 
                alt="SoyDecision Desk High-Tech Trading Terminal" 
                className={`w-full h-full object-cover ${blendMode === "screen" ? "opacity-60 mix-blend-screen" : "opacity-80"} scale-105 group-hover:scale-100 transition-transform duration-1000`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)]/80 via-transparent to-[var(--bg)]/80" />
            </div>
          ) : (
            /* Fallback Dynamic Cinematic Grid */
            <div className="absolute inset-0 z-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
          )}

          {/* Interactive Top Tab Selectors */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <button
              onClick={() => setActiveTab("parity")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 backdrop-blur-md ${
                activeTab === "parity"
                  ? "bg-[#10A37F]/10 text-[#10A37F] border border-[#10A37F]/30 shadow-sm"
                  : "bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Domestic Parity
            </button>
            <button
              onClick={() => setActiveTab("forecast")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 backdrop-blur-md ${
                activeTab === "forecast"
                  ? "bg-[#10A37F]/10 text-[#10A37F] border border-[#10A37F]/30 shadow-sm"
                  : "bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              7D Forecast Band
            </button>
            <button
              onClick={() => setActiveTab("flow")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 backdrop-blur-md hidden sm:flex ${
                activeTab === "flow"
                  ? "bg-[#10A37F]/10 text-[#10A37F] border border-[#10A37F]/30 shadow-sm"
                  : "bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Global Freight Corridors
            </button>
          </div>

          {/* Live Floating Holographic Signal Card */}
          <div className="absolute top-4 right-4 z-10 max-w-xs p-3.5 rounded-2xl bg-[var(--surface)] border border-[#10A37F]/30 backdrop-blur-md shadow-xl text-left font-mono space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[var(--text-muted)] flex items-center gap-1 font-semibold uppercase tracking-wider">
                <Activity className="w-3 h-3 text-[#10A37F]" />
                Algorithmic Directive
              </span>
              <span className="text-[#10A37F] font-bold">100% ALLOC</span>
            </div>
            <div className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-[#10A37F] text-white text-xs font-bold tracking-wide">
                BUY_AGGRESSIVE
              </span>
              <span className="text-[11px] text-[#10A37F] font-normal">HIGH URGENCY</span>
            </div>
            <div className="text-[10px] text-[var(--text-muted)] pt-1 border-t border-[var(--border)] flex items-center justify-between">
              <span>Target Landed Cap:</span>
              <span className="text-[var(--text)] font-bold">₹5,200.00/qtl</span>
            </div>
          </div>

          {/* Center Holographic Graphic & Chart Overlay */}
          <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
            {activeTab === "parity" && (
              <div className="w-full max-w-xl space-y-3 bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] backdrop-blur-md shadow-2xl">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--text-muted)]">Domestic Mandi (Indore)</span>
                  <span className="text-[#10A37F] font-bold text-sm tabular-nums">
                    ₹{spotPrice.toFixed(2)}/qtl
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-[var(--border)] overflow-hidden p-0.5 flex">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: "34%" }} />
                  <div className="h-full bg-[#EF4146]/20 rounded-full ml-1 flex-1" />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                  <span className="flex items-center gap-1 text-[#10A37F]">
                    <TrendingUp className="w-3 h-3" />
                    Domestic Advantage: +₹{paritySpread.toFixed(2)}/qtl
                  </span>
                  <span>Import Parity: ₹10,005.24/qtl</span>
                </div>
              </div>
            )}

            {activeTab === "forecast" && (
              <div className="w-full max-w-xl space-y-3 bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] backdrop-blur-md shadow-2xl">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--text-muted)]">Holt-Winters 7-Day Horizon</span>
                  <span className="text-[#F5A623] font-bold text-sm tabular-nums">
                    Target: ₹5,243.00/qtl (95% CI)
                  </span>
                </div>
                <div className="h-20 flex items-end justify-between gap-2 pt-4 px-2">
                  {[4750, 4790, 4830, 4880, 4920, 5060, 5243].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                      <div 
                        className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md transition-all duration-700" 
                        style={{ height: `${((val - 4600) / 700) * 100}%` }}
                      />
                      <span className="text-[9px] font-mono text-[var(--text-muted)]">T+{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "flow" && (
              <div className="w-full max-w-xl space-y-3 bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] backdrop-blur-md shadow-2xl text-xs font-mono">
                <div className="flex items-center justify-between text-[var(--text)] pb-2 border-b border-[var(--border)]">
                  <span>Santos (Brazil) ➔ Nhava Sheva (India)</span>
                  <span className="text-[#10A37F] font-bold">$48.00 / MT Ocean Freight</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10.5px]">
                  <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border)]">
                    <span className="text-[var(--text-muted)] block">USD/INR FX</span>
                    <span className="text-[var(--text)] font-bold">85.50</span>
                  </div>
                  <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border)]">
                    <span className="text-[var(--text-muted)] block">Effective Duty</span>
                    <span className="text-[var(--text)] font-bold">11.00%</span>
                  </div>
                  <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border)]">
                    <span className="text-[var(--text-muted)] block">Voyage Shrinkage</span>
                    <span className="text-[var(--text)] font-bold">0.30%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Terminal Live Bar */}
          <div className="absolute bottom-3 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] backdrop-blur-md text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[#10A37F] font-bold">
                <Bot className="w-3.5 h-3.5" />
                Autonomous 5-Node Agent:
              </span>
              <span className="text-[var(--text)] hidden sm:inline">
                Mathematical Parity Certified &bull; WASDE Vector Intelligence RAG
              </span>
            </div>
            <Link 
              href="/dashboard/chat" 
              className="px-2.5 py-1 rounded-lg bg-[#10A37F] hover:bg-[#0D8A6D] text-white font-medium flex items-center gap-1 text-[11px] transition-colors"
            >
              <span>Test Query</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
