"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Ship, Train, Truck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BasisTable } from "@/components/dashboard/basis-table";
import { fetchMarketOverview } from "@/lib/api";
import { BasisQuote } from "@/types/market";

export default function BasisArbitragePage() {
  const [bids, setBids] = useState<BasisQuote[]>([]);

  useEffect(() => {
    async function load() {
      const data = await fetchMarketOverview();
      setBids(data.basis_bids);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="p-5 rounded-xl glass-card border border-[var(--border)]">
        <h2 className="text-xl font-bold tracking-tight text-[var(--text)] flex items-center gap-2.5">
          <MapPin className="w-5 h-5 text-[#10A37F]" />
          Regional Cash Basis & Spatial Arbitrage Engine
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Compare local processor bids against export netbacks (CIF NOLA & PNW) incorporating freight tariffs.
        </p>
      </div>

      {/* Spatial Netback Arbitrage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card bg-emerald-950/20 border-[#10A37F]/30">
          <CardHeader className="pb-2 border-b border-emerald-500/20">
            <div className="flex items-center justify-between">
              <Badge variant="default" className="text-[10px] font-mono uppercase tracking-wider">Primary Domestic Processor</Badge>
              <Truck className="w-4 h-4 text-[#10A37F]" />
            </div>
            <CardTitle className="text-base font-semibold tracking-tight text-[var(--text)] mt-2">
              Decatur, IL Crush Plant
            </CardTitle>
            <CardDescription className="text-xs text-[var(--text-muted)]">
              Direct delivery to local processing facility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-4 text-xs">
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span className="text-[var(--text-muted)] font-medium">Cash Basis Bid:</span>
              <span className="font-mono tabular-nums font-bold text-[#10A37F]">+12.0¢ over Jan</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span className="text-[var(--text-muted)] font-medium">Local Trucking:</span>
              <span className="font-mono tabular-nums text-[var(--text)]">8.0¢ / bu</span>
            </div>
            <div className="flex justify-between py-1 pt-2 font-semibold">
              <span className="text-[var(--text)]">Net Farm Gate Return:</span>
              <span className="font-mono tabular-nums text-[#10A37F] text-sm">$10.28½ / bu</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card bg-sky-950/20 border-sky-500/30">
          <CardHeader className="pb-2 border-b border-sky-500/20">
            <div className="flex items-center justify-between">
              <Badge variant="blue" className="text-[10px] font-mono uppercase tracking-wider">Export Channel (Gulf)</Badge>
              <Ship className="w-4 h-4 text-[#10A37F]" />
            </div>
            <CardTitle className="text-base font-semibold tracking-tight text-[var(--text)] mt-2">
              CIF Gulf NOLA Barge
            </CardTitle>
            <CardDescription className="text-xs text-[var(--text-muted)]">
              Barge delivery down the Illinois & Mississippi rivers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-4 text-xs">
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span className="text-[var(--text-muted)] font-medium">Port CIF Bid:</span>
              <span className="font-mono tabular-nums font-bold text-[#10A37F]">+68.0¢ over Jan</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span className="text-[var(--text-muted)] font-medium">Barge Freight (380% tariff):</span>
              <span className="font-mono tabular-nums text-[#EF4146]">-42.0¢ / bu</span>
            </div>
            <div className="flex justify-between py-1 pt-2 font-semibold">
              <span className="text-[var(--text)]">Net Origin Elevator:</span>
              <span className="font-mono tabular-nums text-[#10A37F] text-sm">$10.40 / bu</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card bg-amber-950/20 border-[#F5A623]/30">
          <CardHeader className="pb-2 border-b border-amber-500/20">
            <div className="flex items-center justify-between">
              <Badge variant="amber" className="text-[10px] font-mono uppercase tracking-wider">Export Channel (Pacific)</Badge>
              <Train className="w-4 h-4 text-[#F5A623]" />
            </div>
            <CardTitle className="text-base font-semibold tracking-tight text-[var(--text)] mt-2">
              Pacific Northwest (PNW) Shuttle
            </CardTitle>
            <CardDescription className="text-xs text-[var(--text-muted)]">
              110-car rail unit shuttle to Asian export terminals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-4 text-xs">
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span className="text-[var(--text-muted)] font-medium">PNW CIF Bid:</span>
              <span className="font-mono tabular-nums font-bold text-[#F5A623]">+125.0¢ over Jan</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--border)]">
              <span className="text-[var(--text-muted)] font-medium">BNSF/UP Rail Tariff:</span>
              <span className="font-mono tabular-nums text-[#EF4146]">-95.0¢ / bu</span>
            </div>
            <div className="flex justify-between py-1 pt-2 font-semibold">
              <span className="text-[var(--text)]">Net Origin Elevator:</span>
              <span className="font-mono tabular-nums text-[#F5A623] text-sm">$10.44½ / bu</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Basis Table */}
      <Card className="glass-card border-[var(--border)]">
        <CardHeader className="pb-3 border-b border-[var(--border)]">
          <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)]">
            Regional Grain Elevator & Processor Bids
          </CardTitle>
          <CardDescription className="text-xs text-[var(--text-muted)]">
            Live cash bids relative to CBOT front-month futures (cents over/under)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <BasisTable bids={bids} />
        </CardContent>
      </Card>
    </div>
  );
}

