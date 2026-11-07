import Link from "next/link";
import { SoyLogo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center justify-center p-6 text-center">
      <SoyLogo size={48} variant="brand" className="mb-4" />
      <h2 className="text-2xl font-bold tracking-tight mb-2">404 - Desk Route Not Found</h2>
      <p className="text-sm text-[var(--text-muted)] max-w-md mb-6">
        The requested commodity terminal path or resource does not exist or has been relocated.
      </p>
      <Link href="/dashboard">
        <Button size="sm">Return to Executive Desk</Button>
      </Link>
    </div>
  );
}

