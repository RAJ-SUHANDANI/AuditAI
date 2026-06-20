"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "How does the AI visual audit process work?",
      a: "When you upload a website screenshot, AuditAI compiles the visual assets and sends them to Google's Gemini Vision API. Our specialized analysis pipeline processes the interface against standard guidelines for WCAG accessibility, visual grids, visual hierarchy, typographies, and conversion metrics to map out exact coordinates of defects and compile actionable recommendations.",
    },
    {
      q: "Which AI model powers AuditAI?",
      a: "We integrate Google AI Studio's Gemini 2.5/1.5 Flash models. Flash models are highly optimized for multimodal tasks, combining fast image processing capabilities with strict structured JSON output parsing to ensure consistent report metrics.",
    },
    {
      q: "Can I audit local mockups or staging websites?",
      a: "Yes! As long as you can take a screenshot of your screen (even if it is running on localhost or inside Figma), you can drag and drop it into AuditAI to get an immediate layout report.",
    },
    {
      q: "Is my uploaded design data secure?",
      a: "Absolutely. All uploads are processed immediately for your analysis and stored within secure Supabase storage buckets. We do not use your screenshots to train models, and they are protected under Supabase Row Level Security (RLS) policies so only you can access them.",
    },
    {
      q: "How does the Figma-style annotation canvas work?",
      a: "When the model returns report issues, it includes percentage-based coordinates of where each issue resides. The interactive annotation screen plots clickable markers directly on your image, showing details and recommendations in real time as you inspect the layout.",
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 border-t border-zinc-900 bg-zinc-950/20 relative px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-3">Questions</h2>
          <p className="text-3xl sm:text-4xl font-bold text-white mb-4">Frequently Asked Questions</p>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Everything you need to know about visual audits, credits, and the AI capabilities.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="glass rounded-2xl border border-zinc-800/80 overflow-hidden transition-colors duration-200"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-semibold text-sm sm:text-base text-white hover:text-blue-400 transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <span className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0 ml-4">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-900/50 pt-4 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
