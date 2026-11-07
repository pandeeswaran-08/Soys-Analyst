"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BasisQuote } from "@/types/market";

interface Props {
  bids: BasisQuote[];
}

export function BasisTable({ bids }: Props) {
  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[var(--border)] bg-[var(--surface)] hover:bg-transparent">
            <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Location / Terminal</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Channel Type</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Delivery Period</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] text-right">Cash Basis</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] text-right">Est. Freight</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids.map((bid, idx) => {
            const isOver = bid.basis_cents > 0;
            return (
              <TableRow key={idx} className="border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors text-xs">
                <TableCell className="font-medium text-[var(--text)]">
                  {bid.location_name}
                </TableCell>
                <TableCell className="text-[var(--text-muted)]">
                  {bid.location_type}
                </TableCell>
                <TableCell className="text-[var(--text)] font-mono">
                  {bid.delivery_period}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums font-semibold">
                  <span className={isOver ? "text-[#10A37F]" : "text-[#F5A623]"}>
                    {bid.basis_cents > 0 ? `+${bid.basis_cents.toFixed(1)}¢` : `${bid.basis_cents.toFixed(1)}¢`}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] ml-1">
                    {isOver ? "over" : "under"}
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums text-[var(--text-muted)]">
                  {bid.freight_rate_cents > 0 ? `${bid.freight_rate_cents.toFixed(1)}¢ / bu` : "Direct Origin"}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={isOver ? "default" : "secondary"} className="text-[10px] font-mono uppercase tracking-wider">
                    {isOver ? "Firm Demand" : "Seasonal Carry"}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

