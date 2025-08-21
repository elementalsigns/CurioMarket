import { VerificationDashboard } from "@/components/verification-dashboard";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Verification() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="bg-black border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/account" className="flex items-center gap-2 text-zinc-400 hover:text-red-600 transition-colors" data-testid="link-back-account">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Account</span>
            </Link>
            <div className="h-4 w-px bg-zinc-600" />
            <h1 className="text-2xl font-bold text-white">Account Verification</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        <VerificationDashboard />
      </main>
    </div>
  );
}