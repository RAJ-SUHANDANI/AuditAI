"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Key, Database, User, ShieldAlert, Sparkles, Save, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load existing settings if configured locally
    if (typeof window !== "undefined") {
      setSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
      setSupabaseAnonKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
      // Or check local overrides if any
      const gemini = localStorage.getItem("auditai_override_gemini_key") || "";
      setGeminiApiKey(gemini);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      if (geminiApiKey) {
        localStorage.setItem("auditai_override_gemini_key", geminiApiKey);
      } else {
        localStorage.removeItem("auditai_override_gemini_key");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-sm text-zinc-400">
          Manage your account profile and custom API integrations
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="glass rounded-2xl p-6 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-900/60">
            <User className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-white">User Profile</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-zinc-500 block mb-1 font-medium">Full Name</span>
              <div className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-300 font-semibold select-all">
                {user?.full_name || "N/A"}
              </div>
            </div>
            <div>
              <span className="text-zinc-500 block mb-1 font-medium">Email Address</span>
              <div className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-zinc-300 font-semibold select-all">
                {user?.email || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* API keys configuration form */}
        <form onSubmit={handleSave} className="glass rounded-2xl p-6 border border-zinc-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-900/60">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-white">API Keys overrides</h3>
            </div>
            <span className="text-[10px] text-zinc-500">Stored locally in browser</span>
          </div>

          <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-xl text-xs text-amber-300 leading-relaxed flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong>Production Note:</strong> By default, this deployment is configured to run in <strong>Sandbox Mode</strong>. To connect this interface to your own Google AI Studio instance for live screenshot analysis, paste your Gemini API Key below.
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Google Gemini API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <span className="text-[10px] text-zinc-500 block mt-1.5 leading-relaxed">
                Retrieve a free API key from the{" "}
                <a
                  href="https://aistudio.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Google AI Studio console
                </a>.
              </span>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 text-zinc-400 text-xs mb-3">
                <Database className="w-3.5 h-3.5 text-zinc-500" />
                <span>Supabase Database Status</span>
              </div>
              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-medium">Auto fallback client URL</span>
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-mono">
                  {supabaseUrl || "Placeholder sandbox"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-900/60">
            {saved ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Settings saved successfully!
              </span>
            ) : (
              <span className="text-[10px] text-zinc-500 leading-relaxed max-w-sm">
                Overrides apply to your client audit pipeline requests immediately on submit.
              </span>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-lg"
            >
              <Save className="w-3.5 h-3.5" />
              Save overrides
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
