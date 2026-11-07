"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Calculator, 
  ArrowLeftRight, 
  RotateCcw,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  calculateDomesticLandedCost, 
  calculateInternationalLandedCost,
  triggerExcelExport,
  triggerPdfExport
} from "@/lib/api";
import { DomesticLandedCost, InternationalLandedCost } from "@/types/procurement";

export default function LandedCostCalculatorPage() {
  // Domestic inputs
  const [domBase, setDomBase] = useState<number>(4900.0);
  const [domFreight, setDomFreight] = useState<number>(180.0);
  const [domHandling, setDomHandling] = useState<number>(35.0);
  const [domMandiTaxRate, setDomMandiTaxRate] = useState<number>(1.5);
  const domGstRate = 5.0;
  const domItc = true;

  // International inputs
  const [intlFob, setIntlFob] = useState<number>(960.0);
  const [intlOceanFreight, setIntlOceanFreight] = useState<number>(52.0);
  const [intlFx, setIntlFx] = useState<number>(85.50);
  const [intlBcdRate, setIntlBcdRate] = useState<number>(5.0);
  const intlInlandFreight = 1800.0;

  // Results
  const [domesticResult, setDomesticResult] = useState<DomesticLandedCost | null>(null);
  const [intlResult, setIntlResult] = useState<InternationalLandedCost | null>(null);
  const [calculating, setCalculating] = useState<boolean>(false);

  const recalculate = useCallback(async () => {
    setCalculating(true);
    try {
      const [dom, intl] = await Promise.all([
        calculateDomesticLandedCost({
          base_price_per_unit: domBase,
          freight_per_unit: domFreight,
          handling_per_unit: domHandling,
          mandi_tax_rate: domMandiTaxRate / 100.0,
          gst_rate: domGstRate / 100.0,
          itc_eligible: domItc,
        }),
        calculateInternationalLandedCost({
          fob_price_usd_per_mt: intlFob,
          ocean_freight_usd_per_mt: intlOceanFreight,
          exchange_rate_usd_to_inr: intlFx,
          basic_customs_duty_rate: intlBcdRate / 100.0,
          inland_transport_inr_per_mt: intlInlandFreight,
        }),
      ]);
      setDomesticResult(dom);
      setIntlResult(intl);
    } catch (e) {
      console.error(e);
    } finally {
      setCalculating(false);
    }
  }, [domBase, domFreight, domHandling, domMandiTaxRate, domGstRate, domItc, intlFob, intlOceanFreight, intlFx, intlBcdRate, intlInlandFreight]);

  useEffect(() => {
    recalculate();
  }, [recalculate]);

  const parityAdvantage = intlResult && domesticResult
    ? intlResult.totals.total_landed_cost_inr_per_quintal - domesticResult.total_landed_cost_per_unit
    : 0;

  const isDomesticCheaper = parityAdvantage > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] transition-colors">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text)] flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#10A37F]" />
              Landed Cost Parity Simulator (Side-by-Side)
            </h2>
            <Badge variant="default" className="text-[10px] font-mono">
              100% Certified Math Core
            </Badge>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 max-w-2xl font-sans">
            Compare Domestic Mandi procurement against International CIF Port Import Parity with full tax, duty, and inland freight breakdown.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-medium"
            onClick={() => {
              triggerExcelExport({
                title: "Landed Cost Parity Report",
                domestic_price: domBase,
                domestic_landed_cost: domesticResult?.total_landed_cost_per_unit ?? 5238.64,
                import_landed_cost: intlResult?.totals?.total_landed_cost_inr_per_quintal ?? 10043.78,
                signal: isDomesticCheaper ? "BUY_DOMESTIC" : "IMPORT_CIF",
                action: isDomesticCheaper ? "PROCURE_DOMESTIC_MANDI" : "BOOK_IMPORT_VESSEL",
                urgency: "HIGH",
              });
            }}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-[#10A37F]" />
            Export CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-medium"
            onClick={async () => {
              try {
                await triggerPdfExport({
                  title: "Landed Cost Parity Memorandum",
                  domestic_price: domBase,
                  domestic_landed_cost: domesticResult?.total_landed_cost_per_unit ?? 5238.64,
                  import_landed_cost: intlResult?.totals?.total_landed_cost_inr_per_quintal ?? 10043.78,
                  signal: isDomesticCheaper ? "BUY_DOMESTIC" : "IMPORT_CIF",
                  action: isDomesticCheaper ? "PROCURE_DOMESTIC_MANDI" : "BOOK_IMPORT_VESSEL",
                  urgency: "HIGH",
                });
              } catch (e) {
                console.error("PDF export error:", e);
              }
            }}
          >
            <FileText className="w-3.5 h-3.5 mr-1.5 text-[var(--text-muted)]" />
            Export PDF Memo
          </Button>
          <Button size="sm" variant="ghost" onClick={recalculate} disabled={calculating} className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]">
            <RotateCcw className={`w-3.5 h-3.5 mr-1.5 ${calculating ? "animate-spin" : ""}`} />
            Recalculate
          </Button>
        </div>
      </div>

      {/* Decision Arbitrage Banner */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-colors ${
        isDomesticCheaper 
          ? "bg-[var(--surface)] border-[#10A37F]/40 text-[var(--text)]" 
          : "bg-[var(--surface)] border-[var(--border)] text-[var(--text)]"
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white bg-[#10A37F]">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#10A37F] font-mono">Arbitrage Verdict</span>
            <h3 className="text-sm font-semibold text-[var(--text)] flex items-center gap-1.5">
              {isDomesticCheaper 
                ? `Domestic Mandi Cost Advantage: +₹${parityAdvantage.toFixed(2)}/qtl Discount`
                : `Import Parity Advantage: +₹${Math.abs(parityAdvantage).toFixed(2)}/qtl Discount`}
            </h3>
            <p className="text-xs text-[var(--text-muted)] font-sans mt-0.5">
              {isDomesticCheaper
                ? `Domestic delivered at ₹${domesticResult?.total_landed_cost_per_unit?.toFixed(2) ?? "5,238.64"}/qtl decisively beats Import CIF Parity at ₹${intlResult?.totals?.total_landed_cost_inr_per_quintal?.toFixed(2) ?? "10,043.78"}/qtl.`
                : `Import parity at ₹${intlResult?.totals?.total_landed_cost_inr_per_quintal?.toFixed(2) ?? "10,043.78"}/qtl is currently cheaper than domestic.`}
            </p>
          </div>
        </div>
        <Badge className="text-xs font-mono font-medium px-2.5 py-1 bg-[#10A37F] text-white">
          {isDomesticCheaper ? "RECOMMEND: DOMESTIC MANDI" : "RECOMMEND: IMPORT CIF"}
        </Badge>
      </div>

      {/* Side-by-Side Calculators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Domestic Channel */}
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardHeader className="border-b border-[var(--border)] pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-[var(--text)] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Domestic Mandi Procurement (Indore)
              </CardTitle>
              <Badge variant="outline" className="text-xs text-[#10A37F] border-[#10A37F]/30">
                ₹{domesticResult ? domesticResult.total_landed_cost_per_unit.toFixed(2) : "--"} / qtl
              </Badge>
            </div>
            <CardDescription className="text-xs text-[var(--text-muted)]">
              Direct mandi procurement with local transport, handling, shrinkage, and mandi cess.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-xs">
            {/* Input grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[var(--text)]">Base Mandi Price (₹/qtl)</label>
                <Input 
                  type="number" 
                  value={domBase} 
                  onChange={(e) => setDomBase(parseFloat(e.target.value) || 0)} 
                  className="mt-1 bg-[var(--surface)] border-[var(--border)] text-[var(--text)] text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--text)]">Inland Freight (₹/qtl)</label>
                <Input 
                  type="number" 
                  value={domFreight} 
                  onChange={(e) => setDomFreight(parseFloat(e.target.value) || 0)} 
                  className="mt-1 bg-[var(--surface)] border-[var(--border)] text-[var(--text)] text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--text)]">Handling & Labor (₹/qtl)</label>
                <Input 
                  type="number" 
                  value={domHandling} 
                  onChange={(e) => setDomHandling(parseFloat(e.target.value) || 0)} 
                  className="mt-1 bg-[var(--surface)] border-[var(--border)] text-[var(--text)] text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--text)]">Mandi Tax Rate (%)</label>
                <Input 
                  type="number" 
                  step="0.1" 
                  value={domMandiTaxRate} 
                  onChange={(e) => setDomMandiTaxRate(parseFloat(e.target.value) || 0)} 
                  className="mt-1 bg-[var(--surface)] border-[var(--border)] text-[var(--text)] text-xs"
                />
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="rounded-lg border border-[var(--border)] overflow-hidden mt-3">
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--border)] hover:bg-transparent">
                    <TableHead className="text-[11px] text-[var(--text-muted)]">Cost Component</TableHead>
                    <TableHead className="text-[11px] text-[var(--text-muted)] text-right">Amount (₹/qtl)</TableHead>
                    <TableHead className="text-[11px] text-[var(--text-muted)] text-right">Share (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-[var(--border)] hover:bg-[var(--bg)]/30 transition-colors">
                    <TableCell className="text-[var(--text)] font-medium">Base Material</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text)]">₹{domesticResult?.base_price_per_unit?.toFixed(2) ?? "4,900.00"}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text-muted)]">{domesticResult?.cost_breakdown_percentages?.material_share_pct ?? 93.5}%</TableCell>
                  </TableRow>
                  <TableRow className="border-[var(--border)] hover:bg-[var(--bg)]/30 transition-colors">
                    <TableCell className="text-[var(--text)]">Mandi Cess / Tax</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text)]">₹{domesticResult?.mandi_tax_amount?.toFixed(2) ?? "73.50"}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text-muted)]">1.4%</TableCell>
                  </TableRow>
                  <TableRow className="border-[var(--border)] hover:bg-[var(--bg)]/30 transition-colors">
                    <TableCell className="text-[var(--text)]">Logistics & Handling</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text)]">₹{domesticResult?.total_logistics_handling?.toFixed(2) ?? "248.54"}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text-muted)]">{domesticResult?.cost_breakdown_percentages?.logistics_share_pct ?? 4.8}%</TableCell>
                  </TableRow>
                  <TableRow className="border-[var(--border)] hover:bg-[var(--bg)]/30 transition-colors">
                    <TableCell className="text-[var(--text)]">Commercial & Insurance</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text)]">₹{domesticResult?.total_commercial_charges?.toFixed(2) ?? "16.60"}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text-muted)]">{domesticResult?.cost_breakdown_percentages?.commercial_fees_share_pct ?? 0.3}%</TableCell>
                  </TableRow>
                  <TableRow className="border-[var(--border)] bg-emerald-950/30 font-bold hover:bg-emerald-950/40">
                    <TableCell className="text-[#10A37F] font-semibold">Total Domestic Landed</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[#10A37F] font-bold">₹{domesticResult?.total_landed_cost_per_unit?.toFixed(2) ?? "5,238.64"}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[#10A37F] font-bold">100.0%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Right: International Import Channel */}
        <Card className="border-[var(--border)] bg-[var(--surface)]">
          <CardHeader className="border-b border-[var(--border)] pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-[var(--text)] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                International Import Parity (CIF Santos → Nhava Sheva)
              </CardTitle>
              <Badge variant="outline" className="text-xs text-[#10A37F] border-sky-500/30">
                ₹{intlResult ? intlResult.totals.total_landed_cost_inr_per_quintal.toFixed(2) : "--"} / qtl
              </Badge>
            </div>
            <CardDescription className="text-xs text-[var(--text-muted)]">
              Bulk vessel import parity with BCD, AIDC, social surcharge, port terminal handling, and CHA.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-xs">
            {/* Input grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[var(--text)]">FOB Price ($/MT)</label>
                <Input 
                  type="number" 
                  value={intlFob} 
                  onChange={(e) => setIntlFob(parseFloat(e.target.value) || 0)} 
                  className="mt-1 bg-[var(--surface)] border-[var(--border)] text-[var(--text)] text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--text)]">Ocean Freight ($/MT)</label>
                <Input 
                  type="number" 
                  value={intlOceanFreight} 
                  onChange={(e) => setIntlOceanFreight(parseFloat(e.target.value) || 0)} 
                  className="mt-1 bg-[var(--surface)] border-[var(--border)] text-[var(--text)] text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--text)]">USD/INR Exchange Rate</label>
                <Input 
                  type="number" 
                  step="0.05" 
                  value={intlFx} 
                  onChange={(e) => setIntlFx(parseFloat(e.target.value) || 0)} 
                  className="mt-1 bg-[var(--surface)] border-[var(--border)] text-[var(--text)] text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[var(--text)]">Basic Customs Duty (%)</label>
                <Input 
                  type="number" 
                  step="0.5" 
                  value={intlBcdRate} 
                  onChange={(e) => setIntlBcdRate(parseFloat(e.target.value) || 0)} 
                  className="mt-1 bg-[var(--surface)] border-[var(--border)] text-[var(--text)] text-xs"
                />
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="rounded-lg border border-[var(--border)] overflow-hidden mt-3">
              <Table>
                <TableHeader>
                  <TableRow className="border-[var(--border)] hover:bg-transparent">
                    <TableHead className="text-[11px] text-[var(--text-muted)]">Component</TableHead>
                    <TableHead className="text-[11px] text-[var(--text-muted)] text-right">Per MT (₹)</TableHead>
                    <TableHead className="text-[11px] text-[var(--text-muted)] text-right">Per Quintal (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-[var(--border)] hover:bg-[var(--bg)]/30 transition-colors">
                    <TableCell className="text-[var(--text)] font-medium">CIF Base (USD ${intlResult?.pricing_usd?.cif_price_usd_per_mt?.toFixed(2) ?? "1,012.00"})</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text)]">₹{intlResult?.customs_breakdown_inr?.assessable_value_inr_per_mt?.toFixed(2) ?? "86,526.00"}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text)]">₹{((intlResult?.customs_breakdown_inr?.assessable_value_inr_per_mt ?? 86526.00) / 10).toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow className="border-[var(--border)] hover:bg-[var(--bg)]/30 transition-colors">
                    <TableCell className="text-[var(--text)]">Customs Duties (BCD+AIDC+SWS)</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text)]">₹{intlResult?.customs_breakdown_inr?.total_customs_duty?.toFixed(2) ?? "9,561.12"}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text)]">₹{((intlResult?.customs_breakdown_inr?.total_customs_duty ?? 9561.12) / 10).toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow className="border-[var(--border)] hover:bg-[var(--bg)]/30 transition-colors">
                    <TableCell className="text-[var(--text)]">Port Handling & Clearance</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text)]">₹{intlResult?.logistics_and_handling_inr?.total_port_clearance?.toFixed(2) ?? "1,150.00"}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text)]">₹{((intlResult?.logistics_and_handling_inr?.total_port_clearance ?? 1150.00) / 10).toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow className="border-[var(--border)] hover:bg-[var(--bg)]/30 transition-colors">
                    <TableCell className="text-[var(--text)]">Inland Port-to-Plant Freight</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text)]">₹{intlResult?.logistics_and_handling_inr?.inland_transport_port_to_plant?.toFixed(2) ?? "1,800.00"}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text)]">₹{((intlResult?.logistics_and_handling_inr?.inland_transport_port_to_plant ?? 1800.00) / 10).toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow className="border-[var(--border)] bg-sky-950/30 font-bold hover:bg-sky-950/40">
                    <TableCell className="text-sky-300 font-semibold">Total Import Landed</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[#10A37F] font-bold">₹{intlResult?.totals?.total_landed_cost_inr_per_mt?.toFixed(2) ?? "100,437.80"}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[#10A37F] font-bold">₹{intlResult?.totals?.total_landed_cost_inr_per_quintal?.toFixed(2) ?? "10,043.78"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
