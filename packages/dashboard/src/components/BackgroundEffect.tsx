"use client";

export default function BackgroundEffect() {
  return (
    <div className="grain-overlay pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black select-none">
      {/* Animated gradient orb 1 — blue-purple, top-left */}
      <div
        className="absolute -left-[20%] -top-[10%] h-[800px] w-[800px] rounded-full opacity-[0.12]"
        style={{
          background:
            "radial-gradient(circle, rgba(80, 70, 230, 0.6) 0%, rgba(56, 120, 255, 0.3) 40%, transparent 70%)",
          animation: "orbDrift1 25s ease-in-out infinite",
        }}
      />

      {/* Animated gradient orb 2 — cyan, bottom-right */}
      <div
        className="absolute -bottom-[15%] -right-[15%] h-[700px] w-[700px] rounded-full opacity-[0.15]"
        style={{
          background:
            "radial-gradient(circle, rgba(34, 211, 238, 0.5) 0%, rgba(19, 154, 227, 0.25) 40%, transparent 70%)",
          animation: "orbDrift2 30s ease-in-out infinite",
        }}
      />

      {/* Subtle dot grid pattern */}
      <div className="dot-bg absolute inset-0 opacity-[0.03]" />

      {/* Radial vignette — center transparent, edges black */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_50%,rgba(0,0,0,0.85)_100%)]" />
    </div>
  );
}
