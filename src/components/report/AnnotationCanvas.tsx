"use client";

import React, { useState, useRef } from "react";
import { AuditIssue } from "@/store/auditStore";
import { AlertCircle, AlertTriangle, Info, MapPin } from "lucide-react";

interface AnnotationCanvasProps {
  screenshotUrl: string;
  issues: AuditIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (issueId: string | null) => void;
}

export default function AnnotationCanvas({
  screenshotUrl,
  issues,
  selectedIssueId,
  onSelectIssue,
}: AnnotationCanvasProps) {
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-rose-500 ring-rose-500/30 text-white";
      case "warning":
        return "bg-amber-500 ring-amber-500/30 text-white";
      case "info":
      default:
        return "bg-blue-500 ring-blue-500/30 text-white";
    }
  };

  const getSeverityBorderColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-rose-500/40 text-rose-200 bg-rose-500/10";
      case "warning":
        return "border-amber-500/40 text-amber-200 bg-amber-500/10";
      case "info":
      default:
        return "border-blue-500/40 text-blue-200 bg-blue-500/10";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
      case "warning":
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case "info":
      default:
        return <Info className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-4 font-sans select-none">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-blue-500" />
          Interactive Figma Canvas
        </span>
        <span className="text-[10px] text-zinc-500">
          Click markers to inspect localized suggestions
        </span>
      </div>

      {/* Image Relative Wrapper */}
      <div
        ref={containerRef}
        className="relative rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden flex items-start justify-center shadow-xl group max-h-[600px] overflow-y-auto min-h-[300px]"
      >
        {/* Screenshot Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={screenshotUrl}
          alt="Audited Layout screenshot"
          className="w-full h-auto object-contain block max-w-full select-none pointer-events-none"
        />

        {/* Overlay Pins */}
        {issues.map((issue, idx) => {
          const isSelected = selectedIssueId === issue.id;
          const isHovered = hoveredMarkerId === issue.id;
          const markerIndex = idx + 1;

          // Boundary-safe positioning for the tooltips
          const getTooltipStyle = (x: number, y: number) => {
            let transform = "translate(-50%, -100%)";
            let leftVal = `${x}%`;
            if (x < 35) {
              transform = "translate(0%, -100%)";
              leftVal = `calc(${x}% - 12px)`;
            } else if (x > 65) {
              transform = "translate(-100%, -100%)";
              leftVal = `calc(${x}% + 12px)`;
            }
            return {
              left: leftVal,
              top: `${Math.max(4, y - 5)}%`,
              transform,
            };
          };

          return (
            <React.Fragment key={issue.id}>
              {/* Coordinate Pin */}
              <button
                onClick={() => onSelectIssue(isSelected ? null : issue.id)}
                onMouseEnter={() => setHoveredMarkerId(issue.id)}
                onMouseLeave={() => setHoveredMarkerId(null)}
                style={{
                  left: `${issue.x_percent}%`,
                  top: `${issue.y_percent}%`,
                }}
                className={`absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full font-bold text-xs flex items-center justify-center transition-all cursor-pointer ring-4 shadow-lg hover:scale-110 z-20 ${getSeverityColor(
                  issue.severity
                )} ${
                  isSelected
                    ? "scale-115 ring-white/40 border border-white"
                    : "scale-100"
                }`}
              >
                {markerIndex}
              </button>

              {/* Pin Detail Tooltip Hover Modal */}
              {(isHovered || isSelected) && (
                <div
                  style={getTooltipStyle(issue.x_percent, issue.y_percent)}
                  className={`absolute mb-3 z-30 w-64 p-3.5 rounded-xl border backdrop-blur-md shadow-2xl flex flex-col gap-2 pointer-events-none transition-all duration-150 ${
                    issue.severity === "critical"
                      ? "bg-[#111113]/95 border-rose-500/40 text-white"
                      : issue.severity === "warning"
                      ? "bg-[#111113]/95 border-amber-500/40 text-white"
                      : "bg-[#111113]/95 border-blue-500/40 text-white"
                  }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[10px] font-bold tracking-tight text-white truncate">
                      #{markerIndex} {issue.title}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase shrink-0 ${getSeverityBorderColor(
                        issue.severity
                      )}`}
                    >
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                    {issue.description}
                  </p>
                  <div className="pt-1.5 border-t border-zinc-900 flex items-start gap-1 text-[9px] text-zinc-300 leading-relaxed font-sans">
                    <strong>Fix:</strong> {issue.recommendation}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
