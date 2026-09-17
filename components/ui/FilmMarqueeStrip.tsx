"use client";

const TITLES = [
  "OPPENHEIMER", "MAD MAX: FURY ROAD", "TOP GUN: MAVERICK", "AVATAR",
  "MISSION: IMPOSSIBLE", "JOHN WICK", "SPIDER-MAN", "THE BATMAN",
  "DUNE: PART TWO", "INCEPTION", "INTERSTELLAR", "THE DARK KNIGHT",
  "PARASITE", "EVERYTHING EVERYWHERE", "THE WHALE", "BABYLON",
  "TENET", "BARBIE", "KILLERS OF THE FLOWER MOON", "POOR THINGS",
];

const SEP = "▸";

const strip = TITLES.map((t) => `${t} ${SEP}`).join(" ");
const doubled = `${strip} ${strip}`;

export function FilmMarqueeStrip({ className = "" }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden select-none py-3 border-y border-border/50 ${className}`}
      aria-hidden="true"
    >
      <div
        className="animate-marquee whitespace-nowrap flex gap-0"
        style={{ "--marquee-duration": "38s" } as React.CSSProperties}
      >
        <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.18em] text-text-muted/60">
          {doubled}
        </span>
      </div>
    </div>
  );
}
