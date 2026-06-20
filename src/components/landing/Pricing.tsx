"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

export default function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Free",
      price: 0,
      desc: "Perfect for testing AI visual audits on simple layouts",
      features: [
        "1 Audit Credit per month",
        "Executive summaries",
        "Basic scores breakdown",
        "Community support",
      ],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Professional",
      price: billing === "monthly" ? 29 : 19,
      desc: "For freelancers and startup developers optimizing actively",
      features: [
        "50 Audit Credits per month",
        "Priority AI analysis models",
        "Interactive Figma-style annotations",
        "High-fidelity PDF Export reports",
        "24-hour email priority support",
      ],
      cta: "Start 7-Day Free Trial",
      popular: true,
    },
    {
      name: "Agency",
      price: billing === "monthly" ? 99 : 79,
      desc: "For digital agencies and design studios running weekly reviews",
      features: [
        "Unlimited Audit Credits",
        "Multi-page batch audit processing",
        "Figma-style annotations + team comments",
        "Custom branding on PDF reports",
        "Dedicated account representative",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 border-t border-zinc-900 bg-zinc-950/10 relative px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-3">Plans & Pricing</h2>
          <p className="text-3xl sm:text-4xl font-bold text-white mb-4">Start Auditing Immediately</p>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Choose the plan that matches your development volume. Save up to 35% on annual subscriptions.
          </p>

          {/* Toggle Switch */}
          <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 mt-8">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                billing === "monthly" ? "bg-white text-zinc-950" : "text-zinc-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                billing === "yearly" ? "bg-white text-zinc-950" : "text-zinc-400 hover:text-white"
              }`}
            >
              Yearly (Save ~35%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
          {plans.map((plan, idx) => {
            return (
              <div
                key={idx}
                className={`glass rounded-2xl p-8 flex flex-col justify-between relative ${
                  plan.popular
                    ? "border-blue-500/40 bg-zinc-900/30 shadow-xl shadow-blue-500/5 scale-[1.02] z-10"
                    : "border-zinc-800/80"
                } ${idx === 2 ? "md:col-span-2 lg:col-span-1" : ""}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 right-6 px-2.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-xs text-zinc-400 mb-6 min-h-[32px] leading-relaxed">{plan.desc}</p>
                  
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-3xl font-extrabold text-white">${plan.price}</span>
                    <span className="text-xs text-zinc-500 font-medium">/ month</span>
                  </div>

                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={plan.name === "Free" ? "/signup" : "/signup"}
                  className={`w-full py-2.5 rounded-xl text-center text-xs font-semibold transition-all ${
                    plan.popular
                      ? "bg-blue-500 hover:bg-blue-600 text-white hover:scale-[1.01]"
                      : "bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 text-zinc-300 hover:text-white"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
