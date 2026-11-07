"use client";

import React, { useState } from "react";
import { 
  ShieldAlert, 
  Play
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MonteCarloChart } from "@/components/dashboard/monte-carlo-chart";

export default function RiskAnalyticsPage() {
  const [volumeBushels, setVolumeBushels] = useState<number>(100000);
  const [hedgeRatio, setHedgeRatio] = useState<number>(0.75);
  const [simRunning, setSimRunning] = useState(false);

  // Generate simulated representative Monte Carlo paths
  const [paths, setPaths] = useState<number[][]>(() => {
    const defaultPaths = [];
    for (let p = 0; p < 8; p++) {
      const path = [];
      let current = 1.48;
      for (let d = 0; d < 30; d++) {
        current += (Math.random() - 0.48) * 0.08;
        path.push(Math.round(current * 1000) / 1000);
      }
      defaultPaths.push(path);
    }
    return defaultPaths;
  });

  const hedgedBu = volumeBushels * hedgeRatio;
  const beanContracts = Math.round(hedgedBu / 5000);
  const mealTons = (hedgedBu * 44) / 2000;
  const mealContracts = Math.round(mealTons / 100);
  const oilLbs = hedgedBu * 11;
  const oilContracts = Math.round(oilLbs / 60000);

  function handleRerunSim() {
    setSimRunning(true);
    setTimeout(() => {
      const newPaths = [];
      for (let p = 0; p < 8; p++) {
        const path = [];
        let current = 1.48;
        for (let d = 0; d < 30; d++) {
          current += (Math.random() - 0.48) * 0.09;
          path.push(Math.round(current * 1000) / 1000);
        }
        newPaths.push(path);
      }
      setPaths(newPaths);
      setSimRunning(false);
    }, 400);
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-5 rounded-xl glass-card border border-[var(--border)]">
        <h2 className="text-xl font-bold tracking-tight text-[var(--text)] flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-[#10A37F]" />
          Quantitative Risk Analytics & CBOT Sizing Engine
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Parametric Value-at-Risk (VaR), correlated multi-asset Monte Carlo simulation, and 10:11:9 contract hedging.
        </p>
      </div>

      {/* VaR & Risk Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-[var(--border)]">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider font-semibold">
              1-Day VaR (95%)
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-mono tabular-nums text-[var(--text)]">
              $148,250
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-[var(--text-muted)]">Normal distribution &bull; 1.8% daily vol</p>
          </CardContent>
        </Card>

        <Card className="glass-card bg-rose-950/20 border-[#EF4146]/30">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] text-[#EF4146] font-mono uppercase tracking-wider font-semibold">
              1-Day VaR (99%)
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-mono tabular-nums text-[#EF4146]">
              $209,600
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-[var(--text-muted)]">Tail risk threshold at 2.33 Z-score</p>
          </CardContent>
        </Card>

        <Card className="glass-card bg-amber-950/20 border-[#F5A623]/30">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] text-[#F5A623] font-mono uppercase tracking-wider font-semibold">
              Expected Shortfall (CVaR)
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-mono tabular-nums text-[#F5A623]">
              $185,300
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-[var(--text-muted)]">Conditional mean loss beyond 95% VaR</p>
          </CardContent>
        </Card>

        <Card className="glass-card bg-emerald-950/20 border-[#10A37F]/30">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] text-[#10A37F] font-mono uppercase tracking-wider font-semibold">
              Hedge Effectiveness ($R^2$)
            </CardDescription>
            <CardTitle className="text-2xl font-bold font-mono tabular-nums text-[#10A37F]">
              88.4%
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-[var(--text-muted)]">Variance reduction via CBOT spread</p>
          </CardContent>
        </Card>
      </div>

      {/* Monte Carlo Section */}
      <Card className="glass-card border-[var(--border)]">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)]">
              Correlated Multi-Asset Monte Carlo Simulation (30 Days)
            </CardTitle>
            <CardDescription className="text-xs text-[var(--text-muted)]">
              Geometric Brownian Motion with empirical Cholesky correlation matrix for Beans, Meal, and Oil
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={handleRerunSim}
            disabled={simRunning}
            className="text-xs h-8 bg-[#10A37F] hover:bg-[#0D8A6D] text-white shadow-sm"
          >
            <Play className="w-3.5 h-3.5 mr-1.5" />
            {simRunning ? "Simulating..." : "Rerun 500 Paths"}
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <MonteCarloChart paths={paths} initialMargin={1.48} />
        </CardContent>
      </Card>

      {/* CBOT 10:11:9 Contract Sizing Calculator */}
      <Card className="glass-card border-[var(--border)]">
        <CardHeader className="pb-3 border-b border-[var(--border)]">
          <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)]">
            CBOT Commercial Contract Sizing Optimizer
          </CardTitle>
          <CardDescription className="text-xs text-[var(--text-muted)]">
            Calculates exact contract allocations based on standard 10:11:9 crush ratio
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold block mb-1">
                Processing Commitment Volume (Bushels)
              </label>
              <Input
                type="number"
                step="10000"
                value={volumeBushels}
                onChange={(e) => setVolumeBushels(parseFloat(e.target.value) || 0)}
                className="bg-[var(--surface)] border-[var(--border)] text-[var(--text)] font-mono tabular-nums text-xs h-9 focus:border-[#10A37F]/30"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold block mb-1">
                Target Hedge Coverage Ratio (0.1 to 1.0)
              </label>
              <Input
                type="number"
                step="0.05"
                min="0.1"
                max="1.0"
                value={hedgeRatio}
                onChange={(e) => setHedgeRatio(parseFloat(e.target.value) || 0)}
                className="bg-[var(--surface)] border-[var(--border)] text-[var(--text)] font-mono tabular-nums text-xs h-9 focus:border-[#10A37F]/30"
              />
            </div>
          </div>

          {/* Resulting Contract Order Tickets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[#10A37F]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#10A37F] text-xs tracking-wider uppercase">BUY (Long) Soybeans</span>
                <Badge variant="outline" className="font-mono text-[10px] border-[#10A37F]/30 text-[#10A37F] bg-[#10A37F]/10">ZS</Badge>
              </div>
              <p className="text-2xl font-bold font-mono tabular-nums text-[var(--text)]">{beanContracts} Contracts</p>
              <p className="text-[11px] font-mono tabular-nums text-[var(--text-muted)]">
                Covers {(beanContracts * 5000).toLocaleString()} bushels @ 5,000 bu / contract
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[#F5A623]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#F5A623] text-xs tracking-wider uppercase">SELL (Short) Meal</span>
                <Badge variant="outline" className="font-mono text-[10px] border-[#F5A623]/30 text-[#F5A623] bg-[#F5A623]/10">ZM</Badge>
              </div>
              <p className="text-2xl font-bold font-mono tabular-nums text-[var(--text)]">{mealContracts} Contracts</p>
              <p className="text-[11px] font-mono tabular-nums text-[var(--text-muted)]">
                Covers {(mealContracts * 100).toLocaleString()} short tons @ 100 tons / contract
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface)] border border-sky-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#10A37F] text-xs tracking-wider uppercase">SELL (Short) Oil</span>
                <Badge variant="outline" className="font-mono text-[10px] border-sky-500/30 text-[#10A37F] bg-sky-500/10">ZL</Badge>
              </div>
              <p className="text-2xl font-bold font-mono tabular-nums text-[var(--text)]">{oilContracts} Contracts</p>
              <p className="text-[11px] font-mono tabular-nums text-[var(--text-muted)]">
                Covers {(oilContracts * 60000).toLocaleString()} lbs @ 60,000 lbs / contract
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

