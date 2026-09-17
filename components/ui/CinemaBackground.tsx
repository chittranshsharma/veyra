export function CinemaBackground() {
  return (
    <div
      aria-hidden="true"
      className="cinema-bg-container"
    >
      {/* 1. Bespoke Cinema Wallpaper (dark bg.webp in Dark mode / sakura bg.webp in Sakura mode) */}
      <div className="absolute inset-0 cinema-wallpaper-layer" />

      {/* 2. Soft center contrast scrim (keeps foreground text & cards 100% readable) */}
      <div className="absolute inset-0 cinema-contrast-scrim" />

      {/* 3. Tactile 35mm Film Grain Texture */}
      <div className="absolute inset-0 cinema-grain-layer" />

      {/* 4. Soft Edge Vignette */}
      <div className="absolute inset-0 cinema-vignette-layer" />
    </div>
  );
}
