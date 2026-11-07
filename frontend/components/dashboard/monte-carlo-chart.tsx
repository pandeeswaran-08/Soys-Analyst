"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface Props {
  paths: number[][];
  initialMargin: number;
}

export function MonteCarloChart({ paths, initialMargin }: Props) {
  if (!paths || paths.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-[var(--text-muted)]">
        Run simulation to generate Monte Carlo crush paths...
      </div>
    );
  }

  // Format paths into Recharts rows: [{ day: 1, path0: 1.5, path1: 1.4... }]
  const days = paths[0].length;
  const chartData = [];
  for (let d = 0; d < days; d++) {
    const row: Record<string, number> = { day: d + 1 };
    paths.forEach((p, idx) => {
      row[`path_${idx}`] = p[d];
    });
    chartData.push(row);
  }

  // Colors for lines
  const colors = [
    "#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6",
    "#06b6d4", "#14b8a6", "#6366f1", "#eab308", "#f97316"
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.6} />
          <XAxis
            dataKey="day"
            stroke="var(--text-muted)"
            tick={{ fontSize: 11 }}
            tickLine={false}
            tickFormatter={(val) => `Day ${val}`}
          />
          <YAxis
            stroke="var(--text-muted)"
            tick={{ fontSize: 11 }}
            tickLine={false}
            domain={["auto", "auto"]}
            tickFormatter={(val) => `$${val.toFixed(2)}`}
          />
          <ReferenceLine
            y={0.75}
            stroke="#EF4146"
            strokeDasharray="4 4"
            label={{ value: "Op Cost ($0.75)", fill: "#EF4146", fontSize: 10, position: "top" }}
          />
          <ReferenceLine
            y={initialMargin}
            stroke="#10A37F"
            strokeDasharray="2 2"
            label={{ value: `Entry ($${initialMargin.toFixed(2)})`, fill: "#10A37F", fontSize: 10, position: "insideBottomRight" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
              fontFamily: "monospace",
              color: "var(--text)",
            }}
            itemStyle={{ color: "var(--text)" }}
            formatter={(value) => [`$${Number(value).toFixed(3)} / bu`, "Margin Path"]}
          />
          {paths.slice(0, 10).map((_, idx) => (
            <Line
              key={idx}
              type="monotone"
              dataKey={`path_${idx}`}
              stroke={colors[idx % colors.length]}
              strokeWidth={1.2}
              dot={false}
              opacity={0.7}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

