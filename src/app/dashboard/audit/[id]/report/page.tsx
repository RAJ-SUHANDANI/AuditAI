"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAuditStore, Audit, AuditScore, AuditIssue, AuditRecommendation } from "@/store/auditStore";
import ScoreCharts from "@/components/report/ScoreCharts";
import AnnotationCanvas from "@/components/report/AnnotationCanvas";
import {
  FileText,
  ArrowLeft,
  Printer,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckSquare,
  Square,
  HelpCircle,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { getAuditDetails } = useAuditStore();

  const auditId = params.id as string;
  const [audit, setAudit] = useState<Audit | null>(null);
  const [scores, setScores] = useState<AuditScore | null>(null);
  const [issues, setIssues] = useState<AuditIssue[]>([]);
  const [recommendations, setRecommendations] = useState<AuditRecommendation[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"canvas" | "issues" | "recommendations">("canvas");
  const [severityFilter, setSeverityFilter] = useState<"all" | "critical" | "warning" | "info">("all");
  const [checkedRecommendations, setCheckedRecommendations] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      if (user && auditId) {
        setIsLoading(true);
        const details = await getAuditDetails(auditId);
        setAudit(details.audit);
        setScores(details.scores);
        setIssues(details.issues);
        setRecommendations(details.recommendations);
        setIsLoading(false);
      }
    };
    loadDetails();
  }, [user, auditId, getAuditDetails]);

  // Read saved checked recommendations on load
  useEffect(() => {
    if (auditId) {
      const stored = localStorage.getItem(`auditai_recs_checked_${auditId}`);
      if (stored) {
        try {
          setCheckedRecommendations(JSON.parse(stored));
        } catch (e) {
          // ignore
        }
      }
    }
  }, [auditId]);

  const toggleRecommendation = (recId: string) => {
    const updated = {
      ...checkedRecommendations,
      [recId]: !checkedRecommendations[recId],
    };
    setCheckedRecommendations(updated);
    localStorage.setItem(`auditai_recs_checked_${auditId}`, JSON.stringify(updated));
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { label: "Excellent Layout", color: "text-emerald-400" };
    if (score >= 70) return { label: "Fair Layout Needs Fixes", color: "text-amber-400" };
    return { label: "Critical Optimization Target", color: "text-rose-400" };
  };

  // Filtered issues based on sidebar selector
  const filteredIssues = useMemo(() => {
    if (severityFilter === "all") return issues;
    return issues.filter((i) => i.severity === severityFilter);
  }, [issues, severityFilter]);

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "critical":
        return "bg-rose-500/10 border-rose-500/20 text-rose-300";
      case "warning":
        return "bg-amber-500/10 border-amber-500/20 text-amber-300";
      case "info":
      default:
        return "bg-blue-500/10 border-blue-500/20 text-blue-300";
    }
  };

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case "critical":
        return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case "info":
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-10 h-10 rounded-full border-2 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        <p className="mt-3 text-xs text-zinc-500">Compiling layout metrics...</p>
      </div>
    );
  }

  if (!audit || !scores) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-3 text-center p-6">
        <AlertCircle className="w-12 h-12 text-zinc-700" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">Report Not Found</p>
          <p className="text-xs text-zinc-500">This audit may have been deleted or failed to compile.</p>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-3 px-4 py-2 bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 rounded-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const selectedIssue = issues.find((i) => i.id === selectedIssueId);

  return (
    <div className="space-y-8 flex-1 flex flex-col font-sans relative print:p-0 print:bg-white print:text-black">
      {/* Print-specific style sheet override */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          aside, header, nav, button, .print-hide {
            display: none !important;
          }
          .print-full {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: none !important;
            backdrop-filter: none !important;
          }
          .print-break {
            page-break-before: always;
          }
        }
      `}</style>

      {/* Top action header */}
      <div className="flex justify-between items-center print-hide">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-semibold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            {copied ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Link Copied!
              </>
            ) : (
              <>
                <ExternalLink className="w-3.5 h-3.5" />
                Share Report
              </>
            )}
          </button>
          
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-semibold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Export PDF / Print
          </button>
        </div>
      </div>

      {/* Main title grid */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900/60 pb-6 print:pb-4 print:border-zinc-300">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white print:text-black">
            UX & Accessibility Evaluation Report
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mt-2">
            <span className="font-semibold text-zinc-300 print:text-zinc-700 truncate max-w-sm">
              {audit.url || "Manual Image Capture"}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 print:hidden"></span>
            <span>Analyzed {new Date(audit.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Big Overall Score dial badge */}
        <div className="flex items-center gap-3 bg-zinc-950 p-3 rounded-2xl border border-zinc-850 print:bg-white print:border-zinc-300">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/25 border-t-blue-500 flex items-center justify-center font-extrabold text-white text-sm print:text-black">
            {audit.overall_score}%
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase font-semibold">Overall Index</p>
            <p className={`text-xs font-bold ${getScoreGrade(audit.overall_score).color}`}>
              {getScoreGrade(audit.overall_score).label}
            </p>
          </div>
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="glass rounded-2xl p-6 border border-zinc-800 print-full print:border-zinc-300 print:bg-white">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5 print:text-black">
          <FileText className="w-4 h-4 text-blue-500 print:text-zinc-800" />
          Executive Assessment Summary
        </h3>
        <p className="text-xs sm:text-sm text-zinc-350 leading-relaxed print:text-zinc-800">
          {audit.overall_score < 70 ? (
            <strong>Critical visual review required. </strong>
          ) : null}
          {scores.accessibility_score < 70 ? (
            <strong>Accessibility structures require compliance overrides. </strong>
          ) : null}
          {audit.overall_score >= 85 ? (
            <strong>High-performance visual build. </strong>
          ) : null}
          {audit.overall_score < 85 && audit.overall_score >= 70 ? (
            <strong>Stable frontend layout with specific optimization targets. </strong>
          ) : null}
          The analysis indicates that the page design excels at visual appeal but contains notable friction bottlenecks in checkout layouts and button positions.
        </p>
      </div>

      {/* Score breakdowns ( dails & bar charts) */}
      <ScoreCharts scores={scores} overallScore={audit.overall_score} />

      {/* Main Report Tabbed View grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start print:grid-cols-1 print:gap-4 print-break">
        {/* Left Columns: Figma Canvas / Issues Filter */}
        <div className="lg:col-span-2 space-y-6 print-full">
          {/* Tab selector */}
          <div className="flex gap-2.5 p-1 rounded-xl bg-zinc-900 border border-zinc-850 print-hide">
            <button
              onClick={() => setActiveTab("canvas")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "canvas" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              Figma Canvas
            </button>
            <button
              onClick={() => setActiveTab("issues")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "issues" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              Defects List ({issues.length})
            </button>
            <button
              onClick={() => setActiveTab("recommendations")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "recommendations" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              Tasks Checklist ({recommendations.length})
            </button>
          </div>

          {/* Active Tab contents */}
          {activeTab === "canvas" && (
            <div className="print:block">
              <AnnotationCanvas
                screenshotUrl={audit.screenshot_url}
                issues={issues}
                selectedIssueId={selectedIssueId}
                onSelectIssue={setSelectedIssueId}
              />
            </div>
          )}

          {activeTab === "issues" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Filter Defects</span>
                <div className="flex items-center gap-1.5 text-xs border border-zinc-850 p-1 rounded-lg bg-zinc-900">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value as any)}
                    className="bg-transparent text-zinc-300 font-semibold focus:outline-none border-none text-[10px]"
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </div>
              </div>

              {/* List */}
              {filteredIssues.length > 0 ? (
                <div className="space-y-3">
                  {filteredIssues.map((issue, idx) => {
                    const isSelected = selectedIssueId === issue.id;
                    return (
                      <div
                        key={issue.id}
                        onClick={() => setSelectedIssueId(isSelected ? null : issue.id)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-zinc-900/30 border-blue-500/40"
                            : "bg-[#111113]/30 border-zinc-850 hover:bg-zinc-900/20"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            <span className="w-4.5 h-4.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-400 flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            {issue.title}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase shrink-0 ${getSeverityBadge(
                              issue.severity
                            )}`}
                          >
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                          {issue.description}
                        </p>
                        <div className="pt-2 border-t border-zinc-900/60 flex items-start gap-2 text-xs text-zinc-300">
                          {getSeverityIcon(issue.severity)}
                          <div>
                            <strong>Action:</strong> {issue.recommendation}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center text-zinc-500 border border-dashed border-zinc-850 rounded-2xl bg-zinc-950/20">
                  No issues matching filter parameters.
                </div>
              )}
            </div>
          )}

          {activeTab === "recommendations" && (
            <div className="space-y-4">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Actionable Optimization Checklist</span>
              <div className="space-y-3">
                {recommendations.map((rec) => {
                  const isChecked = !!checkedRecommendations[rec.id];
                  return (
                    <div
                      key={rec.id}
                      onClick={() => toggleRecommendation(rec.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-3 text-left ${
                        isChecked
                          ? "bg-zinc-900/10 border-zinc-850 opacity-60"
                          : "bg-[#111113]/30 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <button className="shrink-0 mt-0.5 text-zinc-400 hover:text-white transition-colors">
                        {isChecked ? (
                          <CheckSquare className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Square className="w-5 h-5 text-zinc-700" />
                        )}
                      </button>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`text-xs font-bold leading-none ${isChecked ? "line-through text-zinc-500" : "text-white"}`}>
                            {rec.title}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-[8px] text-zinc-450 font-bold shrink-0 uppercase">
                            {rec.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          {rec.description}
                        </p>
                        <div className="flex gap-3 text-[9px] text-zinc-500 uppercase font-semibold">
                          <span>Impact: <strong className={rec.impact === "high" ? "text-emerald-400" : "text-zinc-400"}>{rec.impact}</strong></span>
                          <span>Effort: <strong className={rec.effort === "high" ? "text-rose-400" : "text-zinc-450"}>{rec.effort}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Detail side panel */}
        <div className="space-y-6 print:block print:w-full print:mt-6 print-break">
          {/* Active selection display details */}
          {selectedIssue ? (
            <div className="glass rounded-2xl p-5 border border-zinc-800 flex flex-col gap-4 text-left">
              <div className="flex justify-between items-center gap-2 pb-3 border-b border-zinc-900/60">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  Defect Details
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Coordinate offset ({selectedIssue.x_percent}%, {selectedIssue.y_percent}%)</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(selectedIssue.severity)}
                  <h4 className="text-sm font-bold text-white">{selectedIssue.title}</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{selectedIssue.description}</p>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1.5">
                <span className="text-[9px] font-semibold text-zinc-550 uppercase tracking-widest block">Technical recommendation</span>
                <p className="text-xs text-zinc-300 leading-relaxed">{selectedIssue.recommendation}</p>
              </div>

              <button
                onClick={() => setSelectedIssueId(null)}
                className="w-full py-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 hover:text-white rounded-xl text-xs font-semibold text-zinc-300 cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 border border-zinc-800 text-center text-zinc-500 text-xs min-h-[160px] flex flex-col justify-center items-center gap-2.5 print-hide">
              <HelpCircle className="w-8 h-8 text-zinc-700" />
              <p className="font-semibold text-zinc-450">No issue highlighted</p>
              <p className="text-[10px] text-zinc-650 leading-relaxed max-w-[200px]">
                Click coordinates on the Figma canvas, or browse defects to inspect specific details.
              </p>
            </div>
          )}

          {/* Recommendations Summary stat box */}
          <div className="glass rounded-2xl p-5 border border-zinc-800 flex flex-col gap-4 text-left print-hide">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Optimization tasks</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl">
                <span className="text-[10px] text-zinc-550 block mb-0.5">High Impact Tasks</span>
                <span className="text-base font-extrabold text-emerald-400">
                  {recommendations.filter((r) => r.impact === "high").length}
                </span>
              </div>
              <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl">
                <span className="text-[10px] text-zinc-550 block mb-0.5">Tasks Completed</span>
                <span className="text-base font-extrabold text-blue-400">
                  {Object.values(checkedRecommendations).filter(Boolean).length} / {recommendations.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
