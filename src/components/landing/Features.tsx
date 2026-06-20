"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Shield,
  Eye,
  Type,
  MousePointerClick,
  Smartphone,
  Layers,
  MapPin,
} from "lucide-react";

export default function Features() {
  const list = [
    {
      title: "UI / UX Layout Audits",
      desc: "Evaluates alignment, visual grids, whitespace, card layouts, and visual noise to optimize cognitive flow.",
      icon: Layers,
      color: "text-blue-500",
    },
    {
      title: "WCAG Accessibility Compliance",
      desc: "Automatically tests visual components against WCAG 2.1 AA requirements, checking size ratios, contrasts, and structures.",
      icon: Shield,
      color: "text-emerald-500",
    },
    {
      title: "Contrast & Typography Scanner",
      desc: "Measures foreground-to-background contrast on text elements and evaluates font size hierarchy for optimal legibility.",
      icon: Type,
      color: "text-indigo-500",
    },
    {
      title: "Conversion & CTA Placement",
      desc: "Analyzes primary and secondary call-to-actions, visual weight, fold distributions, and conversion paths.",
      icon: MousePointerClick,
      color: "text-rose-500",
    },
    {
      title: "Figma-Style Annotations",
      desc: "Overlay coordinate markers directly on your website screenshots. Hover to inspect precise issues and solutions.",
      icon: MapPin,
      color: "text-purple-500",
    },
    {
      title: "Device Optimization",
      desc: "Reviews mobile compatibility, touch-target sizing, wrapping issues, and spacing bottlenecks for small displays.",
      icon: Smartphone,
      color: "text-amber-500",
    },
  ];

  return (
    <section id="features" className="py-24 border-t border-zinc-900 bg-zinc-950/20 relative px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-3">Audits Checklist</h2>
          <p className="text-3xl sm:text-4xl font-bold text-white mb-4">Comprehensive Frontend Inspections</p>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            AuditAI uses multimodal large models trained on modern design guidelines to scan your screenshot across six primary analysis parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="glass rounded-2xl p-6 glass-hover relative group cursor-default"
              >
                <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105">
                  <Icon className={`w-5 h-5 ${feat.color}`} />
                </div>
                <h3 className="text-base font-bold text-white mb-2 tracking-tight">{feat.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
