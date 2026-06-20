"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useAuditStore, Audit } from "@/store/auditStore";
import {
  FileText,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Activity,
  Trash2,
  Calendar,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { audits, fetchAudits, deleteAudit, isLoading } = useAuditStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user) {
      fetchAudits(user.id);
    }
  }, [user, fetchAudits]);

  // Compute metrics
  const metrics = useMemo(() => {
    const completed = audits.filter((a) => a.status === "completed");
    const total = audits.length;
    const avgScore =
      completed.length > 0
        ? Math.round(completed.reduce((acc, curr) => acc + curr.overall_score, 0) / completed.length)
        : 0;

    return {
      total,
      avgScore,
      completed: completed.length,
      pending: audits.filter((a) => a.status === "pending" || a.status === "analyzing").length,
    };
  }, [audits]);

  // Format chart data (scores over time)
  const chartData = useMemo(() => {
    return [...audits]
      .filter((a) => a.status === "completed")
      .reverse() // chronological order
      .map((a) => ({
        name: new Date(a.created_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        score: a.overall_score,
      }));
  }, [audits]);

  // Filtered audits by URL search query
  const filteredAudits = useMemo(() => {
    return audits.filter(
      (a) =>
        a.url?.toLowerCase().includes(search.toLowerCase()) ||
        a.status.toLowerCase().includes(search.toLowerCase())
    );
  }, [audits, search]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this audit report?")) {
      await deleteAudit(id);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    if (score >= 70) return "text-amber-400 border-amber-500/20 bg-amber-500/5";
    return "text-rose-400 border-rose-500/20 bg-rose-500/5";
  };

  return (
    <div className="space-y-8 flex-1 flex flex-col font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-sm text-zinc-400">
            Monitor optimization progress and analyze layout captures
          </p>
        </div>
        <Link
          href="/dashboard/audit"
          className="px-4 py-2.5 bg-white text-zinc-950 hover:bg-zinc-200 font-semibold rounded-xl text-sm flex items-center gap-2 hover:scale-[1.01] transition-all cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4 text-zinc-950" />
          Audit New Page
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-5 border border-zinc-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Total Audits</span>
            <p className="text-2xl font-bold text-white">{metrics.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-500" />
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-zinc-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Average UX Score</span>
            <p className="text-2xl font-bold text-white">
              {metrics.avgScore > 0 ? `${metrics.avgScore}%` : "N/A"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-zinc-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Completed Runs</span>
            <p className="text-2xl font-bold text-white">{metrics.completed}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <FileText className="w-5 h-5 text-indigo-500" />
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-zinc-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Pending Audits</span>
            <p className="text-2xl font-bold text-white">{metrics.pending}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Activity className="w-5 h-5 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historical Progress Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between min-h-[320px]">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">Audit Score History</h3>
            <p className="text-xs text-zinc-500">Track layout performance scores over consecutive runs</p>
          </div>

          <div className="flex-1 w-full h-[220px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a30" />
                  <XAxis
                    dataKey="name"
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={10}
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#111113",
                      border: "1px solid #27272A",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#FFF",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 4, stroke: "#3B82F6", fill: "#09090B", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-2">
                <FileText className="w-8 h-8 text-zinc-700" />
                <p className="text-xs">No completed audits to graph yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips panel */}
        <div className="glass rounded-2xl p-5 border border-zinc-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-4">Recruiter Checklist</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-zinc-200">Sandbox compatibility</p>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Runs out-of-the-box using local storage mock configurations if Supabase or Gemini keys are not configured.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-zinc-200">Multimodal AI prompt</p>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Check out the structured JSON instruction templates passed to Google Gemini Vision.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-zinc-200">Figma Canvas overlays</p>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    We calculate precise CSS offset values to plot annotations exactly over identified layout defects.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <Link
            href="/dashboard/audit"
            className="w-full mt-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-center rounded-xl text-xs font-semibold text-zinc-200 hover:text-white flex items-center justify-center gap-1 transition-colors"
          >
            Start Audit
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Audits History Table Container */}
      <div className="glass rounded-2xl border border-zinc-800 p-5 flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Captures</h3>
            <p className="text-xs text-zinc-500">History of analyzed pages and visual assets</p>
          </div>
          
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by URL or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#09090B]/60 border border-[#27272A] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Audits List */}
        {isLoading ? (
          <div className="flex-1 min-h-[200px] flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <p className="mt-3 text-xs text-zinc-500">Loading audit history...</p>
          </div>
        ) : filteredAudits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-zinc-400 text-xs">
              <thead className="text-[10px] text-zinc-500 uppercase font-semibold border-b border-zinc-900/60 bg-zinc-950/20">
                <tr>
                  <th className="py-3 px-4">Screenshot</th>
                  <th className="py-3 px-4">Audit Page URL</th>
                  <th className="py-3 px-4 hidden md:table-cell">Analyzed On</th>
                  <th className="py-3 px-4 text-center">UX Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40">
                {filteredAudits.map((audit) => (
                  <tr
                    key={audit.id}
                    onClick={() => {
                      if (audit.status === "completed") {
                        window.location.href = `/dashboard/audit/${audit.id}/report`;
                      } else if (audit.status === "pending" || audit.status === "analyzing") {
                        window.location.href = `/dashboard/audit/${audit.id}/analysis`;
                      }
                    }}
                    className="hover:bg-zinc-900/20 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="w-12 h-8 rounded border border-zinc-800 bg-zinc-950 overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={audit.screenshot_url}
                          alt="Layout Capture"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white max-w-[200px] truncate">
                      {audit.url || "Manual Image Upload"}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-650" />
                        <span>{new Date(audit.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {audit.status === "completed" ? (
                        <span
                          className={`inline-block px-2 py-0.5 border rounded-md font-semibold text-[11px] ${getScoreColor(
                            audit.overall_score
                          )}`}
                        >
                          {audit.overall_score}%
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 capitalize">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            audit.status === "completed"
                              ? "bg-emerald-400"
                              : audit.status === "analyzing"
                              ? "bg-blue-400 animate-pulse"
                              : audit.status === "failed"
                              ? "bg-red-400"
                              : "bg-zinc-400 animate-pulse"
                          }`}
                        ></span>
                        <span
                          className={
                            audit.status === "completed"
                              ? "text-zinc-300 font-medium"
                              : "text-zinc-500"
                          }
                        >
                          {audit.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2.5 items-center">
                        {audit.status === "completed" ? (
                          <Link
                            href={`/dashboard/audit/${audit.id}/report`}
                            className="p-1 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-zinc-350 hover:text-white hover:border-zinc-700 transition-colors flex items-center gap-1"
                          >
                            Report
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <Link
                            href={`/dashboard/audit/${audit.id}/analysis`}
                            className="p-1 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-colors"
                          >
                            Inspect
                          </Link>
                        )}
                        <button
                          onClick={(e) => handleDelete(e, audit.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete Audit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center text-zinc-500 gap-3 border border-dashed border-zinc-850 rounded-2xl bg-zinc-950/20 p-6">
            <Layers className="w-10 h-10 text-zinc-700" />
            <div className="text-center space-y-1">
              <p className="text-xs font-semibold text-white">No layout captures matching search</p>
              <p className="text-[10px] text-zinc-500">Run a new visual inspection to populate layout summaries.</p>
            </div>
            <Link
              href="/dashboard/audit"
              className="mt-2 text-xs px-3.5 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-semibold rounded-xl flex items-center gap-1.5"
            >
              Audit first page
              <Plus className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
