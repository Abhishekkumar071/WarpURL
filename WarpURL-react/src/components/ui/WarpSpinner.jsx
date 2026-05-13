export default function WarpSpinner({ size = 40, className = "" }) {
  const s = size;
  const ring = Math.round(s * 0.18);

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: s, height: s }}
    >
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full border-2 border-transparent animate-spin-slow"
        style={{
          borderTopColor: "#0ea5e9",
          borderRightColor: "rgba(14,165,233,0.25)",
          filter: "drop-shadow(0 0 4px #0ea5e9)",
        }}
      />
      {/* Middle ring */}
      <div
        className="absolute rounded-full border-2 border-transparent animate-spin-reverse"
        style={{
          inset: ring,
          borderBottomColor: "#3b82f6",
          borderLeftColor: "rgba(59,130,246,0.25)",
          filter: "drop-shadow(0 0 3px #3b82f6)",
        }}
      />
      {/* Inner ring */}
      <div
        className="absolute rounded-full border-2 border-transparent animate-spin-fast"
        style={{
          inset: ring * 2,
          borderTopColor: "#06b6d4",
          borderRightColor: "rgba(6,182,212,0.25)",
          filter: "drop-shadow(0 0 2px #06b6d4)",
        }}
      />
      {/* Core dot */}
      <div
        className="rounded-full animate-pulse-glow"
        style={{
          width: Math.max(4, Math.round(s * 0.18)),
          height: Math.max(4, Math.round(s * 0.18)),
          background: "radial-gradient(circle, #0ea5e9, #3b82f6)",
        }}
      />
    </div>
  );
}
