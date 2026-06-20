"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useAuditStore } from "@/store/auditStore";
import {
  UploadCloud,
  Globe,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  X,
  FileCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuditPage() {
  const { user } = useAuthStore();
  const { createAudit } = useAuditStore();
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset web captures to let recruiters test without preparing files
  const presets = [
    {
      name: "Linear Layout",
      url: "https://linear.app",
      img: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Stripe Checkout",
      url: "https://stripe.com/checkout",
      img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Vercel Landing",
      url: "https://vercel.com",
      img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Interactive Dashboard",
      url: "https://auditai.com/demo-admin",
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG or JPEG).");
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + " MB");
    setError(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setScreenshotBase64(reader.result as string);
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handlePresetSelect = async (preset: typeof presets[0]) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch the image and convert to base64
      const response = await fetch(preset.img);
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const auditId = await createAudit(user!.id, preset.url, base64);
        router.push(`/dashboard/audit/${auditId}/analysis`);
      };
    } catch (e: any) {
      setError("Failed to load preset layout capture.");
      setIsLoading(false);
    }
  };

  const handleStartAudit = async () => {
    if (!screenshotBase64) {
      setError("Please select or upload a layout screenshot first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formattedUrl = url.trim() || "Manual Screenshot Upload";
      const auditId = await createAudit(user!.id, formattedUrl, screenshotBase64);
      router.push(`/dashboard/audit/${auditId}/analysis`);
    } catch (e: any) {
      setError(e.message || "Failed to start audit job.");
      setIsLoading(false);
    }
  };

  const clearSelection = () => {
    setScreenshotBase64(null);
    setFileName("");
    setFileSize("");
  };

  return (
    <div className="space-y-8 flex-1 flex flex-col font-sans">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">New Visual Audit</h1>
        <p className="text-sm text-zinc-400">
          Upload a screenshot or capture a preset mockup page to evaluate visual layouts
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-sm text-red-200">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Main Grid: Upload & Preset */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 items-start">
        {/* Left Side: Drag & Drop Zone + URL */}
        <div className="lg:col-span-2 space-y-6">
          {/* Drag Drop Card */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`glass rounded-2xl p-8 border border-dashed flex flex-col items-center justify-center min-h-[320px] transition-all relative ${
              dragActive ? "border-blue-500 bg-blue-500/5" : "border-zinc-800"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <AnimatePresence mode="wait">
              {!screenshotBase64 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-4 flex flex-col items-center"
                >
                  <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <UploadCloud className="w-7 h-7 text-zinc-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">Drag & drop your screenshot here</p>
                    <p className="text-xs text-zinc-500">Supports PNG, JPG, or JPEG up to 5MB</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl transition-all cursor-pointer"
                  >
                    Select Local File
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="selected"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full flex flex-col items-center gap-5"
                >
                  {/* File information panel */}
                  <div className="w-full flex items-center gap-3 p-3 bg-zinc-950/80 border border-zinc-900 rounded-xl">
                    <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="min-w-0 flex-1 text-left text-xs">
                      <p className="font-semibold text-white truncate">{fileName}</p>
                      <p className="text-zinc-500 font-medium">{fileSize}</p>
                    </div>
                    <button
                      onClick={clearSelection}
                      className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Visual preview */}
                  <div className="w-full max-h-[220px] rounded-xl border border-zinc-850 bg-zinc-950 overflow-hidden flex items-start justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={screenshotBase64}
                      alt="Capture Preview"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* URL Capture Form */}
          <div className="glass rounded-2xl p-6 border border-zinc-800 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Page URL (Optional)
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                <input
                  type="url"
                  placeholder="https://example.com/checkout"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#111113]/80 border border-[#27272A] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              <span className="text-[10px] text-zinc-500 block mt-1.5 leading-relaxed">
                Provide the reference URL. We associate this metadata with the final report dashboard.
              </span>
            </div>

            <button
              onClick={handleStartAudit}
              disabled={isLoading || !screenshotBase64}
              className="w-full py-3.5 bg-white hover:bg-zinc-200 disabled:opacity-50 text-[#09090B] font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-t-zinc-800 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                  Uploading & Starting...
                </>
              ) : (
                <>
                  Analyze Screenshot Layout
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Preset Selections */}
        <div className="glass rounded-2xl p-6 border border-zinc-800 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Recruiter Presets</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              No files ready? Select one of our preloaded design system templates to run an AI audit immediately.
            </p>
          </div>

          <div className="space-y-3.5">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetSelect(preset)}
                disabled={isLoading}
                className="w-full flex items-center gap-3.5 p-3 rounded-xl border border-zinc-900 bg-zinc-950/40 hover:border-zinc-850 hover:bg-zinc-950 transition-all text-left group cursor-pointer disabled:opacity-50"
              >
                <div className="w-16 h-10 rounded border border-zinc-900 bg-zinc-950 overflow-hidden relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preset.img}
                    alt={preset.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {preset.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 truncate">{preset.url}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-650 group-hover:text-white transition-colors" />
              </button>
            ))}
          </div>

          <div className="pt-2 text-[10px] text-zinc-500 leading-relaxed flex gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span>
              Preset audits leverage visual snapshots to generate genuine evaluations against the design templates.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
