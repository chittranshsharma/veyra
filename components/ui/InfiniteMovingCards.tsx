"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Star, Sparkles, Quote, ArrowUpRight } from "lucide-react";

export interface InfiniteCardItem {
  quote: string;
  title: string;
  subtitle?: string;
  characterOrPerson?: string;
  year?: string;
  rating?: number;
  badge?: string;
  href?: string;
}

interface InfiniteMovingCardsProps {
  items: InfiniteCardItem[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}

export function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "normal",
  pauseOnHover = true,
  className = "",
}: InfiniteMovingCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    addAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      // Duplicate each card once to ensure continuous seamless loop
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      applyDirection();
      applySpeed();
      setStart(true);
    }
  }

  const applyDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty("--animation-direction", "forwards");
      } else {
        containerRef.current.style.setProperty("--animation-direction", "reverse");
      }
    }
  };

  const applySpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "25s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "45s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`scroller relative z-20 max-w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)] ${className}`}
    >
      <ul
        ref={scrollerRef}
        className={`flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap ${
          start ? "animate-scroll" : ""
        } ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""}`}
      >
        {items.map((item, idx) => {
          const CardContent = (
            <div
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border)",
              }}
              className="group relative flex h-full flex-col justify-between rounded-2xl border p-5 sm:p-6 transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
            >
              {/* Card top: Badge & Quote Icon */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-1.5">
                  {item.badge ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold text-accent border border-accent/25 uppercase tracking-wider">
                      <Sparkles size={10} />
                      {item.badge}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500">
                      <Star size={12} fill="currentColor" />
                      {item.rating ? item.rating.toFixed(1) : "9.0"}
                    </span>
                  )}
                </div>

                <Quote size={18} className="text-text-muted/40 group-hover:text-accent/60 transition-colors" />
              </div>

              {/* Quote text */}
              <blockquote className="text-xs sm:text-sm font-medium italic text-text-primary leading-relaxed line-clamp-3 mb-4">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              {/* Card footer: Movie / Character details */}
              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <div>
                  <h4 className="font-display text-xs font-bold text-text-primary group-hover:text-accent transition-colors flex items-center gap-1">
                    <span>{item.title}</span>
                    {item.year && (
                      <span className="text-[11px] font-normal text-text-muted">
                        ({item.year})
                      </span>
                    )}
                  </h4>
                  {item.characterOrPerson && (
                    <p className="text-[11px] text-text-muted truncate max-w-[200px]">
                      {item.characterOrPerson}
                    </p>
                  )}
                </div>

                {item.href && (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface2 text-text-muted group-hover:bg-accent group-hover:text-[var(--on-accent)] transition-all">
                    <ArrowUpRight size={13} />
                  </span>
                )}
              </div>
            </div>
          );

          return (
            <li
              key={idx}
              className="w-[300px] sm:w-[380px] max-w-full shrink-0 list-none"
            >
              {item.href ? (
                <Link href={item.href} className="block h-full">
                  {CardContent}
                </Link>
              ) : (
                CardContent
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
