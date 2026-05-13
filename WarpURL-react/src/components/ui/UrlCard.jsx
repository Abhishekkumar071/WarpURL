import { useState } from "react";
import { Copy, Check, BarChart2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function UrlCard({ url, onAnalytics, index }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url.shortUrl);
      setCopied(true);
      toast.success("Copied!", { icon: "📋", duration: 1500 });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  const truncate = (str, n = 60) =>
    str?.length > n ? str.slice(0, n) + "…" : str;

  const date = url.createdDate
    ? format(new Date(url.createdDate), "MMM d, yyyy")
    : "—";

  return (
    <div
      onClick={() => onAnalytics(url)}
      className="glass-card p-4 flex items-center gap-4 cursor-pointer group transition-all duration-200 hover:-translate-y-0.5"
      style={{
        animationDelay: `${index * 0.055}s`,
        animationFillMode: "both",
        animation: "fade-up 0.5s cubic-bezier(0.4,0,0.2,1) both",
      }}
    >
      {/* Left accent bar — appears on hover */}
      <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b from-warp-600 to-warp-neon opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Favicon */}
      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
        <img
          src={`https://www.google.com/s2/favicons?domain=${url.originalUrl}&sz=32`}
          alt=""
          className="w-5 h-5 object-contain"
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <span className="text-base hidden">🔗</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <a
            href={url.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="font-mono-custom text-sm font-bold text-warp-600 hover:text-warp-700 hover:underline flex items-center gap-1"
          >
            {url.shortUrl}
            <ExternalLink size={10} className="opacity-60" />
          </a>
        </div>
        <p className="text-xs text-slate-400 truncate" title={url.originalUrl}>
          {truncate(url.originalUrl)}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[10px] text-slate-400 font-mono-custom">📅 {date}</span>
          <span className="text-[10px] text-slate-400 font-mono-custom">👤 {url.username}</span>
        </div>
      </div>

      {/* Clicks badge */}
      <div className="shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border"
        style={{
          background: "rgba(239,246,255,0.8)",
          borderColor: "rgba(191,219,254,0.8)",
          minWidth: 56,
        }}>
        <span className="font-display font-bold text-xl text-warp-600 leading-none">
          {url.clickCount ?? 0}
        </span>
        <span className="font-display text-[9px] uppercase tracking-wider text-warp-400 mt-0.5">
          clicks
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleCopy}
          title="Copy short URL"
          className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all duration-150 ${
            copied
              ? "bg-green-50 border-green-300 text-green-600"
              : "bg-white border-slate-200 text-slate-400 hover:border-warp-300 hover:text-warp-500 hover:shadow-glow"
          }`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onAnalytics(url); }}
          title="View analytics"
          className="w-9 h-9 flex items-center justify-center rounded-xl border bg-white border-slate-200 text-slate-400 hover:border-warp-300 hover:text-warp-500 hover:shadow-glow transition-all duration-150"
        >
          <BarChart2 size={14} />
        </button>
      </div>
    </div>
  );
}
