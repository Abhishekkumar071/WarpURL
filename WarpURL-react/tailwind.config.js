/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Rajdhani'", "sans-serif"],
        mono: ["'Space Mono'", "monospace"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        warp: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          neon: "#0ea5e9",
          electric: "#06b6d4",
        },
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "spin-reverse": "spin-reverse 2s linear infinite",
        "spin-fast": "spin 1s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "gradient": "gradient-shift 4s ease infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(0.4,0,0.2,1) both",
        "scale-in": "scale-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
        "slide-down": "slide-down 0.3s cubic-bezier(0.4,0,0.2,1) both",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        "spin-reverse": { to: { transform: "rotate(-360deg)" } },
        "pulse-glow": {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.6", transform: "scale(1.1)" },
        },
        "float": {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "gradient-shift": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backdropBlur: { xs: "4px" },
      boxShadow: {
        glow: "0 0 20px rgba(14,165,233,0.25), 0 0 60px rgba(14,165,233,0.08)",
        "glow-lg": "0 0 40px rgba(14,165,233,0.4), 0 0 100px rgba(14,165,233,0.15)",
        "blue-sm": "0 4px 16px rgba(37,99,235,0.25)",
        "blue-md": "0 8px 32px rgba(37,99,235,0.35)",
        glass: "0 4px 24px rgba(37,99,235,0.08), 0 1px 4px rgba(15,23,42,0.04)",
      },
    },
  },
  plugins: [],
};
