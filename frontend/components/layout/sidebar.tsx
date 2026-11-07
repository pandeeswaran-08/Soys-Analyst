"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { SoyLogo } from "@/components/ui/logo";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calculator,
  TrendingUp,
  Package,
  Flame,
  Bot,
  FileText,
  Clock,
  Scale,
  MapPin,
  ShieldCheck,
  Search,
  PanelLeftClose,
  PanelLeft,
  PlusCircle,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  keywords?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: "Executive Desk",
    items: [
      {
        name: "Overview Terminal",
        href: "/dashboard",
        icon: LayoutDashboard,
        keywords: ["overview", "terminal", "home", "kpi", "summary"]
      },
      {
        name: "AI Strategist",
        href: "/dashboard/chat",
        icon: Bot,
        badge: "AI",
        keywords: ["chat", "agent", "decision", "llm", "ai", "strategist"]
      },
      {
        name: "Audit Registry",
        href: "/dashboard/audit-logs",
        icon: Clock,
        keywords: ["audit", "logs", "compliance", "history", "records"]
      },
    ],
  },
  {
    title: "Deterministic Engines",
    items: [
      {
        name: "Landed Parity",
        href: "/dashboard/landed-cost",
        icon: Calculator,
        keywords: ["landed", "cost", "parity", "mandi", "customs", "freight"]
      },
      {
        name: "Price Forecasting",
        href: "/dashboard/forecasting",
        icon: TrendingUp,
        keywords: ["forecast", "holt-winters", "price", "trajectory", "prediction"]
      },
      {
        name: "Inventory & ROP",
        href: "/dashboard/inventory",
        icon: Package,
        keywords: ["inventory", "safety", "stock", "rop", "reorder", "buffer"]
      },
      {
        name: "Stress Testing",
        href: "/dashboard/stress-test",
        icon: Flame,
        badge: "MONTE CARLO",
        keywords: ["stress", "monte", "carlo", "scenario", "simulation", "shocks"]
      },
    ],
  },
  {
    title: "Processing & Analytics",
    items: [
      {
        name: "Document Intelligence",
        href: "/dashboard/documents",
        icon: FileText,
        badge: "RAG",
        keywords: ["document", "rag", "wasde", "conab", "reports", "pdf"]
      },
      {
        name: "Crush Margins (GPM)",
        href: "/dashboard/crush-margin",
        icon: Scale,
        keywords: ["crush", "margin", "gpm", "board", "meal", "oil"]
      },
      {
        name: "Spatial Basis & Freight",
        href: "/dashboard/basis",
        icon: MapPin,
        keywords: ["basis", "spatial", "freight", "arbitrage", "bids", "river"]
      },
      {
        name: "Risk Analytics (VaR)",
        href: "/dashboard/risk",
        icon: ShieldCheck,
        keywords: ["risk", "var", "value-at-risk", "volatility", "drawdown"]
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");

  // Keyboard shortcut: Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setCollapsed((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter sections when user searches in sidebar
  const filteredSections = useMemo(() => {
    if (!filterQuery.trim()) return navigationSections;
    const query = filterQuery.toLowerCase().trim();

    return navigationSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.badge?.toLowerCase().includes(query) ||
            item.keywords?.some((k) => k.includes(query))
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [filterQuery]);

  return (
    <aside
      className={cn(
        "border-r border-[var(--border)] bg-[var(--surface)] text-[var(--text)] flex flex-col justify-between h-full shrink-0 select-none transition-all duration-300 z-30",
        collapsed ? "w-16" : "w-64"
      )}
      aria-label="Application Navigation"
    >
      {/* Top Branding & Quick Actions */}
      <div className={cn("p-3", collapsed ? "space-y-2 px-2" : "space-y-2.5")}>
        {!collapsed ? (
          /* Expanded Header: Logo + Brand on left, Collapse Toggle on right */
          <div className="flex items-center justify-between gap-1.5">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[var(--bg)] transition-colors group flex-1 min-w-0"
              title="SoyDecision Desk - Institutional Command"
            >
              <div className="w-8 h-8 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                <SoyLogo size={28} variant="brand" className="drop-shadow-xs" />
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs tracking-tight text-[var(--text)] truncate">
                    SoyDecision
                  </span>
                  <span className="text-[#10A37F] font-mono text-[9px] font-bold px-1 py-0.2 rounded bg-[#10A37F]/10 border border-[#10A37F]/30 shrink-0">
                    DESK
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] font-mono tracking-tight truncate mt-0.5">
                  Enterprise Core v1.0
                </p>
              </div>
            </Link>

            {/* Collapse Button */}
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="hidden md:flex p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] transition-colors cursor-pointer shrink-0"
              title="Collapse sidebar (Ctrl+B)"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4 text-[var(--text-muted)] hover:text-[#10A37F] transition-colors" />
            </button>
          </div>
        ) : (
          /* Collapsed Header: Clean Vertical Stack - Logo then Expand Toggle */
          <div className="flex flex-col items-center gap-1.5 w-full">
            {/* Centered Logo (Go to Dashboard) */}
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[var(--bg)] transition-colors group"
              title="SoyDecision Desk - Executive Dashboard"
            >
              <div className="w-8 h-8 shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                <SoyLogo size={26} variant="brand" />
              </div>
            </Link>

            {/* Dedicated Expand Button (Centered below logo) */}
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="w-10 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[#10A37F] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] transition-colors cursor-pointer"
              title="Expand sidebar (Ctrl+B)"
              aria-label="Expand sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action: New Strategy Session */}
        {!collapsed ? (
          <Link
            href="/dashboard/chat"
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all border group",
              pathname === "/dashboard/chat"
                ? "bg-[var(--bg)] border-[var(--border)] text-[#10A37F] shadow-2xs font-semibold"
                : "bg-[var(--bg)]/50 hover:bg-[var(--bg)] border-[var(--border)] text-[var(--text)] hover:border-[#10A37F]/40"
            )}
            title="Launch New Strategy Session"
          >
            <div className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#10A37F] group-hover:scale-110 transition-transform" />
              <span>New AI Strategy Session</span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-mono px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)]">
              ⌘J
            </span>
          </Link>
        ) : (
          <Link
            href="/dashboard/chat"
            className={cn(
              "flex items-center justify-center w-10 h-10 mx-auto rounded-lg border transition-all group",
              pathname === "/dashboard/chat"
                ? "bg-[var(--bg)] border-[#10A37F] text-[#10A37F]"
                : "bg-[var(--bg)]/50 hover:bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-[#10A37F]"
            )}
            title="New AI Strategy Session"
          >
            <PlusCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </Link>
        )}

        {/* Filter Navigation Input (Visible when expanded) */}
        {!collapsed && (
          <div className="relative pt-0.5">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Quick jump to tool..."
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md pl-8 pr-7 py-1 text-[11px] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#10A37F] transition-all font-sans"
            />
            {filterQuery && (
              <button
                type="button"
                onClick={() => setFilterQuery("")}
                className="absolute right-2 top-2.5 text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
                title="Clear filter"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation Groups List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 scrollbar-thin scrollbar-thumb-[var(--border)] hover:scrollbar-thumb-[var(--text-muted)]/30 pr-1.5">
        {filteredSections.map((sec) => (
          <div key={sec.title} className="space-y-1">
            {!collapsed ? (
              <div className="px-2 pt-2 pb-0.5">
                <p className="text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase font-mono">
                  {sec.title}
                </p>
              </div>
            ) : (
              <div className="w-8 mx-auto h-px bg-[var(--border)] my-2" />
            )}

            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={cn(
                      "flex items-center justify-between rounded-lg text-xs font-medium transition-all group relative",
                      collapsed ? "w-10 h-10 mx-auto justify-center" : "px-2.5 py-1.5",
                      isActive
                        ? "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] shadow-2xs font-semibold"
                        : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]/60 border border-transparent"
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    {/* Active Accent Indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[#10A37F] rounded-r-md" />
                    )}

                    <div className={cn("flex items-center gap-2.5 min-w-0", collapsed && "gap-0")}>
                      <Icon className={cn(
                        "w-4 h-4 transition-colors shrink-0",
                        isActive ? "text-[#10A37F]" : "text-[var(--text-muted)] group-hover:text-[var(--text)]"
                      )} />
                      {!collapsed && (
                        <span className="truncate tracking-tight text-xs">{item.name}</span>
                      )}
                    </div>

                    {!collapsed && item.badge && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-medium border uppercase tracking-wider shrink-0 bg-[#10A37F]/10 text-[#10A37F] border-[#10A37F]/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {filteredSections.length === 0 && (
          <div className="py-6 text-center text-xs text-[var(--text-muted)]">
            <p>No tools matched &ldquo;{filterQuery}&rdquo;</p>
            <button
              onClick={() => setFilterQuery("")}
              className="mt-2 text-[11px] text-[#10A37F] hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>

      {/* System Telemetry & Status Footer */}
      <div className="p-3 border-t border-[var(--border)] bg-[var(--surface)] shrink-0">
        {!collapsed ? (
          <div className="rounded-lg p-2.5 bg-[var(--bg)] border border-[var(--border)] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-muted)] font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10A37F] animate-pulse" />
                Math Core
              </span>
              <span className="text-[10px] text-[#10A37F] font-mono font-semibold bg-[#10A37F]/10 px-1.5 py-0.2 rounded border border-[#10A37F]/30">
                100% GROUNDED
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-[var(--border)] pt-1.5 text-[11px]">
              <span className="text-[var(--text-muted)]">Theme</span>
              <span className="text-[var(--text)] font-mono text-[10px]">Institutional</span>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-1 space-y-1.5 cursor-pointer"
            title="Deterministic Math Core: 100% Certified Grounded"
          >
            <span className="w-2 h-2 rounded-full bg-[#10A37F] animate-pulse" />
            <ShieldCheck className="w-4 h-4 text-[#10A37F]" />
          </div>
        )}
      </div>
    </aside>
  );
}
