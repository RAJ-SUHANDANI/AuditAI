"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? "py-3 bg-[#09090B]/90 backdrop-blur-md border-b border-[#27272A]/50"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-white text-[#09090B] flex items-center justify-center font-bold text-base shadow-md group-hover:scale-105 transition-all duration-300">
              A
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Audit<span className="text-blue-500">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation Link Items */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#faq" className="text-sm text-zinc-400 hover:text-white transition-colors">
              FAQ
            </a>
          </div>

          {/* Call to action buttons & Hamburger */}
          <div className="flex items-center gap-4">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link
                    href="/dashboard"
                    className="text-sm px-4 py-2 bg-white hover:bg-zinc-200 text-[#09090B] font-medium rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-zinc-300 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm text-zinc-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="text-sm px-4 py-2 bg-white hover:bg-zinc-200 text-[#09090B] font-medium rounded-xl flex items-center gap-1.5 transition-all shadow-lg hover:shadow-blue-500/10"
                  >
                    Get Started
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 fill-blue-600/20" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger toggle button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 md:hidden rounded-lg border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[57px] bg-[#09090B]/95 backdrop-blur-lg z-45 md:hidden flex flex-col px-6 py-8 border-t border-[#27272A]/50 animate-fade-in">
          <nav className="flex flex-col gap-6 mb-8">
            <a
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-medium text-zinc-300 hover:text-white transition-colors py-2 border-b border-zinc-900"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-medium text-zinc-300 hover:text-white transition-colors py-2 border-b border-zinc-900"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-medium text-zinc-300 hover:text-white transition-colors py-2 border-b border-zinc-900"
            >
              FAQ
            </a>
          </nav>

          <div className="flex flex-col gap-4 mt-auto">
            {user ? (
              <div className="flex flex-col gap-3">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 bg-white text-zinc-950 font-semibold rounded-xl text-center flex items-center justify-center gap-1.5 transition-all"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-red-400 font-semibold rounded-xl text-center border border-zinc-800 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold rounded-xl text-center border border-zinc-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold rounded-xl text-center flex items-center justify-center gap-1.5 transition-all"
                >
                  Get Started
                  <Sparkles className="w-4 h-4 text-blue-600 fill-blue-600/20" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
