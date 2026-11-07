"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Flame, 
  RotateCcw
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchStressTest } from "@/lib/api";
import { StressTestResult } from "@/types/procurement";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";

const WEATHER_OPTIONS = [
  { id: "NORMAL", label: "Normal Weather", multiplier: 1.0 },
  { id: "MODERATE_DROUGHT", label: "Moderate Drought (+8%)", multiplier: 1.08 },
  { id: "SEVERE_DROUGHT", label: "Severe Drought (+18%)", multiplier: 1.18 },
  { id: "FLOOD_EXCESSIVE_RAIN", label: "Excessive Rain (+12%)", multiplier: 1.12 },
];

export default function StressTestPage() {
  const [fxDepreciation, setFxDepreciation] = useState<number>(5.0);
  const [freightShock, setFreightShock] = useState<number>(25.0);
  const [dutyHike, setDutyHike] = useState<number>(5.0);
  const [weatherShock, setWeatherShock] = useState<string>("SEVERE_DROUGHT");

  const [stressData, setStressData] = useState<StressTestResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runStressSimulation = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchStressTest({
        inr_depreciation_pct: fxDepreciation,
        ocean_freight_shock_pct: freightShock,
        customs_duty_hike_pct_points: dutyHike,
        weather_impact: weatherShock,
      });
      setStressData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [fxDepreciation, freightShock, dutyHike, weatherShock]);

  useEffect(() => {
    runStressSimulation();
  }, [runStressSimulation]);

  // Format Recharts data comparing scenarios
  const barData = [
    {
      scenario: "Baseline",
      domestic: Math.round(stressData?.baseline?.domestic_landed_inr_per_quintal ?? 5238.64),
      import: Math.round(stressData?.baseline?.import_landed_inr_per_quintal ?? 10043.78),
    },
    {
      scenario: `FX (+${fxDepreciation}%)`,
      domestic: Math.round(stressData?.sensitivities?.inr_depreciation?.domestic_landed_inr_per_quintal ?? 5238.64),
      import: Math.round(stressData?.sensitivities?.inr_depreciation?.import_landed_inr_per_quintal ?? 10545.97),
    },
    {
      scenario: `Freight (+${freightShock}%)`,
      domestic: Math.round(stressData?.sensitivities?.ocean_freight_spike?.domestic_landed_inr_per_quintal ?? 5238.64),
      import: Math.round(stressData?.sensitivities?.ocean_freight_spike?.import_landed_inr_per_quintal ?? 10170.25),
    },
    {
      scenario: `Tariff (+${dutyHike}%)`,
      domestic: Math.round(stressData?.sensitivities?.customs_duty_hike?.domestic_landed_inr_per_quintal ?? 5238.64),
      import: Math.round(stressData?.sensitivities?.customs_duty_hike?.import_landed_inr_per_quintal ?? 10522.40),
    },
    {
      scenario: "Weather Shock",
      domestic: Math.round(stressData?.sensitivities?.drought_alone?.domestic_landed_inr_per_quintal ?? 6218.64),
      import: Math.round(stressData?.sensitivities?.drought_alone?.import_landed_inr_per_quintal ?? 10043.78),
    },
    {
      scenario: "Combined Disaster",
      domestic: Math.round(stressData?.scenarios?.combined_macro_disaster?.domestic_landed_inr_per_quintal ?? 6280.40),
      import: Math.round(stressData?.scenarios?.combined_macro_disaster?.import_landed_inr_per_quintal ?? 11158.60),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] transition-colors">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text)] flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#EF4146]" />
            Macro Scenario Stress Testing Simulator
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Stress-test procurement parity across currency depreciation, ocean freight spikes, import duty hikes, and severe drought shocks.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Badge variant="destructive" className="text-[11px] font-mono tracking-tight px-2.5 py-0.5">
            Compound Stress Engine
          </Badge>
          <Button size="sm" variant="ghost" onClick={runStressSimulation} disabled={loading} className="text-xs h-8">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Recalculate
          </Button>
        </div>
      </div>

      {/* Stress Controls Ribbon */}
      <Card className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">USD/INR Depreciation (%)</label>
            <div className="flex items-center gap-2 mt-1.5">
              <Input 
                type="number" 
                value={fxDepreciation} 
                onChange={(e) => setFxDepreciation(parseFloat(e.target.value) || 0)}
                className="bg-[var(--surface)] border-[var(--border)] text-[var(--text)] text-xs font-mono tabular-nums h-9 focus:border-rose-500/50"
              />
              <span className="text-[var(--text-muted)] font-mono">%</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Ocean Freight Spike (%)</label>
            <div className="flex items-center gap-2 mt-1.5">
              <Input 
                type="number" 
                value={freightShock} 
                onChange={(e) => setFreightShock(parseFloat(e.target.value) || 0)}
                className="bg-[var(--surface)] border-[var(--border)] text-[var(--text)] text-xs font-mono tabular-nums h-9 focus:border-rose-500/50"
              />
              <span className="text-[var(--text-muted)] font-mono">%</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Customs Duty Hike (% pts)</label>
            <div className="flex items-center gap-2 mt-1.5">
              <Input 
                type="number" 
                value={dutyHike} 
                onChange={(e) => setDutyHike(parseFloat(e.target.value) || 0)}
                className="bg-[var(--surface)] border-[var(--border)] text-[var(--text)] text-xs font-mono tabular-nums h-9 focus:border-rose-500/50"
              />
              <span className="text-[var(--text-muted)] font-mono">pts</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Weather Severity Anomaly</label>
            <select 
              value={weatherShock} 
              onChange={(e) => setWeatherShock(e.target.value)}
              className="w-full mt-1.5 h-9 px-3 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-xs font-sans focus:outline-none focus:border-rose-500/50"
            >
              {WEATHER_OPTIONS.map((w) => (
                <option key={w.id} value={w.id} className="bg-[var(--surface)] text-[var(--text)]">{w.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Main Stress Comparison Chart */}
      <Card className="glass-card border-[var(--border)]">
        <CardHeader className="pb-3 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)]">
              Delivered Landed Cost Parity Comparison Under Stress (₹/qtl)
            </CardTitle>
            <Badge variant="outline" className="text-[11px] font-mono tracking-tight text-[#10A37F] border-[#10A37F]/30 bg-[#10A37F]/10">
              Breakeven FX: ₹{stressData?.breakeven_usd_inr_exchange_rate?.toFixed(2) ?? "44.52"} / USD
            </Badge>
          </div>
          <CardDescription className="text-xs text-[var(--text-muted)] mt-1">
            Domestic Mandi remains resilient under isolated and compound macro shocks due to high import customs and ocean freight.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="scenario" stroke="#64748b" fontSize={11} className="font-mono" />
                <YAxis stroke="#64748b" fontSize={11} domain={["auto", "auto"]} className="font-mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "8px", fontSize: "12px", fontFamily: "monospace" }}
                  itemStyle={{ color: "#f8fafc" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="domestic" fill="#10b981" name="Domestic Delivered (₹/qtl)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="import" fill="#38bdf8" name="Import CIF Parity (₹/qtl)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sensitivity Breakdown Table */}
      <Card className="glass-card border-[var(--border)]">
        <CardHeader className="pb-3 border-b border-[var(--border)]">
          <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)]">Stress Test Sensitivity Matrix</CardTitle>
          <CardDescription className="text-xs text-[var(--text-muted)]">
            Isolated sensitivities vs compound black-swan scenario.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[var(--border)] bg-[var(--surface)] hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Scenario</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] text-right">Domestic (₹/qtl)</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] text-right">Import CIF (₹/qtl)</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] text-right">Parity Gap (₹/qtl)</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] text-right">Parity Winner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                <TableRow className="border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors">
                  <TableCell className="font-medium text-[var(--text)]">Baseline (Current)</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-[#10A37F] font-bold">₹{stressData?.baseline?.domestic_landed_inr_per_quintal?.toFixed(2) ?? "5,238.64"}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-[var(--text)]">₹{stressData?.baseline?.import_landed_inr_per_quintal?.toFixed(2) ?? "10,043.78"}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-[#10A37F] font-bold">+₹{stressData?.baseline?.domestic_cost_advantage_inr?.toFixed(2) ?? "4,805.14"}</TableCell>
                  <TableCell className="text-right"><Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider text-[#10A37F] border-[#10A37F]/30 bg-[#10A37F]/10">DOMESTIC</Badge></TableCell>
                </TableRow>
                <TableRow className="border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors">
                  <TableCell className="font-medium text-[var(--text)]">USD/INR Depreciation (+{fxDepreciation}%)</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-[var(--text)]">₹{stressData?.sensitivities?.inr_depreciation?.domestic_landed_inr_per_quintal?.toFixed(2) ?? "5,238.64"}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-[#EF4146]">₹{stressData?.sensitivities?.inr_depreciation?.import_landed_inr_per_quintal?.toFixed(2) ?? "10,545.97"}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-[#10A37F] font-bold">+₹{stressData?.sensitivities?.inr_depreciation?.domestic_cost_advantage_inr?.toFixed(2) ?? "5,307.33"}</TableCell>
                  <TableCell className="text-right"><Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider text-[#10A37F] border-[#10A37F]/30 bg-[#10A37F]/10">DOMESTIC</Badge></TableCell>
                </TableRow>
                <TableRow className="border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors">
                  <TableCell className="font-medium text-[var(--text)]">Ocean Freight Spike (+{freightShock}%)</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-[var(--text)]">₹{stressData?.sensitivities?.ocean_freight_spike?.domestic_landed_inr_per_quintal?.toFixed(2) ?? "5,238.64"}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-[#EF4146]">₹{stressData?.sensitivities?.ocean_freight_spike?.import_landed_inr_per_quintal?.toFixed(2) ?? "10,170.25"}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-[#10A37F] font-bold">+₹{stressData?.sensitivities?.ocean_freight_spike?.domestic_cost_advantage_inr?.toFixed(2) ?? "4,931.61"}</TableCell>
                  <TableCell className="text-right"><Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider text-[#10A37F] border-[#10A37F]/30 bg-[#10A37F]/10">DOMESTIC</Badge></TableCell>
                </TableRow>
                <TableRow className="border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors">
                  <TableCell className="font-medium text-[var(--text)]">Severe Drought Shock (Domestic)</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-[#EF4146]">₹{stressData?.sensitivities?.drought_alone?.domestic_landed_inr_per_quintal?.toFixed(2) ?? "6,218.64"}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-[var(--text)]">₹{stressData?.sensitivities?.drought_alone?.import_landed_inr_per_quintal?.toFixed(2) ?? "10,043.78"}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-[#10A37F] font-bold">+₹{stressData?.sensitivities?.drought_alone?.domestic_cost_advantage_inr?.toFixed(2) ?? "3,825.14"}</TableCell>
                  <TableCell className="text-right"><Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider text-[#10A37F] border-[#10A37F]/30 bg-[#10A37F]/10">DOMESTIC</Badge></TableCell>
                </TableRow>
                <TableRow className="bg-rose-950/20 font-bold hover:bg-rose-950/30 transition-colors">
                  <TableCell className="text-rose-300">Combined Compound Disaster</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-[#EF4146]">₹{stressData?.scenarios?.combined_macro_disaster?.domestic_landed_inr_per_quintal?.toFixed(2) ?? "6,280.40"}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-rose-300">₹{stressData?.scenarios?.combined_macro_disaster?.import_landed_inr_per_quintal?.toFixed(2) ?? "11,158.60"}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-[#10A37F] font-bold">+₹{stressData?.scenarios?.combined_macro_disaster?.domestic_cost_advantage_inr?.toFixed(2) ?? "4,878.20"}</TableCell>
                  <TableCell className="text-right"><Badge variant="default" className="bg-[#10A37F] text-white text-[10px] font-mono uppercase tracking-wider">DOMESTIC</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
