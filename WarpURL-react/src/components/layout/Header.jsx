import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ChevronDown, Zap, Activity } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const h = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Warped out — see you next time!", { icon: "👋" });
    navigate("/auth");
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() || "WU";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60"
      style={{ background: "rgba(248,250,255,0.88)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3 group"
        >
          {/* Spinning logo mark */}
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent animate-spin-slow"
              style={{ borderTopColor: "#2563eb", borderRightColor: "rgba(37,99,235,0.2)" }}
            />
            <div
              className="absolute rounded-full border-2 border-transparent animate-spin-reverse"
              style={{ inset: 7, borderBottomColor: "#0ea5e9", borderLeftColor: "rgba(14,165,233,0.2)" }}
            />
            <Zap size={13} className="text-warp-600 relative z-10" />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="font-display font-bold text-xl text-slate-900 tracking-wide group-hover:text-warp-700 transition-colors">
              WARP
            </span>
            <span className="font-display font-medium text-sm text-warp-500 tracking-[0.2em]">
              URL
            </span>
          </div>
        </button>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Status badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
            style={{ background: "rgba(34,197,94,0.07)", borderColor: "rgba(34,197,94,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="font-display font-semibold text-[10px] uppercase tracking-wider text-green-600">
              Live
            </span>
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-full border transition-all duration-200 hover:shadow-glow"
              style={{
                background: "rgba(255,255,255,0.85)",
                borderColor: "rgba(37,99,235,0.25)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-display font-bold"
                style={{ background: "linear-gradient(135deg,#2563eb,#0ea5e9)" }}>
                {initials}
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700 pr-1">
                {user?.username}
              </span>
              <ChevronDown
                size={13}
                className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && (
              <div
                className="absolute right-0 top-[calc(100%+8px)] w-52 rounded-2xl overflow-hidden border animate-slide-down"
                style={{
                  background: "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(24px)",
                  borderColor: "rgba(37,99,235,0.2)",
                  boxShadow: "0 16px 48px rgba(15,23,42,0.12), 0 0 32px rgba(14,165,233,0.08)",
                }}
              >
                {/* User info */}
                <div className="flex items-center gap-3 p-4 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-display font-bold shrink-0"
                    style={{ background: "linear-gradient(135deg,#2563eb,#0ea5e9)" }}>
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{user?.username}</div>
                    <div className="text-xs text-slate-400 truncate">{user?.email || "Signed in"}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
