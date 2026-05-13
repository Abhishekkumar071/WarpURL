import { useRef } from "react";
import WarpSpinner from "./WarpSpinner";

const variants = {
  primary:   "btn-primary",
  secondary: "btn-secondary",
  ghost:     "btn-ghost",
  danger:
    "relative overflow-hidden inline-flex items-center justify-center gap-2 font-display font-semibold uppercase tracking-widest text-white rounded-xl px-5 py-2.5 text-sm cursor-pointer border-none transition-all duration-200 bg-gradient-to-br from-red-500 to-orange-500 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
};

const sizes = {
  sm: { padding: "8px 16px", fontSize: "12px" },
  md: { padding: "12px 24px", fontSize: "14px" },
  lg: { padding: "16px 32px", fontSize: "15px" },
};

export default function Button({
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  style = {},
  ...props
}) {
  const ref = useRef(null);

  const handleClick = (e) => {
    if (loading || disabled) return;
    // Ripple
    const btn = ref.current;
    const rect = btn.getBoundingClientRect();
    const diameter = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - diameter / 2;
    const y = e.clientY - rect.top - diameter / 2;
    const span = document.createElement("span");
    span.style.cssText = `
      position:absolute;width:${diameter}px;height:${diameter}px;
      left:${x}px;top:${y}px;border-radius:50%;
      background:rgba(255,255,255,0.3);pointer-events:none;
      animation:ripple-anim 0.55s ease-out forwards;
    `;
    btn.appendChild(span);
    setTimeout(() => span.remove(), 600);
    onClick?.(e);
  };

  return (
    <>
      <style>{`@keyframes ripple-anim{0%{transform:scale(0);opacity:0.6}100%{transform:scale(4);opacity:0}}`}</style>
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        onClick={handleClick}
        className={`${variants[variant]} ${fullWidth ? "w-full" : ""} ${loading ? "opacity-80" : ""} ${className}`}
        style={{ ...sizes[size], ...style }}
        {...props}
      >
        {loading && <WarpSpinner size={16} />}
        <span className="flex items-center gap-1.5">{children}</span>
      </button>
    </>
  );
}
