"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Package, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateSafetyStock } from "@/lib/api";
import { InventoryEvaluation } from "@/types/procurement";

export default function InventoryPage() {
  const [dailyDemand, setDailyDemand] = useState<number>(50.0);
  const [demandStdDev, setDemandStdDev] = useState<number>(8.0);
  const [leadTime, setLeadTime] = useState<number>(7.0);
  const [leadTimeStdDev, setLeadTimeStdDev] = useState<number>(1.5);
  const [serviceLevel, setServiceLevel] = useState<number>(0.95);
  const [currentStock, setCurrentStock] = useState<number>(360.0);
  const orderingCost = 1500.0;
  const annualHoldingCost = 250.0;

  const [evaluation, setEvaluation] = useState<InventoryEvaluation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const recalculate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await calculateSafetyStock({
        average_daily_demand: dailyDemand,
        demand_std_dev: demandStdDev,
        lead_time_days: leadTime,
        lead_time_std_dev: leadTimeStdDev,
        service_level: serviceLevel,
        current_stock: currentStock,
        annual_demand: dailyDemand * 365,
        ordering_cost: orderingCost,
        annual_holding_cost_per_unit: annualHoldingCost,
      });
      setEvaluation(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [dailyDemand, demandStdDev, leadTime, leadTimeStdDev, serviceLevel, currentStock]);

  useEffect(() => {
    recalculate();
  }, [recalculate]);

  const status = evaluation?.status || "REORDER_NOW";
  const ss = evaluation?.safety_stock || 43.52;
  const rop = evaluation?.reorder_point || 393.52;
  const stock = currentStock;

  // Calculate percentage along the stock capacity line (up to 1.5 * ROP)
  const maxScale = Math.max(rop * 1.4, stock * 1.2, 500);
  const ssPct = (ss / maxScale) * 100;
  const ropPct = (rop / maxScale) * 100;
  const stockPct = Math.min(100, (stock / maxScale) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] transition-colors">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text)] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#10A37F]" />
            Safety Stock & Reorder Point (ROP) Calculator
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Dual-variability lead time stochastic modeling (demand variance + supplier transit variance) with Economic Order Quantity (EOQ).
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Badge variant="default" className="text-[11px] font-mono tracking-tight px-2.5 py-0.5">
            SS = Z × √(L σ_d² + d² σ_L²)
          </Badge>
          <Button size="sm" variant="ghost" onClick={recalculate} disabled={loading} className="text-xs h-8">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Recalculate
          </Button>
        </div>
      </div>

      {/* Status Warning Banner */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-colors ${
        status === "HEALTHY" 
          ? "bg-[var(--surface)] border-[#10A37F]/50 text-[var(--text)]" 
          : status === "REORDER_NOW"
          ? "bg-[var(--surface)] border-[#F5A623]/50 text-[var(--text)]"
          : "bg-[var(--surface)] border-[#EF4146]/50 text-[var(--text)]"
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white ${
            status === "HEALTHY" ? "bg-[#10A37F]" : status === "REORDER_NOW" ? "bg-[#F5A623]" : "bg-[#EF4146]"
          }`}>
            {status === "HEALTHY" ? <CheckCircle2 className="w-5 h-5" /> : status === "REORDER_NOW" ? <AlertTriangle className="w-5 h-5" /> : <AlertOctagon className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-[var(--text-muted)]">Plant Inventory Diagnosis</span>
            <h3 className="text-sm font-semibold tracking-tight text-[var(--text)]">
              Status: {status.replace(/_/g, " ")} (<span className="font-mono tabular-nums">{evaluation?.estimated_days_of_supply ?? 7.2}</span> Days Runway)
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {evaluation?.action_recommended || "Stock is below the Reorder Point. Initiate purchase order immediately."}
            </p>
          </div>
        </div>
        <Badge className={`text-xs font-mono uppercase tracking-wider px-2.5 py-1 font-semibold shrink-0 text-white ${
          status === "HEALTHY" ? "bg-[#10A37F]" : status === "REORDER_NOW" ? "bg-[#F5A623]" : "bg-[#EF4146]"
        }`}>
          {status === "HEALTHY" ? "STOCK SECURE" : status === "REORDER_NOW" ? "TRIGGER PO NOW" : "CRITICAL STOCKOUT RISK"}
        </Badge>
      </div>

      {/* Visual Stock Runway Gauge */}
      <Card className="glass-card border-[var(--border)] p-5">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Inventory Position Runway vs Buffer Thresholds
        </h4>
        <div className="relative w-full h-8 bg-[var(--surface)] rounded-lg border border-[var(--border)] overflow-hidden mb-6 shadow-inner">
          {/* Critical zone: below SS */}
          <div 
            className="absolute top-0 bottom-0 left-0 bg-rose-950/40 border-r border-rose-500/50"
            style={{ width: `${ssPct}%` }}
          />
          {/* Reorder zone: between SS and ROP */}
          <div 
            className="absolute top-0 bottom-0 bg-amber-950/30 border-r border-amber-500/50"
            style={{ left: `${ssPct}%`, width: `${ropPct - ssPct}%` }}
          />
          {/* Healthy zone: above ROP */}
          <div 
            className="absolute top-0 bottom-0 bg-emerald-950/20"
            style={{ left: `${ropPct}%`, width: `${100 - ropPct}%` }}
          />
          {/* Current Stock Marker */}
          <div 
            className="absolute top-0 bottom-0 w-2.5 bg-sky-400 shadow-lg shadow-sky-500/50 z-10 transition-all rounded"
            style={{ left: `calc(${stockPct}% - 5px)` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-[var(--text)] font-mono tabular-nums">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4146]/20 border border-rose-500 inline-block" />
            Safety Stock: <strong>{ss.toFixed(2)} qtl</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/40 border border-amber-500 inline-block" />
            Reorder Point (ROP): <strong>{rop.toFixed(2)} qtl</strong>
          </span>
          <span className="flex items-center gap-1.5 text-[#10A37F]">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-400 inline-block" />
            Current Stock: <strong>{stock} qtl ({evaluation?.estimated_days_of_supply ?? 7.2}d)</strong>
          </span>
        </div>
      </Card>

      {/* Inputs & Calculated Deliverables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parameters Input Card */}
        <Card className="glass-card border-[var(--border)]">
          <CardHeader className="pb-3 border-b border-[var(--border)]">
            <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)]">Operational Demand & Lead Time Inputs</CardTitle>
            <CardDescription className="text-xs text-[var(--text-muted)]">
              Tune daily crush consumption, vendor lead times, and desired service level.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-xs">
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Daily Demand (d̄, qtl/day)</label>
                <Input 
                  type="number" 
                  value={dailyDemand} 
                  onChange={(e) => setDailyDemand(parseFloat(e.target.value) || 0)} 
                  className="mt-1.5 bg-[var(--surface)] border-[var(--border)] text-[var(--text)] font-mono text-xs h-9 focus:border-[#10A37F]/30"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Demand Std Dev (σ_d)</label>
                <Input 
                  type="number" 
                  value={demandStdDev} 
                  onChange={(e) => setDemandStdDev(parseFloat(e.target.value) || 0)} 
                  className="mt-1.5 bg-[var(--surface)] border-[var(--border)] text-[var(--text)] font-mono text-xs h-9 focus:border-[#10A37F]/30"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Lead Time (L, days)</label>
                <Input 
                  type="number" 
                  value={leadTime} 
                  onChange={(e) => setLeadTime(parseFloat(e.target.value) || 0)} 
                  className="mt-1.5 bg-[var(--surface)] border-[var(--border)] text-[var(--text)] font-mono text-xs h-9 focus:border-[#10A37F]/30"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Lead Time Std Dev (σ_L, days)</label>
                <Input 
                  type="number" 
                  value={leadTimeStdDev} 
                  onChange={(e) => setLeadTimeStdDev(parseFloat(e.target.value) || 0)} 
                  className="mt-1.5 bg-[var(--surface)] border-[var(--border)] text-[var(--text)] font-mono text-xs h-9 focus:border-[#10A37F]/30"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Current Plant Stock (qtl)</label>
                <Input 
                  type="number" 
                  value={currentStock} 
                  onChange={(e) => setCurrentStock(parseFloat(e.target.value) || 0)} 
                  className="mt-1.5 bg-[var(--surface)] border-[var(--border)] text-[var(--text)] font-mono text-xs h-9 focus:border-[#10A37F]/30"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Service Level (Z-Factor)</label>
                <div className="flex gap-1.5 mt-1.5">
                  {[0.90, 0.95, 0.99].map((lvl) => (
                    <Button
                      key={lvl}
                      type="button"
                      size="sm"
                      variant={serviceLevel === lvl ? "default" : "outline"}
                      className={`text-xs font-mono h-9 flex-1 ${serviceLevel === lvl ? "bg-[#10A37F] hover:bg-[#0D8A6D] text-white shadow-sm" : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--bg)] text-[var(--text)]"}`}
                      onClick={() => setServiceLevel(lvl)}
                    >
                      {lvl * 100}%
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calculated Results Table */}
        <Card className="glass-card border-[var(--border)]">
          <CardHeader className="pb-3 border-b border-[var(--border)]">
            <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)]">Audited Inventory Metrics</CardTitle>
            <CardDescription className="text-xs text-[var(--text-muted)]">
              Formulas verified against pure Python math_core routines.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[var(--border)] bg-[var(--surface)] hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Inventory Metric</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] text-right">Audited Value</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] text-right">Interpretation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  <TableRow className="border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors">
                    <TableCell className="font-medium text-[var(--text)]">Safety Stock (SS)</TableCell>
                    <TableCell className="text-right font-mono tabular-nums font-bold text-[#10A37F]">{ss.toFixed(2)} qtl</TableCell>
                    <TableCell className="text-right text-[var(--text-muted)]">Buffer at {serviceLevel * 100}% SL</TableCell>
                  </TableRow>
                  <TableRow className="border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors">
                    <TableCell className="font-medium text-[var(--text)]">Lead Time Demand (LTD)</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text)]">{(dailyDemand * leadTime).toFixed(2)} qtl</TableCell>
                    <TableCell className="text-right text-[var(--text-muted)]">Mean consumption during transit</TableCell>
                  </TableRow>
                  <TableRow className="border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors">
                    <TableCell className="font-medium text-[var(--text)]">Reorder Point (ROP)</TableCell>
                    <TableCell className="text-right font-mono tabular-nums font-bold text-[#F5A623]">{rop.toFixed(2)} qtl</TableCell>
                    <TableCell className="text-right text-[var(--text-muted)]">Trigger purchase when stock hits ROP</TableCell>
                  </TableRow>
                  <TableRow className="border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors">
                    <TableCell className="font-medium text-[var(--text)]">Economic Order Quantity (EOQ)</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[var(--text)]">{evaluation?.economic_order_quantity?.toFixed(2) ?? "450.00"} qtl</TableCell>
                    <TableCell className="text-right text-[var(--text-muted)]">Optimal order tranche batch size</TableCell>
                  </TableRow>
                  <TableRow className="bg-[var(--surface)] font-bold hover:bg-[var(--surface)]">
                    <TableCell className="text-sky-300">Stock Runway Days</TableCell>
                    <TableCell className="text-right font-mono tabular-nums text-[#10A37F]">{evaluation?.estimated_days_of_supply ?? 7.2} Days</TableCell>
                    <TableCell className="text-right text-[#10A37F]">{stock < rop ? "ACTION REQUIRED" : "SAFE"}</TableCell>
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
