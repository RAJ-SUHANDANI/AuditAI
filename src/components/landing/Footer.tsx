"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950/40 py-16 px-6 font-sans relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Summary */}
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white text-[#09090B] flex items-center justify-center font-bold text-base shadow-md">
              A
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Audit<span className="text-blue-500">AI</span>
            </span>
          </Link>
          <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
            AuditAI is an AI-powered SaaS platform evaluating web layouts across UX standards, WCAG guidelines, visual hierarchies, and conversion tactics to automate professional site audits.
          </p>
        </div>

        {/* Resources links */}
        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Resources</h4>
          <ul className="space-y-3 text-xs text-zinc-400">
            <li>
              <a href="#features" className="hover:text-white transition-colors">
                Auditor Features
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-white transition-colors">
                Pricing Plans
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-white transition-colors">
                Faq
              </a>
            </li>
          </ul>
        </div>

        {/* Sandbox notification */}
        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Integrations</h4>
          <ul className="space-y-3 text-xs text-zinc-400 font-sans">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Google Gemini API
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Supabase Database
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Zustand State
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-zinc-900/60 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[10px] text-zinc-500">
          &copy; {new Date().getFullYear()} AuditAI. Build for Frontend Portfolio presentation.
        </p>
        <div className="flex gap-6 text-[10px] text-zinc-500">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
