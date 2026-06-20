"use client";

import React from "react";
import { AuditScore } from "@/store/auditStore";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell } from "recharts";

interface ScoreChartsProps {
  scores: AuditScore;
  overallScore: number;
}

// Circular Gauge Ring using SVG
function CircularGauge({
  score,
  label,
  size = 90,
  strokeWidth = 6,
}: {
  score: number;
  label: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 90) return "stroke-emerald-500 shadow-emerald-500/10";
    if (val >= 70) return "stroke-amber-500 shadow-amber-500/10";
    return "stroke-rose-500 shadow-rose-500/10";
  };

  const getTextColor = (val: number) => {
    if (val >= 90) return "text-emerald-400";
    if (val >= 70) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className="flex flex-col items-center gap-2.5 font-sans">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow backdrop ring */}
        <div className="absolute inset-0 rounded-full blur-[6px] opacity-10 pointer-events-none bg-blue-500"></div>
        <svg width={size} height={size} className="-rotate-90">
          {/* Base track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-zinc-800/80 fill-none"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`fill-none transition-all duration-1000 ease-out ${getColor(score)}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Center Score Text */}
        <div className="absolute inset-0 flex items-center justify-center flex-col select-none">
          <span className={`text-base font-extrabold tracking-tight ${getTextColor(score)}`}>
            {score}%
          </span>
        </div>
      </div>
      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function ScoreCharts({ scores, overallScore }: ScoreChartsProps) {
  // Format details data for BarChart
  const barData = [
    { name: "UX Layout", score: scores.ux_score },
    { name: "Design UI", score: scores.design_score },
    { name: "Accessibility", score: scores.accessibility_score },
    { name: "Conversion Rate", score: scores.conversion_score },
    { name: "Typography", score: scores.typography_score },
    { name: "Mobile responsive", score: scores.mobile_score },
    { name: "Trust signals", score: scores.trust_score },
  ];

  const getBarColor = (score: number) => {
    if (score >= 90) return "#10B981"; // success
    if (score >= 70) return "#F59E0B"; // warning
    return "#EF4444"; // danger
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
      {/* 1. Core Dials Card */}
      <div className="glass rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Key Performance Metrics</h3>
          <p className="text-[10px] text-zinc-500 mb-5">Primary scores calculated across critical areas</p>
        </div>

        <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 gap-4 justify-items-center items-center py-2">
          <CircularGauge score={scores.ux_score} label="UX" />
          <CircularGauge score={scores.design_score} label="Design" />
          <CircularGauge score={scores.accessibility_score} label="A11y" />
          <CircularGauge score={scores.conversion_score} label="Conversion" />
        </div>
      </div>

      {/* 2. Detailed Checklist Bar Chart */}
      <div className="glass rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Scoring Breakdown</h3>
          <p className="text-[10px] text-zinc-500 mb-4">Detailed metric percentages across all analysis aspects</p>
        </div>

        <div className="flex-1 w-full h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              layout="vertical"
              margin={{ top: 0, right: 10, left: -10, bottom: -10 }}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#a1a1aa"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                width={85}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={8}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
