"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SoyLogo, ScreenedWatermark } from "@/components/ui/logo";
import {
  ArrowRight,
  Activity,
  Bot,
  ShieldCheck,
  Calculator,
  TrendingUp,
  ArrowUpRight,
  MapPin,
  Building2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveTicker } from "@/components/layout/ticker";
import { HeroTerminalMockup } from "@/components/layout/terminal-mockup";

export default function HomePage() {
  const [liveIndore, setLiveIndore] = useState(4900.00);

  // Subtle live spot tick simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.48) * 3;
      setLiveIndore((prev) => Number((prev + delta).toFixed(2)));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col justify-between text-[var(--text)] transition-colors selection:bg-[#10A37F] selection:text-white">
      <LiveTicker />

      {/* Top Navbar */}
      <header className="border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
              <SoyLogo size={28} variant="brand" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-[var(--text)]">
                  SoyDecision
                </span>
                <span className="text-[#10A37F] font-mono text-[9px] font-bold px-1 rounded bg-[#10A37F]/10 border border-[#10A37F]/30">
                  DESK
                </span>
              </div>
            </div>
          </Link>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[var(--text-muted)]">
            <Link href="/dashboard" className="hover:text-[var(--text)] transition-colors">
              Executive Desk
            </Link>
            <Link href="/dashboard/chat" className="hover:text-[var(--text)] transition-colors flex items-center gap-1.5">
              <span>AI Strategist</span>
              <span className="px-1 py-0.2 rounded text-[9px] bg-[#10A37F]/10 text-[#10A37F] font-mono border border-[#10A37F]/30">
                AI CORE
              </span>
            </Link>
            <Link href="/dashboard/landed-cost" className="hover:text-[var(--text)] transition-colors">
              Landed Parity
            </Link>
            <Link href="/dashboard/crush-margin" className="hover:text-[var(--text)] transition-colors">
              Crush GPM
            </Link>
            <a href="#about" className="hover:text-[var(--text)] transition-colors">
              About
            </a>
            <Link href="/dashboard/forecasting" className="hover:text-[var(--text)] transition-colors">
              Holt-Winters
            </Link>
            <Link href="/dashboard/stress-test" className="hover:text-[var(--text)] transition-colors">
              Stress Testing
            </Link>
          </nav>

          {/* Right Action Button */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button size="sm" className="bg-[#10A37F] hover:bg-[#0D8A6D] text-white font-medium text-xs px-3.5 h-8 rounded-lg transition-all cursor-pointer">
                <span>Launch Desk</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-12 pb-24 relative overflow-hidden">
        {/* Ambient Screened Brand Watermark */}
        <ScreenedWatermark className="top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" size={620} />

        {/* 1. Hero Header & Copy */}
        <div className="text-center max-w-4xl mx-auto flex flex-col items-center relative z-10">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] text-xs font-mono mb-5 shadow-2xs">
            <Activity className="w-3.5 h-3.5 text-[#10A37F]" />
            <span>Commercial Soybean Crushing &bull; Mandi Arbitrage &bull; 100% Math Grounded</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text)] leading-[1.12]">
            Algorithmic Commodity Hedging &{" "}
            <span className="text-[#10A37F]">Soybean Crush</span> Decision Desk
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-base text-[var(--text-muted)] max-w-2xl leading-relaxed font-sans">
            Institutional quantitative procurement terminal for commercial soybean crushers, grain elevators, and commodity merchandisers. Harmonizes domestic mandi spot parity with Brazilian CIF import economics, econometric price forecasting, and autonomous decision intelligence.
          </p>

          {/* CTAs */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/dashboard">
              <Button size="lg" className="bg-[#10A37F] hover:bg-[#0D8A6D] text-white font-medium text-sm px-6 h-10 rounded-lg transition-all flex items-center gap-2 shadow-xs cursor-pointer">
                <span>Launch Trading Desk</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard/chat">
              <Button size="lg" variant="outline" className="border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--bg)] text-[var(--text)] font-medium text-sm px-6 h-10 rounded-lg transition-all flex items-center gap-2 cursor-pointer">
                <Bot className="w-4 h-4 text-[#10A37F]" />
                <span>AI Strategist Terminal</span>
              </Button>
            </Link>
          </div>

          {/* Live Metrics Ticker Banner */}
          <div className="mt-10 w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider block">Domestic Indore Spot</span>
              <span className="text-sm sm:text-base font-semibold font-mono text-[var(--text)] tabular-nums">
                ₹{liveIndore.toFixed(2)} <span className="text-[10px] font-sans text-[var(--text-muted)]">/qtl</span>
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider block">Import CIF Parity</span>
              <span className="text-sm sm:text-base font-semibold font-mono text-[var(--text)] tabular-nums">
                ₹10,005.24 <span className="text-[10px] font-sans text-[var(--text-muted)]">/qtl</span>
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider block">Domestic Cost Adv.</span>
              <span className="text-sm sm:text-base font-semibold font-mono text-[#10A37F] tabular-nums">
                +₹4,831.60 <span className="text-[10px] font-sans text-[#10A37F]">/qtl</span>
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider block">Procurement Signal</span>
              <span className="text-sm sm:text-base font-semibold font-mono text-[#10A37F] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10A37F] animate-pulse" />
                BUY_AGGRESSIVE
              </span>
            </div>
          </div>
        </div>

        {/* 2. Hero Visual Centerpiece: Dual-Pillar Interactive Showcase */}
        <div className="mt-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch text-left relative z-10">
          {/* Left Column: Physical Commodity & Extraction Assets (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl p-5 bg-[var(--surface)] border border-[var(--border)] shadow-md flex flex-col justify-between group transition-all">
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border)]">
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-[#10A37F]" />
                  <span className="font-semibold text-[var(--text)] tracking-tight">COMMODITY INTAKE</span>
                  <span className="text-[var(--text-muted)]">/</span>
                  <span className="text-[var(--text-muted)]">SOYA CHUNKS & MEAL</span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#10A37F]/10 text-[#10A37F] border border-[#10A37F]/30 font-bold">
                  COMMERCIAL GRADE
                </span>
              </div>

              {/* Physical Soya Photography Card */}
              <div className="mt-3.5 relative h-56 sm:h-64 rounded-xl overflow-hidden border border-[var(--border)] group-hover:border-[#10A37F]/40 transition-all bg-black/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/soya-hero.jpg"
                  alt="Soybean Meal Chunks and Golden Soybeans Physical Commodity"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none pointer-events-none"
                />
                {/* Atmospheric gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Floating Top Chip */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white font-mono text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10A37F]" />
                  <span>52% High-Protein DOC &bull; TVP Chunks</span>
                </div>

                {/* Floating Bottom Card Over Image */}
                <div className="absolute bottom-3 left-3 right-3 z-10 p-2.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/15 text-white flex items-center justify-between font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-white/70 block uppercase tracking-wider">Primary Mandi Hub</span>
                    <span className="font-semibold text-white">Indore APMC &bull; 45,000 Bags/Day</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#10A37F] font-bold block">18% Oil Recovery</span>
                    <span className="text-white font-bold">₹{liveIndore.toFixed(2)} /qtl</span>
                  </div>
                </div>
              </div>

              {/* Recovery Specs Grid */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-left font-mono">
                <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-muted)] block">Crush Yield</span>
                  <span className="text-xs font-semibold text-[var(--text)]">82% Meal DOC</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-muted)] block">Oil Fraction</span>
                  <span className="text-xs font-semibold text-[#10A37F]">18% Crude Oil</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-muted)] block">CBOT Ratio</span>
                  <span className="text-xs font-semibold text-[var(--text)]">10:11:9</span>
                </div>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[var(--text-muted)] font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10A37F]" />
                Lab-Audited Moisture &lt; 10%
              </span>
              <Link
                href="/dashboard/crush-margin"
                className="text-[#10A37F] hover:underline font-mono text-[11px] font-medium flex items-center gap-1"
              >
                <span>Crush Margin</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Right Column: Quantitative Live Terminal Engine (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <HeroTerminalMockup heroImageSrc="/soya-hero.jpg" blendMode="normal" />
          </div>
        </div>

        {/* 3. Section: Real-Time Mandi Arbitrage Matrix */}
        <div className="mt-20 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#10A37F] mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>REGIONAL MANDI SPOT BENCHMARKS</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">
                Multi-Mandi Real-Time Parity Radar
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-sans">
                Comparing primary commercial soybean crushing hubs with mandi taxes, logistics freight, and factory delivered landed cost.
              </p>
            </div>
            <Link
              href="/dashboard/landed-cost"
              className="text-xs font-mono text-[#10A37F] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Explore Full Parity Engine</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Hub 1: Indore */}
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[#10A37F]/50 transition-all font-mono space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10A37F]" />
                  Indore APMC
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">Madhya Pradesh</span>
              </div>
              <div className="text-lg font-bold text-[var(--text)] tabular-nums">
                ₹4,900.00 <span className="text-[10px] text-[var(--text-muted)] font-normal font-sans">/qtl</span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] space-y-0.5 pt-2 border-t border-[var(--border)]">
                <div className="flex justify-between">
                  <span>Mandi Tax (1.5%):</span>
                  <span>₹73.50</span>
                </div>
                <div className="flex justify-between">
                  <span>Haulage Freight:</span>
                  <span>₹180.00</span>
                </div>
                <div className="flex justify-between font-bold text-[var(--text)] pt-1 border-t border-[var(--border)]">
                  <span>Landed Delivered:</span>
                  <span className="text-[#10A37F]">₹5,173.64</span>
                </div>
              </div>
              <div className="pt-2">
                <span className="block text-center text-[10px] font-bold text-[#10A37F] bg-[#10A37F]/10 border border-[#10A37F]/30 rounded py-0.5">
                  BUY_AGGRESSIVE
                </span>
              </div>
            </div>

            {/* Hub 2: Latur */}
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[#10A37F]/50 transition-all font-mono space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10A37F]" />
                  Latur APMC
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">Maharashtra</span>
              </div>
              <div className="text-lg font-bold text-[var(--text)] tabular-nums">
                ₹4,940.00 <span className="text-[10px] text-[var(--text-muted)] font-normal font-sans">/qtl</span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] space-y-0.5 pt-2 border-t border-[var(--border)]">
                <div className="flex justify-between">
                  <span>Mandi Tax (1.05%):</span>
                  <span>₹51.87</span>
                </div>
                <div className="flex justify-between">
                  <span>Haulage Freight:</span>
                  <span>₹210.00</span>
                </div>
                <div className="flex justify-between font-bold text-[var(--text)] pt-1 border-t border-[var(--border)]">
                  <span>Landed Delivered:</span>
                  <span className="text-[var(--text)]">₹5,204.12</span>
                </div>
              </div>
              <div className="pt-2">
                <span className="block text-center text-[10px] font-bold text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] rounded py-0.5">
                  PROCURE_TRANCHE
                </span>
              </div>
            </div>

            {/* Hub 3: Kota */}
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[#10A37F]/50 transition-all font-mono space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10A37F]" />
                  Kota APMC
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">Rajasthan</span>
              </div>
              <div className="text-lg font-bold text-[var(--text)] tabular-nums">
                ₹4,870.00 <span className="text-[10px] text-[var(--text-muted)] font-normal font-sans">/qtl</span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] space-y-0.5 pt-2 border-t border-[var(--border)]">
                <div className="flex justify-between">
                  <span>Mandi Tax (1.6%):</span>
                  <span>₹77.92</span>
                </div>
                <div className="flex justify-between">
                  <span>Haulage Freight:</span>
                  <span>₹220.00</span>
                </div>
                <div className="flex justify-between font-bold text-[var(--text)] pt-1 border-t border-[var(--border)]">
                  <span>Landed Delivered:</span>
                  <span className="text-[#10A37F]">₹5,142.80</span>
                </div>
              </div>
              <div className="pt-2">
                <span className="block text-center text-[10px] font-bold text-[#10A37F] bg-[#10A37F]/10 border border-[#10A37F]/30 rounded py-0.5">
                  BUY_AGGRESSIVE
                </span>
              </div>
            </div>

            {/* Hub 4: Akola */}
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[#10A37F]/50 transition-all font-mono space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10A37F]" />
                  Akola APMC
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">Vidarbha</span>
              </div>
              <div className="text-lg font-bold text-[var(--text)] tabular-nums">
                ₹4,920.00 <span className="text-[10px] text-[var(--text-muted)] font-normal font-sans">/qtl</span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] space-y-0.5 pt-2 border-t border-[var(--border)]">
                <div className="flex justify-between">
                  <span>Mandi Tax (1.05%):</span>
                  <span>₹51.66</span>
                </div>
                <div className="flex justify-between">
                  <span>Haulage Freight:</span>
                  <span>₹200.00</span>
                </div>
                <div className="flex justify-between font-bold text-[var(--text)] pt-1 border-t border-[var(--border)]">
                  <span>Landed Delivered:</span>
                  <span className="text-[var(--text)]">₹5,183.50</span>
                </div>
              </div>
              <div className="pt-2">
                <span className="block text-center text-[10px] font-bold text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] rounded py-0.5">
                  PROCURE_TRANCHE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Section: Three Deterministic Mathematical Engines */}
        <div className="mt-20 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono text-[#10A37F] uppercase tracking-wider block mb-1">
              Deterministic Mathematical Foundation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
              Engineered for Institutional Precision
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 font-sans">
              Decoupled Python algorithmic core ensuring zero hallucinations and 100% mathematical verifiability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Pillar 1 */}
            <Link href="/dashboard/landed-cost" className="group">
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] h-full flex flex-col justify-between hover:border-[var(--text-muted)] transition-all">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[#10A37F] mb-4 group-hover:scale-105 transition-transform">
                    <Calculator className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-semibold text-[var(--text)] text-sm mb-2 tracking-tight flex items-center justify-between">
                    <span>Deterministic Parity Engine</span>
                    <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#10A37F] transition-colors" />
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed font-sans">
                    Harmonizes domestic mandi landed costs against Santos & Paranaguá CIF import parity. Factors customs duty, welfare surcharge, ocean freight, port clearing, and inland haulage.
                  </p>
                </div>
                <div className="mt-6 pt-3.5 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#10A37F]">Mandi vs CIF Import</span>
                  <span className="text-[var(--text-muted)]">&rarr;</span>
                </div>
              </div>
            </Link>

            {/* Pillar 2 */}
            <Link href="/dashboard/chat" className="group">
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] h-full flex flex-col justify-between hover:border-[var(--text-muted)] transition-all">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[#10A37F] mb-4 group-hover:scale-105 transition-transform">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-semibold text-[var(--text)] text-sm mb-2 tracking-tight flex items-center justify-between">
                    <span>Autonomous AI Strategist</span>
                    <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#10A37F] transition-colors" />
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed font-sans">
                    5-node reasoning core orchestrating vector intelligence, live market tools, and numerical safety guards. Every figure is audited against ground truth before output.
                  </p>
                </div>
                <div className="mt-6 pt-3.5 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#10A37F]">Interactive Advisory</span>
                  <span className="text-[var(--text-muted)]">&rarr;</span>
                </div>
              </div>
            </Link>

            {/* Pillar 3 */}
            <Link href="/dashboard/forecasting" className="group">
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] h-full flex flex-col justify-between hover:border-[var(--text-muted)] transition-all">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[#10A37F] mb-4 group-hover:scale-105 transition-transform">
                    <TrendingUp className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-semibold text-[var(--text)] text-sm mb-2 tracking-tight flex items-center justify-between">
                    <span>Econometrics & Safety Stock</span>
                    <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#10A37F] transition-colors" />
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed font-sans">
                    Holt-Winters forward price projections, 95% empirical confidence intervals, dual-variability lead time buffers, Reorder Point (ROP) calculation, and Monte Carlo VaR simulation.
                  </p>
                </div>
                <div className="mt-6 pt-3.5 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#10A37F]">Forward Trajectory</span>
                  <span className="text-[var(--text-muted)]">&rarr;</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* 5. Section: About SoyDecision Desk (Institutional Background & Plant Operations) */}
        <section id="about" className="mt-20 relative z-10 scroll-mt-20">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10 lg:p-12 overflow-hidden relative shadow-md">
            {/* Ambient Watermark inside About Card */}
            <ScreenedWatermark size={460} className="right-[-40px] bottom-[-40px] opacity-[0.03] dark:opacity-[0.04] pointer-events-none" />

            <div className="relative z-10 space-y-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border)] pb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#10A37F] mb-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>INSTITUTIONAL COMMODITY BACKGROUND</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
                    About SoyDecision Desk
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl font-sans">
                    Architected specifically for commercial soybean crushing complexes, solvent extraction plants, and grain merchandising desks.
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--text-muted)] bg-[var(--bg)] px-3 py-1.5 rounded-lg border border-[var(--border)] shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#10A37F] animate-pulse" />
                  <span>Central India &bull; South America Arbitrage Matrix</span>
                </div>
              </div>

              {/* Narrative & Key Mission */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed font-sans">
                  <p>
                    <strong className="text-[var(--text)] font-semibold">SoyDecision Desk</strong> was engineered to eliminate the persistent margin erosion faced by soybean crushing plants due to volatile mandi spot arrivals, moisture dockages, and fluctuating international import parity.
                  </p>
                  <p>
                    By harmonizing real-time APMC mandi spot arrivals across Madhya Pradesh, Maharashtra, and Rajasthan with Brazilian FOB Santos & Paranaguá bulk vessel import economics, the platform provides institutional crushers with continuous, deterministic arbitrage visibility.
                  </p>
                  <p>
                    Every pricing directive and hedging recommendation is verified by pure Python mathematical formulations—enforcing zero hallucinated numbers, certified Gross Processing Margins (GPM), and strict Value-at-Risk governance.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#10A37F]" />
                      Zero Hallucination Guarantee
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10A37F]" />
                      CBOT 10:11:9 Greeks Sensitivity
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#10A37F]" />
                      Holt-Winters 95% Confidence
                    </span>
                  </div>
                </div>

                {/* Operational Stats Grid (4 Cards) */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-3.5 font-mono">
                  <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Crush Capacity Evaluated</span>
                    <div className="text-xl sm:text-2xl font-bold text-[var(--text)] mt-1">500,000+</div>
                    <span className="text-[11px] text-[var(--text-muted)]">Metric Tons / Year</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Mandi Coverage</span>
                    <div className="text-xl sm:text-2xl font-bold text-[#10A37F] mt-1">4 Major Hubs</div>
                    <span className="text-[11px] text-[var(--text-muted)]">Indore, Latur, Kota, Akola</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Math Audit Rate</span>
                    <div className="text-xl sm:text-2xl font-bold text-[var(--text)] mt-1">100% Certified</div>
                    <span className="text-[11px] text-[var(--text-muted)]">Deterministic Grounding</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Arbitrage Spread</span>
                    <div className="text-xl sm:text-2xl font-bold text-[#10A37F] mt-1">+₹4,831.60</div>
                    <span className="text-[11px] text-[var(--text-muted)]">Domestic vs Import Parity</span>
                  </div>
                </div>
              </div>

              {/* 3 Strategic Pillars within About */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[var(--border)]">
                <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text)]">
                    <span className="w-5 h-5 rounded-md bg-[#10A37F]/10 border border-[#10A37F]/30 flex items-center justify-center text-[#10A37F] text-[10px] font-bold">1</span>
                    <span>Commercial Plant Operations</span>
                  </div>
                  <p className="text-[11.5px] text-[var(--text-muted)] leading-relaxed font-sans">
                    Built from direct milling plant experience—evaluating moisture deductions, gunny bag tare weights, loading labor, and APMC cess directly into factory-gate landed costs.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text)]">
                    <span className="w-5 h-5 rounded-md bg-[#10A37F]/10 border border-[#10A37F]/30 flex items-center justify-center text-[#10A37F] text-[10px] font-bold">2</span>
                    <span>Global Maritime Parity</span>
                  </div>
                  <p className="text-[11.5px] text-[var(--text-muted)] leading-relaxed font-sans">
                    Tracks Santos and Paranaguá FOB vessel economics, ocean voyage shrinkage, basic customs duties, social welfare surcharges, and container clearing into western India ports.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text)]">
                    <span className="w-5 h-5 rounded-md bg-[#10A37F]/10 border border-[#10A37F]/30 flex items-center justify-center text-[#10A37F] text-[10px] font-bold">3</span>
                    <span>Autonomous Risk Stewardship</span>
                  </div>
                  <p className="text-[11.5px] text-[var(--text-muted)] leading-relaxed font-sans">
                    Enforces Holt-Winters 7-day forward pricing bands, dual-variability safety stock buffers, and Monte Carlo Value-at-Risk simulations to preserve crush margins.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Section: Institutional Call to Action */}
        <div className="mt-20 p-8 sm:p-10 rounded-2xl bg-[var(--surface)] border border-[var(--border)] relative overflow-hidden text-center max-w-4xl mx-auto shadow-md">
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#10A37F]/10 border border-[#10A37F]/30 flex items-center justify-center mx-auto text-[#10A37F]">
              <SoyLogo size={28} variant="brand" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
              Ready to Upgrade Commodity Procurement?
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
              Experience the institutional soybean crushing terminal with deterministic mathematical grounding and autonomous decision execution.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/dashboard">
                <Button className="bg-[#10A37F] hover:bg-[#0D8A6D] text-white font-medium text-xs px-5 h-9 rounded-lg transition-all flex items-center gap-2 cursor-pointer">
                  <span>Enter Trading Desk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Link href="/dashboard/audit-logs">
                <Button variant="outline" className="border-[var(--border)] text-[var(--text)] text-xs px-5 h-9 rounded-lg hover:bg-[var(--bg)] transition-all cursor-pointer">
                  View Audit Registry
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-6 px-6 bg-[var(--bg)] text-xs text-[var(--text-muted)] font-mono transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <SoyLogo size={18} variant="brand" />
            <span>SoyDecision Desk &copy; {new Date().getFullYear()} &bull; Institutional Commodity Terminal</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="#about" className="hover:text-[var(--text)] transition-colors">
              About Platform
            </a>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-[#10A37F] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Math Certified
            </span>
            <span>&bull;</span>
            <Link href="/dashboard/audit-logs" className="hover:text-[var(--text)] transition-colors">
              Audit Registry
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
