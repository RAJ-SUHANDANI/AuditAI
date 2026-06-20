"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles, CheckCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 overflow-hidden flex flex-col items-center text-center px-6">
      {/* Mesh glow behind text */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>
      
      {/* Micro-badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 mb-6 backdrop-blur-md"
      >
        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
        <span>AI-powered UI/UX & WCAG Accessibility Audit</span>
      </motion.div>

      {/* Main Title */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white max-w-4xl leading-[1.1] mb-6"
      >
        Optimize Your Interface with{" "}
        <span className="bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">
          AI-Powered Audits
        </span>
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-zinc-400 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
      >
        Upload a screenshot of your website. AuditAI instantly reviews your UX/UI layouts, accessibility compliance (WCAG), visual hierarchy, and conversion signals to give you actionable, Figma-style improvements.
      </motion.p>

      {/* CTA Actions */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 mb-20 z-10"
      >
        <Link
          href="/signup"
          className="px-6 py-3.5 bg-white text-zinc-950 hover:bg-zinc-200 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-500/5 cursor-pointer"
        >
          Audit Your First Page Free
          <ArrowRight className="w-4 h-4 text-zinc-950" />
        </Link>
        <a
          href="#features"
          className="px-6 py-3.5 bg-[#111113]/80 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-zinc-400 text-zinc-400" />
          See How It Works
        </a>
      </motion.div>

      {/* Premium Dashboard Screenshot/Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full max-w-5xl rounded-2xl border border-zinc-800 bg-[#111113]/25 backdrop-blur-xl p-3 shadow-2xl relative"
      >
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none rounded-2xl"></div>

        {/* Dashboard Shell Mockup */}
        <div className="rounded-xl border border-zinc-800/80 bg-[#09090B] overflow-hidden shadow-2xl text-left font-sans">
          {/* Header Bar */}
          <div className="h-12 border-b border-zinc-800 px-4 flex items-center justify-between bg-zinc-950/40">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/50"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/50"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/50"></span>
              <span className="ml-4 text-xs text-zinc-500 font-mono select-none">https://auditai.com/dashboard/report</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-850 rounded-lg text-[10px] font-medium text-emerald-400">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>AI Audit Done (Score 88/100)</span>
            </div>
          </div>

          {/* Inner Grid */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Screenshot preview panel */}
            <div className="lg:col-span-2 rounded-xl border border-zinc-800/80 bg-zinc-950 p-4 relative flex items-center justify-center min-h-[300px] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#111113]/80 to-[#09090B] opacity-90"></div>
              
              {/* Mock Screen Content */}
              <div className="w-full max-w-sm rounded border border-zinc-800 bg-[#111113] p-4 relative z-10 flex flex-col gap-3 pointer-events-none opacity-80 select-none">
                <div className="h-5 w-1/3 bg-zinc-800 rounded"></div>
                <div className="h-8 w-2/3 bg-zinc-800 rounded"></div>
                <div className="h-32 bg-zinc-800/50 rounded flex items-center justify-center text-xs text-zinc-500">Website Layout Capture</div>
                <div className="h-8 w-full bg-zinc-700 rounded"></div>
              </div>

              {/* AI Issue Annotations overlays */}
              <div className="absolute top-1/4 left-[35%] z-20 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs shadow-lg animate-pulse ring-4 ring-red-500/20">
                  1
                </div>
                <div className="mt-1.5 px-2 py-1 bg-zinc-950/90 border border-red-500/30 rounded text-[10px] text-red-200 backdrop-blur-md">
                  Contrast: 2.1:1 Ratio
                </div>
              </div>

              <div className="absolute bottom-[20%] left-[55%] z-20 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-lg ring-4 ring-amber-500/20">
                  2
                </div>
                <div className="mt-1.5 px-2 py-1 bg-zinc-950/90 border border-amber-500/30 rounded text-[10px] text-amber-200 backdrop-blur-md">
                  CTA out of fold
                </div>
              </div>
            </div>

            {/* Score sidebar details */}
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 flex flex-col gap-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Metrics</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg">
                    <span className="text-[10px] text-zinc-500 block">UX/UI Layout</span>
                    <span className="text-lg font-bold text-white">92%</span>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg">
                    <span className="text-[10px] text-zinc-500 block">Accessibility</span>
                    <span className="text-lg font-bold text-amber-400">74%</span>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg">
                    <span className="text-[10px] text-zinc-500 block">Conversion</span>
                    <span className="text-lg font-bold text-white">88%</span>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg">
                    <span className="text-[10px] text-zinc-500 block">Typography</span>
                    <span className="text-lg font-bold text-emerald-400">90%</span>
                  </div>
                </div>
              </div>

              {/* Suggestions Panel Mock */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 flex-1 flex flex-col gap-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Priority Suggestions</span>
                <div className="p-2.5 bg-zinc-950 border-l-2 border-red-500 border-y border-r border-zinc-800/50 rounded-lg text-xs leading-relaxed">
                  <p className="font-semibold text-red-200">Increase contrast on CTA buttons</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">WCAG AAA requires 4.5:1 ratio for standard text.</p>
                </div>
                <div className="p-2.5 bg-zinc-950 border-l-2 border-amber-500 border-y border-r border-zinc-800/50 rounded-lg text-xs leading-relaxed">
                  <p className="font-semibold text-amber-200">Move hero CTA above the fold line</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Desktop fold line sits around 720px.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
