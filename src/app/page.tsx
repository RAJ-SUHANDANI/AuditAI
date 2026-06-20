"use client";

import React, { useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import Faq from "@/components/landing/Faq";
import Footer from "@/components/landing/Footer";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="relative min-h-screen bg-[#09090B] text-white flex flex-col font-sans overflow-x-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-zinc-950 to-zinc-950 pointer-events-none"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a08_1px,transparent_1px),linear-gradient(to_bottom,#27272a08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      {/* Shared Components */}
      <Navbar />
      
      <main className="flex-1 w-full">
        <Hero />
        <Features />
        <Pricing />
        <Faq />
      </main>

      <Footer />
    </div>
  );
}
