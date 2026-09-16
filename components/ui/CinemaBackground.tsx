export function CinemaBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* 1. Cinematic Ambient Spotlight (Top Projection Cone) */}
      <div
        className="absolute -top-[220px] left-1/2 -translate-x-1/2 w-[1100px] h-[650px] rounded-full blur-[140px] opacity-45 transition-all duration-700"
        style={{
          background:
            "radial-gradient(circle, var(--accent) 0%, var(--accent-dim) 55%, transparent 75%)",
        }}
      />

      {/* 2. Secondary Atmospheric Light Pods (Ethereal Depth) */}
      <div className="absolute top-[35%] -left-[180px] w-[600px] h-[600px] rounded-full blur-[160px] opacity-25 transition-all duration-700 cinema-nebula-left" />
      <div
        className="absolute bottom-[-100px] -right-[120px] w-[700px] h-[550px] rounded-full blur-[150px] opacity-25 transition-all duration-700"
        style={{
          background:
            "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
        }}
      />

      {/* 3. Bespoke Cinema Tile Pattern Layer (Film reels, V monograms, clappers, tickets) */}
      <div className="absolute inset-0 cinema-tile-layer" />

      {/* 4. Tactile 35mm Film Grain Texture */}
      <div className="absolute inset-0 cinema-grain-layer" />

      {/* 5. Edge Vignette (focuses viewer on center stage) */}
      <div className="absolute inset-0 cinema-vignette-layer" />
    </div>
  );
}
