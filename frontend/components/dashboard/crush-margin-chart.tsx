"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { HistoricalPoint } from "@/types/market";

interface Props {
  data: HistoricalPoint[];
}

export function CrushMarginChart({ data }: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-[var(--text-muted)]">
        Loading historical crush margin time series...
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="crushGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10A37F" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10A37F" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="beanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6E6E80" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6E6E80" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.6} />
          <XAxis
            dataKey="date"
            stroke="var(--text-muted)"
            tick={{ fontSize: 11 }}
            tickLine={false}
            tickFormatter={(val) => val.slice(5)}
          />
          <YAxis
            yAxisId="crush"
            orientation="left"
            stroke="#10A37F"
            tick={{ fontSize: 11 }}
            tickLine={false}
            domain={["auto", "auto"]}
            tickFormatter={(val) => `$${val.toFixed(2)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--text)",
            }}
            itemStyle={{ color: "var(--text)" }}
            formatter={(value, name) => {
              if (name === "board_crush_dollars") return [`$${Number(value).toFixed(2)} / bu`, "Crush Margin"];
              if (name === "soybean_price") return [`$${(Number(value) / 100).toFixed(2)} / bu`, "Soybean Futures"];
              return [String(value), String(name)];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
            formatter={(value) => (value === "board_crush_dollars" ? "Crush Margin ($/bu)" : "Soybeans (ZS)")}
          />
          <Area
            yAxisId="crush"
            type="monotone"
            dataKey="board_crush_dollars"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#crushGradient)"
            name="board_crush_dollars"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

