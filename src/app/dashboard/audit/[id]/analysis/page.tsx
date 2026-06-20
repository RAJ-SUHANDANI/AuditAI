"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAuditStore } from "@/store/auditStore";
import { CheckCircle2, Circle, AlertTriangle, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  id: number;
  label: string;
  duration: number; // simulated duration in ms
}

const ANALYSIS_STEPS: Step[] = [
  { id: 1, label: "Uploading layout assets & screenshot metadata", duration: 1000 },
  { id: 2, label: "Extracting DOM tree & visual hierarchy boundaries", duration: 1200 },
  { id: 3, label: "Evaluating WCAG 2.1 contrast ratios & readability", duration: 1500 },
  { id: 4, label: "Reviewing call-to-actions & conversion fold metrics", duration: 1200 },
  { id: 5, label: "Compiling consultation scoring & annotations report", duration: 800 },
];

export default function AnalysisProgressPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { getAuditDetails, saveAuditAnalysis } = useAuditStore();

  const auditId = params.id as string;
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [completedStepIds, setCompletedStepIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let stepTimeout: NodeJS.Timeout;

    const runAnalysis = async () => {
      if (!user || !auditId) return;

      try {
        // 1. Load the audit to verify it exists and retrieve screenshot data
        const { audit } = await getAuditDetails(auditId);
        if (!audit) {
          setError("Audit capture not found.");
          setIsProcessing(false);
          return;
        }

        setScreenshotUrl(audit.screenshot_url);

        // If it's already completed, direct to report immediately
        if (audit.status === "completed") {
          router.push(`/dashboard/audit/${auditId}/report`);
          return;
        }

        // 2. Start progress steps timer simulation
        const runStepsTimer = (idx: number) => {
          if (idx >= ANALYSIS_STEPS.length) return;
          
          stepTimeout = setTimeout(() => {
            if (!active) return;
            setCompletedStepIds((prev) => [...prev, ANALYSIS_STEPS[idx].id]);
            setCurrentStepIdx(idx + 1);
            runStepsTimer(idx + 1);
          }, ANALYSIS_STEPS[idx].duration);
        };
        runStepsTimer(0);

        // 3. Trigger server API call to Gemini Vision
        const overrideApiKey = localStorage.getItem("auditai_override_gemini_key") || undefined;
        
        const response = await fetch("/api/audit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: audit.url,
            screenshotBase64: audit.screenshot_url,
            overrideApiKey,
          }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || "Failed to complete AI layout scan.");
        }

        // 4. Save results to database
        await saveAuditAnalysis(auditId, {
          overallScore: data.overallScore,
          uxScore: data.uxScore,
          accessibilityScore: data.accessibilityScore,
          designScore: data.designScore,
          conversionScore: data.conversionScore,
          typographyScore: data.typographyScore,
          mobileScore: data.mobileScore,
          trustScore: data.trustScore,
          issues: data.issues || [],
          recommendations: data.recommendations || [],
          status: "completed",
        });

        // Speed up the checklist animation to finish
        setCompletedStepIds(ANALYSIS_STEPS.map((s) => s.id));
        setCurrentStepIdx(ANALYSIS_STEPS.length);

        // Slight delay for visual satisfaction
        setTimeout(() => {
          if (active) {
            router.push(`/dashboard/audit/${auditId}/report`);
          }
        }, 800);
      } catch (err: any) {
        console.error("Analysis pipeline error:", err);
        setError(err.message || "An unexpected pipeline error occurred.");
        setIsProcessing(false);
      }
    };

    runAnalysis();

    return () => {
      active = false;
      clearTimeout(stepTimeout);
    };
  }, [user, auditId, getAuditDetails, saveAuditAnalysis, router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center font-sans max-w-2xl mx-auto py-12">
      <div className="w-full text-center space-y-6">
        {/* Animated Scanning Header */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
          {screenshotUrl ? (
            <div className="w-32 h-20 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden relative shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshotUrl}
                alt="Audit target"
                className="w-full h-full object-cover object-top opacity-60"
              />
              {/* Green Radar Scan Bar */}
              {isProcessing && (
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_8px_#3b82f6] animate-[bounce_2s_infinite]"></div>
              )}
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}
          
          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-zinc-900 border border-zinc-850 shadow-md">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">AuditAI Layout Scan</h2>
          <p className="text-xs text-zinc-500">
            Multimodal LLM is processing visual components to calculate layout weights
          </p>
        </div>

        {error ? (
          /* Error Box */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl space-y-4 text-left"
          >
            <div className="flex gap-3 text-sm text-red-200">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-white">Layout Scan Failed</p>
                <p className="text-xs text-red-300 leading-relaxed">{error}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => router.push("/dashboard/audit")}
                className="px-4 py-2 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold hover:bg-zinc-900 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl text-xs font-semibold transition-colors"
              >
                Retry Scan
              </button>
            </div>
          </motion.div>
        ) : (
          /* Progress list */
          <div className="glass rounded-2xl p-6 border border-zinc-850 text-left space-y-4 shadow-xl">
            {ANALYSIS_STEPS.map((step, idx) => {
              const isCompleted = completedStepIds.includes(step.id);
              const isActive = currentStepIdx === idx && isProcessing;

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3.5 text-xs transition-all duration-200 ${
                    isCompleted
                      ? "text-zinc-300"
                      : isActive
                      ? "text-white font-semibold"
                      : "text-zinc-600"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-800 shrink-0" />
                  )}
                  <span className="flex-1">{step.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
