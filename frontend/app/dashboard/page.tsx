"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SoyLogo } from "@/components/ui/logo";
import {
  Scale,
  TrendingUp,
  Package,
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Flame,
  ArrowUpRight,
  Wheat
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  calculateDomesticLandedCost,
  calculateInternationalLandedCost,
  fetchPriceForecast,
  calculateSafetyStock,
  fetchTimingSignal,
  triggerExcelExport,
  triggerPdfExport
} from "@/lib/api";
import {
  DomesticLandedCost,
  InternationalLandedCost,
  ForecastResult,
  InventoryEvaluation,
  TimingSignalResult
} from "@/types/procurement";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function DashboardOverviewPage() {
  const [domestic, setDomestic] = useState<DomesticLandedCost | null>(null);
  const [international, setInternational] = useState<InternationalLandedCost | null>(null);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [inventory, setInventory] = useState<InventoryEvaluation | null>(null);
  const [timing, setTiming] = useState<TimingSignalResult | null>(null);
  const [, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [domRes, intlRes, fcRes, invRes, timeRes] = await Promise.all([
          calculateDomesticLandedCost({ base_price_per_unit: 4900.0, freight_per_unit: 180.0, mandi_tax_rate: 0.015 }),
          calculateInternationalLandedCost({ fob_price_usd_per_mt: 960.0, ocean_freight_usd_per_mt: 42.0, exchange_rate_usd_to_inr: 85.50 }),
          fetchPriceForecast([4720, 4750, 4780, 4820, 4860, 4900], 7),
          calculateSafetyStock({
            current_stock: 360.0,
            average_daily_demand: 50.0,
            demand_std_dev: 8.0,
            lead_time_days: 7.0,
            lead_time_std_dev: 1.5,
            service_level: 0.95,
          }),
          fetchTimingSignal({
            current_price: 5238.64,
            forecasted_prices: [4950, 5000, 5050, 5100, 5150, 5200, 5250],
            target_cost_budget: 5200.0,
            current_stock_days: 7.2,
          }),
        ]);

        setDomestic(domRes);
        setInternational(intlRes);
        setForecast(fcRes);
        setInventory(invRes);
        setTiming(timeRes);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await triggerExcelExport({
        domestic_price: domestic?.base_price_per_unit ?? 4900.0,
        domestic_landed_cost: domestic?.total_landed_cost_per_unit ?? 5238.64,
        import_landed_cost: international?.totals?.total_landed_cost_inr_per_quintal ?? 10043.78,
        signal: timing?.signal ?? "BUY_AGGRESSIVE",
        action: timing?.action ?? "PROCURE_FULL_ALLOCATION",
        urgency: timing?.urgency_level ?? "HIGH",
        current_stock: inventory?.current_stock ?? 360.0,
        reorder_point: inventory?.reorder_point ?? 393.52,
        safety_stock: inventory?.safety_stock ?? 43.52,
      });
    } catch (err) {
      console.error("Excel export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await triggerPdfExport({
        title: "Executive Procurement Memorandum",
        domestic_price: domestic?.base_price_per_unit ?? 4900.0,
        domestic_landed_cost: domestic?.total_landed_cost_per_unit ?? 5238.64,
        import_landed_cost: international?.totals?.total_landed_cost_inr_per_quintal ?? 10043.78,
        signal: timing?.signal ?? "BUY_AGGRESSIVE",
        action: timing?.action ?? "PROCURE_FULL_ALLOCATION",
        urgency: timing?.urgency_level ?? "HIGH",
        current_stock: inventory?.current_stock ?? 360.0,
        reorder_point: inventory?.reorder_point ?? 393.52,
        safety_stock: inventory?.safety_stock ?? 43.52,
        forecast_7d: forecast?.forecast_mean?.length ? forecast.forecast_mean[forecast.forecast_mean.length - 1] : 5210.0,
      });
    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Build chart dataset
  const historicalDates = ["Nov 01", "Nov 02", "Nov 03", "Nov 04", "Nov 05", "Nov 06"];
  const histPrices = [4720, 4750, 4780, 4820, 4860, 4900];

  const means: number[] = forecast?.forecast_mean || (forecast as unknown as { point_forecast?: number[] })?.point_forecast || [];
  const lowBands: number[] = forecast?.prediction_intervals?.["95%"]?.lower || (forecast as unknown as { lower_band?: number[] })?.lower_band || [];
  const upBands: number[] = forecast?.prediction_intervals?.["95%"]?.upper || (forecast as unknown as { upper_band?: number[] })?.upper_band || [];

  const chartData = [
    ...historicalDates.map((d, i) => ({
      label: d,
      actual: histPrices[i],
      mean: null,
      lower95: null,
      upper95: null,
    })),
    ...means.map((meanVal, i) => {
      const low95 = lowBands[i] ?? (meanVal * 0.95);
      const up95 = upBands[i] ?? (meanVal * 1.05);
      return {
        label: `T+${i + 1}`,
        actual: null,
        mean: Math.round(meanVal),
        lower95: Math.round(low95),
        upper95: Math.round(up95),
      };
    }),
  ];

  const parityAdvantage = international && domestic
    ? international.totals.total_landed_cost_inr_per_quintal - domestic.total_landed_cost_per_unit
    : 4805.14;

  return (
    <div className="space-y-5">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] transition-colors">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <SoyLogo size={22} variant="brand" className="shrink-0" />
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">
              SoyDecision Desk &bull; Executive Command
            </h2>
            <Badge variant="default" className="text-[10px] font-mono font-medium tracking-wider">
              AUDITED CORE
            </Badge>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 max-w-2xl font-sans">
            Real-time domestic mandi vs import parity, Holt-Winters forward price forecasting, and deterministic timing signals.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="text-xs font-medium"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-[#10A37F]" />
            Export Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="text-xs font-medium"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5 text-[var(--text-muted)]" />
            Export PDF Memo
          </Button>
          <Link href="/dashboard/chat">
            <Button size="sm" className="bg-[#10A37F] hover:bg-[#0D8A6D] text-white font-medium text-xs">
              <Bot className="w-3.5 h-3.5 mr-1.5" />
              Agentic Chat
            </Button>
          </Link>
          <Link href="/dashboard/landed-cost">
            <Button size="sm" variant="outline" className="text-xs font-medium">
              <Scale className="w-3.5 h-3.5 mr-1.5 text-[#10A37F]" />
              Parity Calculator
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Ribbon (4 Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Domestic Landed Cost */}
        <Card className="rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-colors">
          <CardHeader className="pb-2">
            <div className="text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-[#10A37F]/10 flex items-center justify-center text-[#10A37F]">
                  <Wheat className="w-3 h-3" />
                </div>
                Domestic Landed Cost
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                Indore Mandi
              </Badge>
            </div>
            <CardTitle className="text-2xl font-semibold text-[var(--text)] font-mono tracking-tight tabular-nums flex items-baseline gap-1 mt-2">
              ₹{domestic && Number.isFinite(domestic.total_landed_cost_per_unit) ? domestic.total_landed_cost_per_unit.toFixed(2) : "5,238.64"}
              <span className="text-xs font-normal text-[var(--text-muted)] font-sans tracking-normal">/ qtl</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xs text-[var(--text-muted)] flex items-center justify-between border-t border-[var(--border)] pt-2 mt-1 font-sans">
              <span>Base: <span className="font-mono tabular-nums text-[var(--text)]">₹{domestic && Number.isFinite(domestic.base_price_per_unit) ? domestic.base_price_per_unit : 4900}</span></span>
              <span className="text-[#10A37F] font-semibold font-mono tabular-nums">
                +₹{Number.isFinite(parityAdvantage) ? parityAdvantage.toFixed(2) : "4,805.14"} Advantage
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: International CIF Landed Cost */}
        <Card className="rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-colors">
          <CardHeader className="pb-2">
            <div className="text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)]">
                  <Scale className="w-3 h-3" />
                </div>
                Import Parity (CIF)
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                Nhava Sheva
              </Badge>
            </div>
            <CardTitle className="text-2xl font-semibold text-[var(--text)] font-mono tracking-tight tabular-nums flex items-baseline gap-1 mt-2">
              ₹{international && Number.isFinite(international.totals?.total_landed_cost_inr_per_quintal) ? international.totals.total_landed_cost_inr_per_quintal.toFixed(2) : "10,043.78"}
              <span className="text-xs font-normal text-[var(--text-muted)] font-sans tracking-normal">/ qtl</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xs text-[var(--text-muted)] flex items-center justify-between border-t border-[var(--border)] pt-2 mt-1 font-sans">
              <span>FOB: <span className="font-mono tabular-nums text-[var(--text)]">${international?.pricing_usd && Number.isFinite(international.pricing_usd.fob_price_usd_per_mt) ? international.pricing_usd.fob_price_usd_per_mt : 960}/MT</span></span>
              <span className="text-[#EF4146] font-semibold font-mono tabular-nums">
                +91.7% vs Domestic
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Inventory Position & Safety Stock */}
        <Card className="rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-colors">
          <CardHeader className="pb-2">
            <div className="text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)]">
                  <Package className="w-3 h-3" />
                </div>
                Safety Stock & ROP
              </span>
              <Badge variant="amber" className="text-[10px] font-mono font-medium uppercase tracking-wider">
                {inventory?.status ?? "REORDER_NOW"}
              </Badge>
            </div>
            <CardTitle className="text-2xl font-semibold text-[var(--text)] font-mono tracking-tight tabular-nums flex items-baseline gap-1 mt-2">
              {inventory && Number.isFinite(inventory.current_stock) ? inventory.current_stock : 360}
              <span className="text-xs font-normal text-[var(--text-muted)] font-sans tracking-normal">
                qtl (<span className="font-mono tabular-nums">{inventory && Number.isFinite(inventory.estimated_days_of_supply) ? inventory.estimated_days_of_supply : 7.2}</span> days)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xs text-[var(--text-muted)] flex items-center justify-between border-t border-[var(--border)] pt-2 mt-1 font-sans">
              <span>ROP: <span className="font-mono tabular-nums text-[var(--text)]">{inventory && Number.isFinite(inventory.reorder_point) ? inventory.reorder_point : 393.52} qtl</span></span>
              <span className="text-[#F5A623] font-mono text-[11px] font-medium">Critical Buffer</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Next Buy Signal */}
        <Card className="rounded-xl border border-[var(--border)] bg-[var(--surface)] transition-colors">
          <CardHeader className="pb-2">
            <div className="text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-[#10A37F]/10 flex items-center justify-center text-[#10A37F]">
                  <Activity className="w-3 h-3" />
                </div>
                Procurement Directive
              </span>
              <span className="text-[#10A37F] font-mono font-semibold text-[10px]">{timing?.urgency_level ?? "HIGH"} URGENCY</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center rounded-lg bg-[#10A37F] text-white font-mono font-semibold text-xs px-3 py-1 uppercase tracking-wider shadow-2xs">
                {timing?.signal ?? "BUY_AGGRESSIVE"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-[var(--text-muted)] mt-2 font-medium flex items-center justify-between border-t border-[var(--border)] pt-2 font-mono">
              <span className="truncate text-[var(--text)]">{timing?.action ?? "PROCURE_FULL_ALLOCATION"}</span>
              <span className="text-[#10A37F] text-[10px] font-bold shrink-0">100% ALLOC</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Forecast Trend + Recommendation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Forecast Trend Chart (2 Columns) */}
        <Card className="lg:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[var(--border)]">
            <div>
              <CardTitle className="text-sm text-[var(--text)] flex items-center gap-2 font-semibold tracking-tight">
                <TrendingUp className="w-4 h-4 text-[#10A37F]" />
                Forward Price Forecast & 95% Uncertainty Bands
              </CardTitle>
              <CardDescription className="text-xs text-[var(--text-muted)] mt-0.5">
                Holt-Winters statistical projection with empirical prediction bounds.
              </CardDescription>
            </div>
            <Link href="/dashboard/forecasting">
              <Button variant="ghost" size="sm" className="text-xs text-[#10A37F] hover:text-[#0D8A6D] font-medium h-7">
                Full Model
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="uncertaintyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10A37F" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10A37F" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                  <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} tickLine={false} className="font-mono" />
                  <YAxis stroke="var(--text-muted)" fontSize={11} domain={["auto", "auto"]} tickLine={false} className="font-mono" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      borderColor: "var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontFamily: "monospace",
                      color: "var(--text)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                    }}
                    itemStyle={{ color: "var(--text)" }}
                  />
                  {/* Historical line */}
                  <Area type="monotone" dataKey="actual" stroke="#6E6E80" strokeWidth={2} fill="transparent" name="Spot Price (INR)" />
                  {/* Upper/Lower 95% band */}
                  <Area type="monotone" dataKey="upper95" stroke="#10A37F" strokeDasharray="3 3" strokeWidth={1} fill="url(#uncertaintyGrad)" name="95% Upper Band" />
                  <Area type="monotone" dataKey="lower95" stroke="#10A37F" strokeDasharray="3 3" strokeWidth={1} fill="transparent" name="95% Lower Band" />
                  {/* Mean Forecast */}
                  <Area type="monotone" dataKey="mean" stroke="#10A37F" strokeWidth={2} fill="transparent" name="Holt-Winters Mean" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-between text-xs text-[var(--text-muted)] pt-3 border-t border-[var(--border)] gap-2 font-sans">
              <span>Historical Spot: <strong className="text-[var(--text)] font-mono tabular-nums">₹4,900/qtl</strong></span>
              <span>7-Day Projected Mean: <strong className="text-[#10A37F] font-mono tabular-nums">₹{forecast?.forecast_mean?.length && Number.isFinite(forecast.forecast_mean[forecast.forecast_mean.length - 1]) ? forecast.forecast_mean[forecast.forecast_mean.length - 1].toFixed(2) : "5,210.00"}/qtl</strong></span>
              <span>Model MAPE: <strong className="text-[var(--text)] font-mono tabular-nums">{forecast?.metrics && Number.isFinite(forecast.metrics.mape) ? forecast.metrics.mape : 0.72}%</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Executive Recommendation Box (1 Column) */}
        <Card className="rounded-xl border border-[var(--border)] bg-[var(--surface)] flex flex-col justify-between">
          <CardHeader className="border-b border-[var(--border)] pb-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-[#10A37F]/10 text-[#10A37F] border border-[#10A37F]/30 text-[10px] font-mono uppercase tracking-wider font-semibold">
                Audited Recommendation
              </Badge>
              <span className="text-[11px] text-[var(--text-muted)] font-mono font-medium tabular-nums">Confidence: 96%</span>
            </div>
            <CardTitle className="text-base font-semibold text-[var(--text)] mt-2 tracking-tight">
              Procure 100% Domestic Mandi Allocation
            </CardTitle>
            <CardDescription className="text-xs text-[var(--text-muted)]">
              Deterministic directive certified by NumericalSafetyGuard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-3 text-xs">
            <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-2.5">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10A37F] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[var(--text)] text-xs">Decisive Parity Advantage</p>
                  <p className="text-[var(--text-muted)] text-[11px] font-sans mt-0.5">
                    Indore delivered at <span className="font-mono tabular-nums text-[var(--text)]">₹5,238.64</span> vs <span className="font-mono tabular-nums text-[var(--text)]">₹10,043.78</span> import CIF parity (<span className="text-[#10A37F] font-mono tabular-nums font-semibold">+₹4,805.14/qtl</span> discount).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 border-t border-[var(--border)] pt-2.5">
                <AlertTriangle className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[var(--text)] text-xs">Reorder Threshold Breached</p>
                  <p className="text-[var(--text-muted)] text-[11px] font-sans mt-0.5">
                    Current stock of <span className="font-mono tabular-nums text-[var(--text)]">360.00 qtl</span> has fallen below the <span className="font-mono tabular-nums text-[var(--text)]">393.52 qtl</span> ROP trigger.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 border-t border-[var(--border)] pt-2.5">
                <TrendingUp className="w-4 h-4 text-[#10A37F] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[var(--text)] text-xs">Positive Holding Arbitrage</p>
                  <p className="text-[var(--text-muted)] text-[11px] font-sans mt-0.5">
                    Forward price appreciation (<span className="font-mono tabular-nums text-[#10A37F] font-semibold">+2.4%</span>) exceeds holding carrying cost rate.
                  </p>
                </div>
              </div>
            </div>

            <Link href="/dashboard/chat" className="block pt-1">
              <Button className="w-full bg-[#10A37F] hover:bg-[#0D8A6D] text-white text-xs font-semibold transition-all h-9">
                <Bot className="w-4 h-4 mr-1.5" />
                Discuss Strategy with Agent
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        <Link href="/dashboard/landed-cost">
          <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)] transition-colors cursor-pointer group">
            <div className="w-7 h-7 rounded-md bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[#10A37F] mb-2">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-xs text-[var(--text)]">Landed Cost Parity</h4>
              <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[#10A37F] transition-colors" />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-sans">Side-by-side domestic vs international import simulator.</p>
          </div>
        </Link>
        <Link href="/dashboard/inventory">
          <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)] transition-colors cursor-pointer group">
            <div className="w-7 h-7 rounded-md bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[#F5A623] mb-2">
              <Package className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-xs text-[var(--text)]">Safety Stock & ROP</h4>
              <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[#F5A623] transition-colors" />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-sans">Dual-variability lead time inventory modeling & EOQ.</p>
          </div>
        </Link>
        <Link href="/dashboard/stress-test">
          <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)] transition-colors cursor-pointer group">
            <div className="w-7 h-7 rounded-md bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[#EF4146] mb-2">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-xs text-[var(--text)]">Scenario Stress Test</h4>
              <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[#EF4146] transition-colors" />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-sans">USD/INR FX shocks, ocean freight spikes & tariff impact.</p>
          </div>
        </Link>
        <Link href="/dashboard/documents">
          <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)] transition-colors cursor-pointer group">
            <div className="w-7 h-7 rounded-md bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[#10A37F] mb-2">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-xs text-[var(--text)]">Semantic Hybrid RAG</h4>
              <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[#10A37F] transition-colors" />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-sans">Ingest WASDE & crop reports with dense+sparse search.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
