import Link from "next/link";
import { SoyLogo, ScreenedWatermark } from "@/components/ui/logo";
import { SignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { isClerkConfigured } from "@/lib/clerk-config";

export default function SignUpPage() {
  const clerkActive = isClerkConfigured();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center justify-center p-4 transition-colors relative overflow-hidden">
      <ScreenedWatermark size={500} className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="mb-6 text-center flex flex-col items-center relative z-10">
        <div className="mb-3 shrink-0 flex items-center justify-center">
          <SoyLogo size={56} variant="brand" className="drop-shadow-sm" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text)] flex items-center justify-center gap-2">
          SoyDecision <span className="text-[#10A37F] font-mono">DESK</span>
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">Register for institutional commodity desk access</p>
      </div>

      {clerkActive ? (
        <SignUp routing="path" path="/sign-up" />
      ) : (
        <div className="max-w-md w-full p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#10A37F]/10 border border-[#10A37F]/30 flex items-center justify-center mx-auto text-[#10A37F]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--text)]">Standalone Desk Mode Active</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Institutional desk account registration is active. You can launch directly into the executive terminal.
            </p>
          </div>
          <Link href="/dashboard" className="block pt-2">
            <Button className="w-full bg-[#10A37F] hover:bg-[#0D8A6D] text-white font-medium text-xs h-9">
              Enter Trading Desk <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
