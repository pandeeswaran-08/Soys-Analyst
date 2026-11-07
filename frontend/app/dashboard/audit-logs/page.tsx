"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Clock, 
  ShieldCheck, 
  Eye,
  RefreshCw,
  Trash2,
  Lock
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AuditLogEntry } from "@/types/procurement";
import { fetchAuditLogs, purgeAuditLogs } from "@/lib/api";
import { useRBAC } from "@/lib/rbac";

const SAMPLE_LOGS: AuditLogEntry[] = [
  {
    id: "aud-001",
    timestamp: "2026-11-06 12:40:58",
    module: "NumericalSafetyGuard",
    action: "VERIFY_NUMERIC_GROUNDING",
    inputs: { total_numbers_checked: 53, certified_pool_size: 53 },
    output_summary: "PASSED: 100% of numerical values certified against math_core outputs.",
    latency_ms: 1.4,
    cached: false,
    safety_guard_status: "PASSED",
  },
  {
    id: "aud-002",
    timestamp: "2026-11-06 12:40:57",
    module: "TimingSignal",
    action: "generate_timing_signal",
    inputs: { current_price: 5238.64, budget: 5200.0, current_stock_days: 7.2 },
    output_summary: "Signal: BUY_AGGRESSIVE | Action: PROCURE_FULL_ALLOCATION | Urgency: HIGH",
    latency_ms: 3.2,
    cached: true,
    safety_guard_status: "PASSED",
  },
  {
    id: "aud-003",
    timestamp: "2026-11-06 12:40:57",
    module: "Inventory",
    action: "evaluate_inventory_position",
    inputs: { current_stock: 360.0, rop: 393.52, safety_stock: 43.52 },
    output_summary: "Status: REORDER_NOW | Estimated runway: 7.2 days of supply",
    latency_ms: 2.1,
    cached: true,
    safety_guard_status: "PASSED",
  },
  {
    id: "aud-004",
    timestamp: "2026-11-06 12:40:56",
    module: "Forecasting",
    action: "holt_winters_forecast",
    inputs: { series_len: 21, steps: 7, trend: "add", seasonal: "add" },
    output_summary: "Projection: t+1 = ₹5,130.00, t+7 = ₹5,210.00 | MAPE: 0.72%",
    latency_ms: 18.5,
    cached: true,
    safety_guard_status: "PASSED",
  },
  {
    id: "aud-005",
    timestamp: "2026-11-06 12:40:55",
    module: "LandedCost",
    action: "calculate_international_landed_cost",
    inputs: { fob_usd: 960.0, ocean_freight: 52.0, fx: 85.50, bcd: 0.05 },
    output_summary: "CIF Parity: ₹10,043.78/qtl (₹100,437.77/MT) with customs & CHA",
    latency_ms: 4.8,
    cached: true,
    safety_guard_status: "PASSED",
  },
  {
    id: "aud-006",
    timestamp: "2026-11-06 12:40:55",
    module: "LandedCost",
    action: "calculate_domestic_landed_cost",
    inputs: { base_price: 4900.0, freight: 180.0, mandi_tax: 0.015, gst: 0.05 },
    output_summary: "Total Delivered: ₹5,238.64/qtl (Material 93.5%, Logistics 4.8%)",
    latency_ms: 2.9,
    cached: true,
    safety_guard_status: "PASSED",
  },
  {
    id: "aud-007",
    timestamp: "2026-11-06 12:35:10",
    module: "ScenarioStressTest",
    action: "stress_test_procurement_scenarios",
    inputs: { fx_stress: 5.0, freight_shock: 25.0, weather: "SEVERE_DROUGHT" },
    output_summary: "Combined disaster: Import reaches ₹11,158.60/qtl (+11.1%), Domestic ₹6,280.40/qtl",
    latency_ms: 12.3,
    cached: false,
    safety_guard_status: "PASSED",
  },
];

export default function AuditLogsPage() {
  const { canPurgeAuditLogs } = useRBAC();
  const [logs, setLogs] = useState<AuditLogEntry[]>(SAMPLE_LOGS);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedModule, setSelectedModule] = useState<string>("ALL");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [activeLog, setActiveLog] = useState<AuditLogEntry | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs();
      if (data && data.length > 0) {
        setLogs(data);
      }
    } catch (e) {
      console.warn("Could not load remote audit logs:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handlePurge = async () => {
    if (!canPurgeAuditLogs) {
      alert("Only users with Admin role can purge the mathematical audit trail.");
      return;
    }
    if (confirm("Are you sure you want to purge all audit logs? This action is immutable.")) {
      try {
        await purgeAuditLogs();
        setLogs([]);
        alert("Audit trail purged successfully by Administrator.");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to purge audit logs";
        alert(msg);
      }
    }
  };

  const modules = ["ALL", "NumericalSafetyGuard", "LandedCost", "Forecasting", "Inventory", "TimingSignal", "ScenarioStressTest"];

  const filteredLogs = logs.filter((log) => {
    const matchesModule = selectedModule === "ALL" || log.module === selectedModule;
    const matchesSearch = log.action.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          log.output_summary.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          log.id.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesModule && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] transition-colors">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text)] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#10A37F]" />
            Mathematical Audit Trail & NumericalSafetyGuard Logs
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Immutable log of all deterministic formula executions, Redis cache hits/misses, and safety verification gates.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Badge variant="default" className="text-[11px] font-mono tracking-tight px-2.5 py-0.5">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 inline" />
            100% Certified Grounding
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={loadLogs}
            disabled={loading}
            className="text-xs h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handlePurge}
            disabled={!canPurgeAuditLogs}
            className={`text-xs h-8 ${
              canPurgeAuditLogs
                ? "border-[#EF4146]/30 text-[#EF4146] hover:bg-[#EF4146]/10"
                : "border-[var(--border)] text-[var(--text-muted)] opacity-50 cursor-not-allowed"
            }`}
          >
            {canPurgeAuditLogs ? (
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            ) : (
              <Lock className="w-3.5 h-3.5 mr-1.5" />
            )}
            Purge Trail (Admin)
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="glass-card border-[var(--border)] p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Module:</span>
            {modules.map((m) => (
              <Button
                key={m}
                size="sm"
                variant={selectedModule === m ? "default" : "outline"}
                className={`text-xs h-8 ${selectedModule === m ? "bg-[#10A37F] hover:bg-[#0D8A6D] text-white shadow-sm" : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--bg)] text-[var(--text)]"}`}
                onClick={() => setSelectedModule(m)}
              >
                {m}
              </Button>
            ))}
          </div>
          <div className="w-full md:w-64">
            <Input 
              placeholder="Search actions or outputs..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-[var(--surface)] border-[var(--border)] text-[var(--text)] text-xs h-8 focus:border-[#10A37F]/30"
            />
          </div>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card className="glass-card border-[var(--border)]">
        <CardHeader className="pb-3 border-b border-[var(--border)]">
          <CardTitle className="text-sm font-semibold tracking-tight text-[var(--text)] flex items-center justify-between">
            <span>Execution Audit Registry</span>
            <span className="text-xs text-[var(--text-muted)] font-mono tabular-nums">{filteredLogs.length} events logged</span>
          </CardTitle>
          <CardDescription className="text-xs text-[var(--text-muted)] mt-1">
            Click on any event row to inspect full input/output serialization and mathematical proofs.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[var(--border)] bg-[var(--surface)] hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Timestamp</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Module</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Routine / Action</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Output Summary</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] text-center">Latency</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] text-center">Cache</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] text-center">Safety Guard</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] text-right">Inspect</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {filteredLogs.map((log) => (
                  <TableRow 
                    key={log.id} 
                    onClick={() => setActiveLog(log)}
                    className="border-b border-[var(--border)] hover:bg-[var(--bg)] cursor-pointer transition-colors"
                  >
                    <TableCell className="font-mono tabular-nums text-[var(--text-muted)] text-[11px] whitespace-nowrap">{log.timestamp}</TableCell>
                    <TableCell className="font-medium text-[var(--text)]">{log.module}</TableCell>
                    <TableCell className="font-mono text-[#10A37F]">{log.action}</TableCell>
                    <TableCell className="text-[var(--text)] max-w-xs truncate">{log.output_summary}</TableCell>
                    <TableCell className="text-center font-mono tabular-nums text-[var(--text-muted)]">{log.latency_ms}ms</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`text-[10px] font-mono uppercase tracking-wider ${log.cached ? "text-[#10A37F] border-[#10A37F]/30 bg-[#10A37F]/10" : "text-[var(--text-muted)] border-[var(--border)] bg-[var(--surface)]"}`}>
                        {log.cached ? "REDIS HIT" : "COMPUTED"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-[#10A37F]/10 border border-[#10A37F]/30 text-[#10A37F] text-[10px] font-mono uppercase tracking-wider">
                        {log.safety_guard_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-[var(--text-muted)] hover:text-[#10A37F] hover:bg-[var(--bg)]">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Inspect Modal */}
      {activeLog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 max-w-xl w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <h4 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#10A37F]" />
                  Audit Event Details &bull; {activeLog.id}
                </h4>
                <p className="text-[11px] text-[var(--text-muted)] font-mono tabular-nums">{activeLog.timestamp} ({activeLog.latency_ms}ms latency)</p>
              </div>
              <Badge className="bg-[#10A37F]/10 border border-[#10A37F]/30 text-[#10A37F] font-mono text-[10px]">
                {activeLog.safety_guard_status}
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-semibold text-[var(--text-muted)] text-[10px] uppercase tracking-wider block mb-1">Routine Executed:</span>
                <p className="font-mono text-[#10A37F] font-bold">{activeLog.module} &rarr; {activeLog.action}()</p>
              </div>

              <div>
                <span className="font-semibold text-[var(--text-muted)] text-[10px] uppercase tracking-wider block mb-1">Inputs Payload:</span>
                <pre className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[11px] font-mono tabular-nums text-[var(--text)] overflow-x-auto">
                  {JSON.stringify(activeLog.inputs, null, 2)}
                </pre>
              </div>

              <div>
                <span className="font-semibold text-[var(--text-muted)] text-[10px] uppercase tracking-wider block mb-1">Deterministic Output Summary:</span>
                <p className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]">
                  {activeLog.output_summary}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[var(--border)]">
              <Button size="sm" variant="outline" onClick={() => setActiveLog(null)} className="text-xs h-8 border-[var(--border)] hover:bg-[var(--bg)] text-[var(--text)]">
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
