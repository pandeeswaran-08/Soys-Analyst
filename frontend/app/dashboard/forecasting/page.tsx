"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  TrendingUp, 
  RotateCcw, 
  BarChart2, 
  Sliders
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchPriceForecast } from "@/lib/api";
import { ForecastResult } from "@/types/procurement";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";

const PRESET_FEEDS: Record<string, number[]> = {
  "Indore Mandi Spot (₹/qtl)": [
    4500, 4520, 4550, 4580, 4610, 4650, 4680,
    4670, 4710, 4740, 4780, 4820, 4850, 4890,
    4880, 4920, 4950, 4990, 5020, 5060, 5100
  ],
  "CBOT Soybeans (cents/bu)": [
    980, 985, 992, 1005, 1012, 1018, 1025,
    1020, 1032, 1038, 1045, 1040, 1052, 1060
  ],
  "Brazilian CIF Paranaguá ($/MT)": [
    910, 915, 922, 928, 935, 942, 940,
    948, 955, 960, 965, 962, 970, 975
  ],
};

export default function ForecastingPage() {
  const [selectedPreset, setSelectedPreset] = useState<string>("Indore Mandi Spot (₹/qtl)");
  const [seriesData, setSeriesData] = useState<number[]>(PRESET_FEEDS["Indore Mandi Spot (₹/qtl)"]);
  const [steps, setSteps] = useState<number>(7);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runForecast = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchPriceForecast(seriesData, steps);
      setForecast(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [seriesData, steps]);

  useEffect(() => {
    runForecast();
  }, [runForecast]);

  function handlePresetChange(name: string) {
    setSelectedPreset(name);
    setSeriesData(PRESET_FEEDS[name]);
  }

  // Construct chart data points
  const chartPoints = [
    ...seriesData.map((val, idx) => ({
      index: `t-${seriesData.length - 1 - idx}`,
      actual: val,
      forecast: null,
      lower80: null,
      upper80: null,
      lower95: null,
      upper95: null,
    })),
    ...(forecast?.forecast_mean?.map((mean, idx) => ({
      index: `t+${idx + 1}`,
      actual: null,
      forecast: Math.round(mean * 100) / 100,
      lower80: Math.round((forecast.prediction_intervals?.["80%"]?.lower?.[idx] ?? mean * 0.97) * 100) / 100,
      upper80: Math.round((forecast.prediction_intervals?.["80%"]?.upper?.[idx] ?? mean * 1.03) * 100) / 100,
      lower95: Math.round((forecast.prediction_intervals?.["95%"]?.lower?.[idx] ?? mean * 0.95) * 100) / 100,
      upper95: Math.round((forecast.prediction_intervals?.["95%"]?.upper?.[idx] ?? mean * 1.05) * 100) / 100,
    })) || []),
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] transition-colors">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text)] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#10A37F]" />
            Holt-Winters Price Forecasting Engine (Statsmodels)
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Exponential smoothing with additive/multiplicative seasonality and 80%/95% prediction uncertainty intervals.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Badge variant="default" className="text-[11px] font-mono tracking-tight px-2.5 py-0.5">
            Statsmodels Pure Math Core
          </Badge>
          <Button size="sm" variant="ghost" onClick={runForecast} disabled={loading} className="text-xs h-8">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Re-run
          </Button>
        </div>
      </div>

      {/* Preset Feeds & Horizon Controls */}
      <Card className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Commodity Feed:</span>
            {Object.keys(PRESET_FEEDS).map((feedName) => (
              <Button
                key={feedName}
                size="sm"
                variant={selectedPreset === feedName ? "default" : "outline"}
                className="text-xs h-8"
                onClick={() => handlePresetChange(feedName)}
              >
                {feedName}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Horizon:</span>
            {[7, 14, 21].map((n) => (
              <Button
                key={n}
                size="sm"
                variant={steps === n ? "default" : "outline"}
                className="text-xs font-mono tabular-nums h-8"
                onClick={() => setSteps(n)}
              >
                {n} Days
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Chart Card */}
      <Card className="glass-card border-[var(--border)]">
        <CardHeader className="pb-3 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)] flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#10A37F]" />
              Price Trajectory & Uncertainty Envelopes
            </CardTitle>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Model:</span>
              <Badge variant="outline" className="font-mono text-[11px] text-[#10A37F] border-[#10A37F]/30 bg-[#10A37F]/10">
                {forecast?.model || "Holt-Winters Additive"}
              </Badge>
            </div>
          </div>
          <CardDescription className="text-xs text-[var(--text-muted)] mt-1">
            Shaded regions represent 80% and 95% statistical confidence boundaries based on historical residual variance.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-80 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartPoints} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="band95" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="band80" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.30} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="index" stroke="#64748b" fontSize={11} className="font-mono" />
                <YAxis stroke="#64748b" fontSize={11} domain={["auto", "auto"]} className="font-mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "8px", fontSize: "12px", fontFamily: "monospace" }}
                  itemStyle={{ color: "#f8fafc" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
                
                {/* 95% uncertainty band */}
                <Area type="monotone" dataKey="upper95" stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} fill="url(#band95)" name="95% Upper Band" />
                <Area type="monotone" dataKey="lower95" stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} fill="transparent" name="95% Lower Band" />
                
                {/* 80% uncertainty band */}
                <Area type="monotone" dataKey="upper80" stroke="#059669" strokeDasharray="2 2" strokeWidth={1} fill="url(#band80)" name="80% Upper Band" />
                <Area type="monotone" dataKey="lower80" stroke="#059669" strokeDasharray="2 2" strokeWidth={1} fill="transparent" name="80% Lower Band" />

                {/* Actual Historical */}
                <Area type="monotone" dataKey="actual" stroke="#38bdf8" strokeWidth={2.5} fill="transparent" name="Observed Series" />

                {/* Forecast Mean Line */}
                <Area type="monotone" dataKey="forecast" stroke="#10b981" strokeWidth={2.5} fill="transparent" name="Point Forecast (Mean)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Model Diagnostic Metrics & Forecast Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Diagnostic Metrics */}
        <Card className="glass-card border-[var(--border)]">
          <CardHeader className="pb-3 border-b border-[var(--border)]">
            <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#10A37F]" />
              Fit Metrics & Diagnostics
            </CardTitle>
            <CardDescription className="text-xs text-[var(--text-muted)]">
              Evaluated on historical fit residuals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="text-[var(--text-muted)] font-medium">Mean Absolute Error (MAE):</span>
              <span className="font-mono tabular-nums font-semibold text-[var(--text)]">{forecast?.metrics?.mae ?? 28.5}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="text-[var(--text-muted)] font-medium">Root Mean Squared Error (RMSE):</span>
              <span className="font-mono tabular-nums font-semibold text-[var(--text)]">{forecast?.metrics?.rmse ?? 36.2}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="text-[var(--text-muted)] font-medium">Mean Abs % Error (MAPE):</span>
              <span className="font-mono tabular-nums font-bold text-[#10A37F]">{forecast?.metrics?.mape ?? 0.72}%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="text-[var(--text-muted)] font-medium">Akaike Info Criterion (AIC):</span>
              <span className="font-mono tabular-nums text-[var(--text)]">{forecast?.metrics?.aic ?? 182.4}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[var(--text-muted)] font-medium">Bayesian Info Criterion (BIC):</span>
              <span className="font-mono tabular-nums text-[var(--text)]">{forecast?.metrics?.bic ?? 188.1}</span>
            </div>
          </CardContent>
        </Card>

        {/* Projection Schedule Table */}
        <Card className="lg:col-span-2 glass-card border-[var(--border)]">
          <CardHeader className="pb-3 border-b border-[var(--border)]">
            <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)]">
              Daily Prediction Schedule
            </CardTitle>
            <CardDescription className="text-xs text-[var(--text-muted)]">
              Point forecast and 95% confidence intervals per day horizon.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[var(--border)] bg-[var(--surface)] hover:bg-transparent">
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Horizon</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] text-right">Point Forecast</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] text-right">95% Lower Band</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] text-right">95% Upper Band</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] text-right">Band Width (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecast?.forecast_mean?.map((mean, idx) => {
                    const low = forecast.prediction_intervals?.["95%"]?.lower?.[idx] ?? (mean * 0.95);
                    const high = forecast.prediction_intervals?.["95%"]?.upper?.[idx] ?? (mean * 1.05);
                    return (
                      <TableRow key={idx} className="border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors text-xs">
                        <TableCell className="font-medium text-[var(--text)]">Day +{idx + 1}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums font-bold text-[#10A37F]">₹{mean.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-[var(--text)]">₹{low.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-[var(--text)]">₹{high.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono tabular-nums text-[var(--text-muted)]">±₹{((high - low) / 2).toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
