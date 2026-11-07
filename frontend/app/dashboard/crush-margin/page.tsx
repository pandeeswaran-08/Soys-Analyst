"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Calculator, 
  RotateCcw
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateCrushMargin } from "@/lib/api";
import { CrushCalculation } from "@/types/market";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export default function CrushMarginCalculatorPage() {
  const [beanPrice, setBeanPrice] = useState<number>(10.25);
  const [mealPrice, setMealPrice] = useState<number>(314.80);
  const [oilPrice, setOilPrice] = useState<number>(44.65);
  const [operatingCost, setOperatingCost] = useState<number>(0.75);
  const [basisBean, setBasisBean] = useState<number>(-0.15);
  const [calc, setCalc] = useState<CrushCalculation | null>(null);

  const handleCalculate = useCallback(async () => {
    try {
      const result = await calculateCrushMargin({
        soybean_price_bu: beanPrice,
        meal_price_ton: mealPrice,
        oil_price_lb_cents: oilPrice,
        operating_crush_cost_bu: operatingCost,
        basis_soybean_bu: basisBean,
      });
      setCalc(result);
    } catch (err) {
      console.error(err);
    }
  }, [beanPrice, mealPrice, oilPrice, operatingCost, basisBean]);

  useEffect(() => {
    handleCalculate();
  }, [handleCalculate]);

  const pieData = calc ? [
    { name: "Meal Revenue", value: calc.meal_revenue_dollars_per_bu, color: "#f59e0b" },
    { name: "Oil Revenue", value: calc.oil_revenue_dollars_per_bu, color: "#3b82f6" },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl glass-card border border-[var(--border)]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--text)] flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-[#10A37F]" />
            Soybean Crush Margin & GPM Calculator
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Pure Python math core: 1 bushel (60 lbs) yields 44 lbs meal (0.022 tons) + 11 lbs oil.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setBeanPrice(10.25);
            setMealPrice(314.80);
            setOilPrice(44.65);
            setOperatingCost(0.75);
            setBasisBean(-0.15);
          }}
          className="text-xs border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--bg)] text-[var(--text)] h-8"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Reset Parameters
        </Button>
      </div>

      {/* Main Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Parameter Inputs (1 Col) */}
        <Card className="lg:col-span-1 glass-card border-[var(--border)]">
          <CardHeader className="pb-3 border-b border-[var(--border)]">
            <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)]">
              Crush Model Parameters
            </CardTitle>
            <CardDescription className="text-xs text-[var(--text-muted)]">
              Adjust commercial input prices and operational costs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold block mb-1">
                Soybean Futures (ZS) ($/bushel)
              </label>
              <Input
                type="number"
                step="0.01"
                value={beanPrice}
                onChange={(e) => setBeanPrice(parseFloat(e.target.value) || 0)}
                className="bg-[var(--surface)] border-[var(--border)] text-[var(--text)] font-mono tabular-nums text-xs h-9 focus:border-[#10A37F]/30"
              />
              <span className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5 block">e.g. 10.25 = 1,025¢ / bu</span>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold block mb-1">
                Soybean Meal Futures (ZM) ($/short ton)
              </label>
              <Input
                type="number"
                step="0.5"
                value={mealPrice}
                onChange={(e) => setMealPrice(parseFloat(e.target.value) || 0)}
                className="bg-[var(--surface)] border-[var(--border)] text-[var(--text)] font-mono tabular-nums text-xs h-9 focus:border-[#10A37F]/30"
              />
              <span className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5 block">Standard 2,000 lbs short ton</span>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold block mb-1">
                Soybean Oil Futures (ZL) (cents/lb)
              </label>
              <Input
                type="number"
                step="0.1"
                value={oilPrice}
                onChange={(e) => setOilPrice(parseFloat(e.target.value) || 0)}
                className="bg-[var(--surface)] border-[var(--border)] text-[var(--text)] font-mono tabular-nums text-xs h-9 focus:border-[#10A37F]/30"
              />
              <span className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5 block">Quoted in cents per pound</span>
            </div>

            <div className="pt-2 border-t border-[var(--border)]">
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold block mb-1">
                Plant Operating Cost ($/bushel)
              </label>
              <Input
                type="number"
                step="0.05"
                value={operatingCost}
                onChange={(e) => setOperatingCost(parseFloat(e.target.value) || 0)}
                className="bg-[var(--surface)] border-[var(--border)] text-[var(--text)] font-mono tabular-nums text-xs h-9 focus:border-[#10A37F]/30"
              />
              <span className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5 block">Energy, labor, maintenance ($0.60 - $0.85/bu)</span>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold block mb-1">
                Local Soybean Basis ($/bushel)
              </label>
              <Input
                type="number"
                step="0.01"
                value={basisBean}
                onChange={(e) => setBasisBean(parseFloat(e.target.value) || 0)}
                className="bg-[var(--surface)] border-[var(--border)] text-[var(--text)] font-mono tabular-nums text-xs h-9 focus:border-[#10A37F]/30"
              />
              <span className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5 block">Negative = discount (e.g. -0.15 = 15 under)</span>
            </div>
          </CardContent>
        </Card>

        {/* Right Col: Mathematical Outputs (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="glass-card bg-emerald-950/20 border-[#10A37F]/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-[#10A37F] text-[10px] uppercase tracking-wider font-semibold font-mono">
                  Board Crush Spread
                </CardDescription>
                <CardTitle className="text-2xl font-bold font-mono tabular-nums text-[var(--text)]">
                  {calc ? `${calc.board_crush_cents_per_bu.toFixed(2)}¢` : "..."}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs font-mono tabular-nums text-[var(--text-muted)]">
                  ${calc ? calc.board_crush_dollars_per_bu.toFixed(4) : "0.00"} / bushel
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-[var(--border)]">
              <CardHeader className="pb-2">
                <CardDescription className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider font-semibold font-mono">
                  Cash Gross Margin (GPM)
                </CardDescription>
                <CardTitle className="text-2xl font-bold font-mono tabular-nums text-[var(--text)]">
                  ${calc ? calc.cash_gpm_dollars_per_bu.toFixed(4) : "..."}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs font-mono tabular-nums text-[var(--text-muted)]">
                  Includes {(basisBean * 100 > 0 ? "+" : "") + (basisBean * 100).toFixed(0)}¢ local basis
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card bg-sky-950/20 border-sky-500/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-[#10A37F] text-[10px] uppercase tracking-wider font-semibold font-mono">
                  Net Processing Margin (NPM)
                </CardDescription>
                <CardTitle className="text-2xl font-bold font-mono tabular-nums text-[#10A37F]">
                  ${calc ? calc.net_processing_margin_dollars_per_bu.toFixed(4) : "..."}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs font-mono tabular-nums text-[var(--text-muted)]">
                  GPM less ${operatingCost.toFixed(2)} op cost
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Breakdown & Yield Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card border-[var(--border)]">
              <CardHeader className="pb-2 border-b border-[var(--border)]">
                <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)]">
                  Revenue Contribution Split
                </CardTitle>
                <CardDescription className="text-xs text-[var(--text-muted)]">
                  Gross product value per 60 lb bushel
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center pt-4">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#090d16",
                          borderColor: "#1e293b",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontFamily: "monospace"
                        }}
                        formatter={(val) => [`$${Number(val).toFixed(2)} / bu`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-6 text-xs mt-2 font-mono tabular-nums">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                    <span className="text-[var(--text)]">Meal: {calc ? calc.meal_share_percent.toFixed(1) : "0"}% (${calc ? calc.meal_revenue_dollars_per_bu.toFixed(2) : "0"})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#10A37F]" />
                    <span className="text-[var(--text)]">Oil: {calc ? calc.oil_share_percent.toFixed(1) : "0"}% (${calc ? calc.oil_revenue_dollars_per_bu.toFixed(2) : "0"})</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Greeks / Sensitivities */}
            <Card className="glass-card border-[var(--border)]">
              <CardHeader className="pb-2 border-b border-[var(--border)]">
                <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)]">
                  Margin Sensitivity (Greeks)
                </CardTitle>
                <CardDescription className="text-xs text-[var(--text-muted)]">
                  Partial derivatives per unit shift in input prices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex justify-between items-center text-xs">
                  <span className="text-[var(--text-muted)] font-medium">d(GPM) / d(Bean $/bu)</span>
                  <span className="font-mono tabular-nums text-[#EF4146] font-bold">- $1.00 / bu</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex justify-between items-center text-xs">
                  <span className="text-[var(--text-muted)] font-medium">d(GPM) / d(Meal $/ton)</span>
                  <span className="font-mono tabular-nums text-[#10A37F] font-bold">+ $0.0220 / bu</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex justify-between items-center text-xs">
                  <span className="text-[var(--text-muted)] font-medium">d(GPM) / d(Oil ¢/lb)</span>
                  <span className="font-mono tabular-nums text-[#10A37F] font-bold">+ $0.1100 / bu</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex justify-between items-center text-xs">
                  <span className="text-[var(--text-muted)] font-medium">Total Product Value</span>
                  <span className="font-mono tabular-nums text-[var(--text)] font-bold">${calc ? calc.product_value_dollars_per_bu.toFixed(4) : "0.00"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
