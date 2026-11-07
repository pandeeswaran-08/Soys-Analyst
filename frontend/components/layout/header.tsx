"use client";

import React from "react";
import Link from "next/link";
import { SoyLogo } from "@/components/ui/logo";
import { UserButton, SignInButton, Show } from "@clerk/nextjs";
import { Search, ShieldCheck, Terminal, UserCog, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRBAC, UserRole } from "@/lib/rbac";
import { isClerkConfigured } from "@/lib/clerk-config";
import { useTheme } from "@/lib/theme";

export function Header() {
  const { role, setRole } = useRBAC();
  const { theme, toggleTheme } = useTheme();
  const clerkActive = isClerkConfigured();

  const roles: UserRole[] = ["Viewer", "Analyst", "Admin"];

  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--bg)] px-6 flex items-center justify-between sticky top-0 z-40 select-none transition-colors">
      {/* Search / Context */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="md:hidden flex items-center shrink-0 hover:scale-105 transition-transform" title="SoyDecision Desk">
          <SoyLogo size={26} variant="brand" />
        </Link>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search contracts, basis, elevators, reports..."
            className="w-72 bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-8 pr-12 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#10A37F] focus:ring-1 focus:ring-[#10A37F] transition-all font-sans"
          />
          <kbd className="absolute right-2.5 top-2 text-[10px] text-[var(--text-muted)] font-mono bg-[var(--bg)] border border-[var(--border)] px-1 py-0.2 rounded">
            ⌘K
          </kbd>
        </div>
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-xs font-mono">
          <Terminal className="w-3 h-3 text-[#10A37F]" />
          <span className="text-[11px]">Decatur Plant 01</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#10A37F] ml-1" />
        </div>
      </div>

      {/* Desk Actions, Theme Toggle, Role Switcher & Clerk Auth */}
      <div className="flex items-center gap-2.5">
        {/* Theme Switcher Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:text-[#10A37F] hover:border-[#10A37F]/50 transition-all cursor-pointer flex items-center justify-center"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-[#F5A623]" />
          ) : (
            <Moon className="w-4 h-4 text-[#6E6E80]" />
          )}
        </button>

        {/* RBAC Role Switcher */}
        <div className="flex items-center gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-0.5">
          <div className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[var(--text-muted)] border-r border-[var(--border)]">
            <UserCog className="w-3.5 h-3.5 text-[#10A37F]" />
            <span className="hidden sm:inline uppercase text-[10px] tracking-wider">Role</span>
          </div>
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer ${role === r
                  ? "bg-[#10A37F] text-white font-semibold shadow-xs"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-[var(--text-muted)] px-2.5 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10A37F]" />
          <span className="font-mono text-[11px]">Audit Engine: OK</span>
        </div>

        {/* Authentication Component */}
        {clerkActive ? (
          <div className="flex items-center gap-2">
            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-full border border-[var(--border)]",
                  },
                }}
              />
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button size="sm" variant="outline" className="text-xs border-[#10A37F] text-[#10A37F] hover:bg-[#10A37F] hover:text-white font-medium">
                  Sign In
                </Button>
              </SignInButton>
            </Show>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text)]">
            <div className="w-5 h-5 rounded-md bg-[#10A37F]/15 border border-[#10A37F]/30 flex items-center justify-center text-[10px] font-bold text-[#10A37F] font-mono">
              SD
            </div>
            <span className="font-medium text-[11px] hidden sm:inline">Desk Trader</span>
          </div>
        )}
      </div>
    </header>
  );
}
