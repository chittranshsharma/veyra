"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Users, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface WatchPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function generateRandomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let res = "";
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

export function WatchPartyModal({ isOpen, onClose }: WatchPartyModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setCode("");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 120);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setCode(raw);
    setError("");
  };

  const handleJoin = async () => {
    if (code.length !== 6) {
      setError("Please enter the full 6-character code.");
      return;
    }
    setJoining(true);
    router.push(`/party/${code}`);
    onClose();
  };

  const handleCreateNew = () => {
    const newCode = generateRandomCode();
    setJoining(true);
    router.push(`/party/${newCode}?host=true`);
    onClose();
  };

  // Format code display as "ABC 123"
  const displayCode =
    code.length > 3 ? `${code.slice(0, 3)} ${code.slice(3)}` : code;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 p-7 shadow-2xl shadow-black/70"
            style={{ background: "var(--bg-surface)" }}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-muted hover:text-text-primary transition"
              aria-label="Close"
            >
              <X size={15} />
            </button>

            {/* Content */}
            <div className="text-center space-y-5">
              <div className="text-5xl animate-bounce">🍿</div>
              <div>
                <h2 className="font-display font-black text-2xl text-text-primary">
                  Watch Party Lounge
                </h2>
                <p className="mt-1 text-xs text-text-secondary">
                  Join a shared cinema lounge to chat, react, and browse titles together with friends.
                </p>
              </div>

              {/* Code input */}
              <div className="space-y-2 text-left">
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Enter 6-Character Party Code:
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="text"
                  value={displayCode}
                  onChange={handleInput}
                  placeholder="ABC 123"
                  maxLength={7}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleJoin();
                  }}
                  className={`w-full rounded-2xl border px-4 py-3.5 text-center text-2xl font-black tracking-[0.25em] outline-none transition ${
                    error
                      ? "border-red-500/50 bg-red-500/10 text-red-400"
                      : "border-border bg-surface2 text-text-primary focus:border-accent/80 focus:ring-2 focus:ring-accent/20"
                  }`}
                  style={{ background: "var(--bg-surface2)" }}
                />
                {error && (
                  <p className="text-xs text-red-400 text-center">{error}</p>
                )}
              </div>

              {/* Join button */}
              <button
                onClick={handleJoin}
                disabled={joining || code.length !== 6}
                className="w-full rounded-xl bg-accent py-3.5 text-sm font-bold text-[var(--on-accent)] hover:opacity-90 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-accent/25"
              >
                {joining ? "Connecting to Room…" : "Join Party Room"}
              </button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-surface px-2 text-[10px] font-bold text-text-muted">
                    or host your own
                  </span>
                </div>
              </div>

              {/* Create New Party button */}
              <button
                type="button"
                onClick={handleCreateNew}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface2 py-3 text-xs font-bold text-text-primary hover:border-accent hover:text-accent active:scale-95 transition"
              >
                <Sparkles size={14} className="text-accent" />
                Create New Party Room
                <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
