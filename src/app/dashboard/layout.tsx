"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  UploadCloud,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Sparkles,
  BarChart3,
  HelpCircle,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, initialize, isLoading, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    router.push("/");
    await logout();
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <div className="relative flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-2 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <p className="mt-4 text-muted-foreground text-sm font-sans tracking-wide">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Audit Site", href: "/dashboard/audit", icon: UploadCloud },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar background gradient mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-950/10 via-zinc-950/20 to-zinc-950 pointer-events-none"></div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#27272A] bg-[#111113]/40 backdrop-blur-xl shrink-0 z-20">
        {/* Branding header */}
        <div className="h-16 px-6 flex items-center border-b border-[#27272A] gap-2">
          <div className="w-8 h-8 rounded-lg bg-white text-[#09090B] flex items-center justify-center font-bold text-base shadow-md">
            A
          </div>
          <span className="font-bold text-lg tracking-tight">
            Audit<span className="text-blue-500">AI</span>
          </span>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-[#27272A]">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-9 h-9 rounded-lg bg-zinc-800"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-sm font-semibold">
                {user.full_name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
              <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-zinc-950 shadow-md font-semibold scale-[1.01]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-zinc-950" : "text-zinc-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer/Logout */}
        <div className="p-4 border-t border-[#27272A]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden h-16 border-b border-[#27272A] bg-[#111113]/80 backdrop-blur-xl px-4 flex items-center justify-between z-20 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white text-[#09090B] flex items-center justify-center font-bold text-base shadow-md">
            A
          </div>
          <span className="font-bold text-lg tracking-tight">
            Audit<span className="text-blue-500">AI</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute inset-0 bg-[#09090B] z-30 flex flex-col pt-16 animate-fade-in">
          <div className="p-4 border-b border-[#27272A]">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-10 h-10 rounded-lg bg-zinc-800"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-sm font-semibold">
                  {user.full_name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-white">{user.full_name}</p>
                <p className="text-xs text-zinc-400">{user.email}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive
                      ? "bg-white text-zinc-950 shadow-md font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-zinc-950" : "text-zinc-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-[#27272A] mb-8">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 border border-red-500/10 transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace content */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto flex-1 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
