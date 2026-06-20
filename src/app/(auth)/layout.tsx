"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, initialize, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="relative flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-2 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <p className="mt-4 text-muted-foreground text-sm font-sans tracking-wide">Syncing session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col relative overflow-hidden font-sans">
      {/* Background radial gradient mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-zinc-950 to-zinc-950 pointer-events-none"></div>
      
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a08_1px,transparent_1px),linear-gradient(to_bottom,#27272a08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* Decorative blurred background shapes */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-500/5 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none"></div>

      {/* Header / Branding */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 z-10 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-white text-[#09090B] flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-105 transition-all">
            A
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Audit<span className="text-blue-500">AI</span>
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
        >
          Back to Home
        </Link>
      </header>

      {/* Main content container */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-zinc-600 z-10">
        &copy; {new Date().getFullYear()} AuditAI Inc. All rights reserved.
      </footer>
    </div>
  );
}
