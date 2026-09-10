"use client";

import { useState } from "react";
import { Sparkles, Zap, ArrowRight, Compass } from "lucide-react";
import { AiConciergeModal } from "./AiConciergeModal";

export function HomeAiBanner() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section className="mx-4 sm:mx-8 mt-6">
        <div
          onClick={() => setIsOpen(true)}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-purple-500/25 bg-gradient-to-r from-surface via-purple-950/20 to-surface p-5 sm:p-6 transition-all hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10"
        >
          {/* Ambient background glow */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-purple-500/15 blur-3xl pointer-events-none group-hover:bg-purple-500/25 transition" />
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl pointer-events-none group-hover:bg-accent/20 transition" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent via-purple-500 to-indigo-500 text-background shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
                <Sparkles size={22} className="animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base sm:text-lg font-bold text-white group-hover:text-accent transition-colors">
                    Don&apos;t know what to watch? Ask Veyra AI
                  </h3>
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/30">
                    <Zap size={10} fill="currentColor" />
                    Groq LPU
                  </span>
                </div>
                <p className="text-xs text-muted">
                  Type any vibe, scene, or combo — &ldquo;a mind-bending thriller with a crazy plot twist&rdquo;
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-background shadow-lg shadow-accent/20 group-hover:brightness-110 transition">
                <Compass size={14} />
                Match My Vibe
                <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </section>

      <AiConciergeModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
