"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { isSupabaseConfigured } from "@/lib/supabase";

const loginSchema = zod.object({
  email: zod.string().email("Please enter a valid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters long"),
});

type LoginFormData = zod.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isMock = !isSupabaseConfigured();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await login(data.email, data.password);
      if (res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const res = await loginWithGoogle();
      if (res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass rounded-2xl p-8 shadow-2xl relative"
    >
      {/* Sandbox Warning Badge */}
      {isMock && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center gap-1.5 backdrop-blur-md">
          <ShieldAlert className="w-3.5 h-3.5 text-yellow-500" />
          <span className="text-[10px] font-semibold text-yellow-500 tracking-wider uppercase">Sandbox Demo Mode</span>
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
        <p className="text-sm text-zinc-400">
          Enter your credentials to access your dashboard
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-sm text-red-200">{error}</div>
        </motion.div>
      )}

      {isMock && (
        <div className="mb-6 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-xs text-blue-300 leading-relaxed">
          <strong>Tip:</strong> The app is in Sandbox Demo Mode since Supabase keys are not set up. You can log in using <strong>any</strong> mock email and password (e.g. <code>recruiter@example.com</code> / <code>password</code>).
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
            <input
              type="email"
              placeholder="name@company.com"
              {...register("email")}
              className="w-full pl-10 pr-4 py-3 bg-[#111113]/80 border border-[#27272A] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Password
            </label>
            <Link
              href="#"
              className="text-xs text-zinc-500 hover:text-white transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="w-full pl-10 pr-4 py-3 bg-[#111113]/80 border border-[#27272A] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-white hover:bg-zinc-200 text-[#09090B] font-medium rounded-xl text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:bg-white transition-all cursor-pointer shadow-lg"
        >
          {isLoading ? (
            <div className="w-5 h-5 rounded-full border-2 border-t-zinc-800 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800"></div>
        </div>
        <span className="relative px-3 bg-[#111113] text-xs text-zinc-500">
          Or continue with
        </span>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full py-3 bg-[#111113] hover:bg-[#18181b] border border-[#27272A] rounded-xl text-sm text-zinc-300 font-medium flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
      >
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Sign In with Google
      </button>

      <p className="mt-8 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-white hover:underline">
          Sign up for free
        </Link>
      </p>
    </motion.div>
  );
}
