import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { LiveTicker } from "@/components/layout/ticker";
import { ScreenedWatermark } from "@/components/ui/logo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col transition-colors relative overflow-hidden">
      <LiveTicker />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-y-auto relative">
          <Header />
          <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6 relative z-10">
            {children}
          </main>
          {/* Subtle Screened Desk Watermark in Bottom-Right */}
          <ScreenedWatermark className="bottom-6 right-6 fixed pointer-events-none z-0" size={380} />
        </div>
      </div>
    </div>
  );
}
